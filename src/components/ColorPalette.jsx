import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Palette,
  Copy,
  RefreshCw,
  Save,
  History,
  Trash2,
  Download,
  Share2,
  Calendar,
  Search,
  X,
  CheckCircle,
  Sparkles,
  TrashIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ColorPalette = () => {
  const [palettes, setPalettes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [copiedColor, setCopiedColor] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [popup, setPopup] = useState({ isOpen: false, type: "", message: "" });
  const { user } = useAuth();

  const showPopup = (type, message) => {
    setPopup({ isOpen: true, type, message });
  };

  const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, "0")}`;
  };

  const generatePalette = () => {
    setLoading(true);
    setTimeout(() => {
      const newPalette = {
        id: Date.now(),
        colors: Array.from({ length: 5 }, () => generateRandomColor()),
        created_at: new Date().toISOString(),
      };
      setPalettes((prev) => [newPalette, ...prev]);
      setLoading(false);
      showPopup("generate", "New Palette Generated!");
    }, 600);
  };

  const savePalette = async (paletteId, colors) => {
    if (!user?.id) return;
    setSavingId(paletteId);

    try {
      const newId = `palette_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const { error } = await supabase.from("color_palettes").insert({
        id: newId,
        colors: colors,
        user_id: user.id,
      });

      if (error) {
        console.error("Supabase error:", error);
        const { error: textError } = await supabase
          .from("color_palettes")
          .insert({
            id: newId,
            colors: JSON.stringify(colors),
            user_id: user.id,
          });

        if (textError) {
          console.error("Text error:", textError);
          const pgArray = `{${colors.map((color) => `"${color}"`).join(",")}}`;
          const { error: arrayError } = await supabase
            .from("color_palettes")
            .insert({
              id: newId,
              colors: pgArray,
              user_id: user.id,
            });

          if (arrayError) {
            console.error("Array error:", arrayError);
          } else {
            fetchHistory();
            showPopup("save", "Palette Saved Successfully!");
          }
        } else {
          fetchHistory();
          showPopup("save", "Palette Saved Successfully!");
        }
      } else {
        fetchHistory();
        showPopup("save", "Palette Saved Successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
    }

    setSavingId(null);
  };

  const fetchHistory = async () => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("color_palettes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        setHistory([]);
      } else {
        const parsedData = data.map((item) => {
          let parsedColors = item.colors;
          if (typeof item.colors === "string") {
            try {
              parsedColors = JSON.parse(item.colors);
            } catch (e) {
              if (item.colors.startsWith("{") && item.colors.endsWith("}")) {
                parsedColors = item.colors
                  .substring(1, item.colors.length - 1)
                  .split(",")
                  .map((color) => color.replace(/^"|"$/g, ""));
              } else {
                parsedColors = [item.colors];
              }
            }
          }
          return { ...item, colors: parsedColors };
        });
        setHistory(parsedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setHistory([]);
    }
  };

  const deleteFromHistory = async (paletteId) => {
    if (!user?.id) return;
    try {
      await supabase
        .from("color_palettes")
        .delete()
        .eq("id", paletteId)
        .eq("user_id", user.id);
      setHistory((prev) => prev.filter((p) => p.id !== paletteId));
      showPopup("delete", "Palette Removed");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const clearAllHistory = async () => {
    if (!user?.id) return;
    try {
      await supabase.from("color_palettes").delete().eq("user_id", user.id);
      setHistory([]);
      showPopup("delete", "All Palettes Cleared");
    } catch (err) {
      console.error("Clear all error:", err);
    }
  };

  const handleCopyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const filterByPeriod = (palette) => {
    const now = new Date();
    const paletteDate = new Date(palette.created_at);
    const diffTime = Math.abs(now - paletteDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (selectedPeriod === "today") return diffDays <= 1;
    if (selectedPeriod === "week") return diffDays <= 7;
    if (selectedPeriod === "month") return diffDays <= 30;
    return true;
  };

  const filteredHistory = history
    .filter(
      (palette) =>
        filterByPeriod(palette) &&
        palette.colors.some((c) =>
          c.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "color-palette-history.json";
    link.href = url;
    link.click();
  };

  const sharePalette = async (palette) => {
    const paletteText = `Color Palette: ${palette.colors.join(", ")}`;
    if (navigator.share) {
      await navigator.share({
        title: "Color Palette",
        text: paletteText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(paletteText);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (popup.isOpen) {
      const timer = setTimeout(() => {
        setPopup({ isOpen: false, type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.isOpen]);

  useEffect(() => {
    if (selectedPalette) {
      const timer = setTimeout(() => {
        setSelectedPalette(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedPalette]);

  const popupVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } },
  };

  const PopupContent = ({ type }) => {
    if (type === "generate") {
      return (
        <div className="flex items-center gap-3 font-semibold text-white">
          <Sparkles className="w-5 h-5" />
          <span>{popup.message}</span>
        </div>
      );
    }
    if (type === "save") {
      return (
        <div className="flex items-center gap-3 font-semibold text-white">
          <CheckCircle className="w-5 h-5" />
          <span>{popup.message}</span>
        </div>
      );
    }
    if (type === "delete") {
      return (
        <div className="flex items-center gap-3 font-semibold text-white">
          <TrashIcon className="w-5 h-5" />
          <span>{popup.message}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 md:p-6">
      <AnimatePresence>
        {popup.isOpen && (
          <motion.div
            key={popup.type}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-lg sm:text-xl ${
                popup.type === "generate"
                  ? "bg-linear-to-r from-purple-500 to-indigo-600"
                  : popup.type === "save"
                  ? "bg-linear-to-r from-green-500 to-emerald-600"
                  : "bg-linear-to-r from-red-500 to-pink-600"
              }`}
            >
              <PopupContent type={popup.type} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 mb-10 border border-white/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="w-full lg:w-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <Palette className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                Color Palette Generator
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Create beautiful color combinations instantly
              </p>
            </div>
            <button
              onClick={generatePalette}
              disabled={loading}
              className="w-full lg:w-auto bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                  Generate Palette
                </>
              )}
            </button>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {palettes.map((palette) => (
              <div
                key={palette.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="flex h-24 sm:h-32">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 relative group cursor-pointer transition-all duration-300 hover:flex-2"
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopyColor(color)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20">
                        <span className="bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                          {color}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 sm:p-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(palette.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => savePalette(palette.id, palette.colors)}
                      disabled={savingId === palette.id}
                      className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {savingId === palette.id ? (
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {savingId === palette.id ? "Saving..." : "Save"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-white/60">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <History className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                Palette History
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Your saved color palette collection
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={exportHistory}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                  placeholder="Search colors or palettes..."
                />
              </div>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredHistory.map((palette) => (
              <div
                key={palette.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedPalette(palette)}
              >
                <div className="flex h-20 sm:h-24">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 transition-all duration-300 hover:flex-2"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        {palette.colors.length} Colors
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(palette.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sharePalette(palette);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(palette.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? "No matching palettes" : "No history yet"}
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm
                  ? "Try a different search term"
                  : "Start by generating and saving some color palettes"}
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedPalette && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 40 }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-xs sm:max-w-md md:max-w-lg p-5 sm:p-8 shadow-2xl border border-indigo-200/70"
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Palette Details
                  </h3>
                  <button
                    onClick={() => setSelectedPalette(null)}
                    className="p-2 rounded-lg hover:bg-indigo-50 transition"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex h-20 sm:h-24 md:h-28 mb-5 sm:mb-6 rounded-xl overflow-hidden border border-indigo-200/60">
                  {selectedPalette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                  {selectedPalette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-xl border border-indigo-200/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-indigo-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm sm:text-base font-mono text-gray-700">
                          {color}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyColor(color)}
                        className="p-2 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedPalette(null)}
                  className="w-full mt-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  Close Palette
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {copiedColor && (
          <div className="fixed bottom-6 right-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
            <Copy className="w-4 h-4" />
            Copied {copiedColor}
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;
