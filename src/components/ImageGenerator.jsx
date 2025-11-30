import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Image,
  Download,
  RefreshCw,
  ZoomIn,
  X,
  Sparkles,
  Palette,
  Clock,
  DownloadCloud,
  Calendar,
} from "lucide-react";
import { useImage } from "../context/ImageContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ImageGenerator = () => {
  const { generateImage, loading, error } = useImage();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [popup, setPopup] = useState({ isOpen: false, type: "", message: "" });

  const categories = [
    { id: "all", name: "All Images" },
    { id: "art", name: "Digital Art" },
    { id: "photo", name: "Photorealistic" },
    { id: "abstract", name: "Abstract" },
    { id: "nature", name: "Nature" },
    { id: "fantasy", name: "Fantasy" },
  ];

  const promptSuggestions = [
    "A mystical forest with glowing mushrooms and fairies",
    "Cyberpunk cityscape at night with neon lights",
    "Majestic dragon flying over medieval castle",
    "Underwater coral reef with tropical fish",
    "Futuristic spaceship landing on alien planet",
    "Sunset over mountains with vibrant colors",
    "Steampunk mechanical owl with brass gears",
    "Magical library with floating books",
  ];

  const showPopup = (type, message) => {
    setPopup({ isOpen: true, type, message });
  };

  const fetchImages = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching images:", error.message);
    } else {
      setImages(data || []);
    }
  };

  const saveImage = async (url, prompt) => {
    if (!user.id) return;
    await supabase
      .from("ai_images")
      .insert({ user_id: user.id, url, prompt })
      .select();
    fetchImages();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    console.log(`Starting image generation with prompt: "${prompt}"`);
    const url = await generateImage(prompt);
    if (url) {
      console.log(`Image generated successfully at: ${url}`);
      saveImage(url, prompt);
      showPopup("generate", "Image Generated Successfully!");
    } else {
      console.log("Image generation failed");
    }
    setPrompt("");
  };

  const filteredImages = images
    .filter((img) => {
      if (selectedCategory === "all") return true;
      return img.prompt.toLowerCase().includes(selectedCategory);
    })
    .sort((a, b) => {
      if (sortBy === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (popup.isOpen) {
      const timer = setTimeout(() => {
        setPopup({ isOpen: false, type: "", message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.isOpen]);

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

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalContentVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 400 },
    },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
    if (type === "download") {
      return (
        <div className="flex items-center gap-3 font-semibold text-white">
          <DownloadCloud className="w-5 h-5" />
          <span>{popup.message}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-3 sm:p-4 md:p-6">
      <AnimatePresence>
        {popup.isOpen && (
          <motion.div
            key={popup.type}
            className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 sm:w-auto"
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold text-sm sm:text-lg md:text-xl ${
                popup.type === "generate"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
            >
              <PopupContent type={popup.type} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-white/60">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6 shadow-lg"
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-4">
              AI Image Generator
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
              Transform your imagination into stunning visuals with AI-powered
              image generation
            </p>
          </div>

          <form onSubmit={handleGenerate} className="mb-6 sm:mb-8 md:mb-12">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 md:pr-32 py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-1 sm:right-2 top-1 sm:top-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2 md:py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-xs sm:text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
                    <span className="hidden sm:inline">Creating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Generate</span>
                    <span className="sm:hidden">Go</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {promptSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(suggestion)}
                  className="p-2 sm:p-3 text-xs sm:text-sm text-left bg-white/50 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </form>

          {error && (
            <motion.div
              className="mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm md:text-base"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4 flex-wrap">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-600" />
              <span>Your Generated Images</span>
              <span className="text-gray-500 text-sm sm:text-base md:text-xl">
                ({filteredImages.length})
              </span>
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm text-xs sm:text-sm md:text-base w-full sm:w-auto"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 md:py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm text-xs sm:text-sm md:text-base w-full sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {filteredImages.length === 0 ? (
            <div className="text-center py-10 sm:py-16 md:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Image className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 text-purple-300" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 mb-2 sm:mb-3">
                {selectedCategory === "all"
                  ? "No images created yet"
                  : "No images in this category"}
              </h3>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            >
              <AnimatePresence>
                {filteredImages.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={cardVariants}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full h-40 sm:h-48 md:h-52 lg:h-56 object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                        onClick={() => setSelectedImage(img)}
                      />
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 border-t border-gray-100">
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 line-clamp-2 h-8 sm:h-10">
                        {img.prompt}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {new Date(img.created_at).toLocaleDateString()}
                        </div>
                        <a
                          href={`ai_image_${img.id}.png`}
                          download={`ai_image_${img.id}.png`}
                          onClick={(e) => {
                            e.stopPropagation();
                            showPopup("download", "Download Started!");
                          }}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-purple-50"
                          title="Download image"
                        >
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] max-h-[900px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">
                      {selectedImage.prompt}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(
                          selectedImage.created_at
                        ).toLocaleDateString()}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedImage.created_at).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={`ai_image_${selectedImage.id}.png`}
                      download={`ai_image_${selectedImage.id}.png`}
                      onClick={() => showPopup("download", "Download Started!")}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gray-50 min-h-0">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-full max-w-4xl h-[60vh] max-h-[600px] flex items-center justify-center">
                      <img
                        src={selectedImage.url}
                        alt={selectedImage.prompt}
                        className="w-[80%] sm:w-fit max-h-full object-contain rounded-2xl shadow-lg bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
                  <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 line-clamp-1">
                      "{selectedImage.prompt}"
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedImage.created_at).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedImage.created_at).toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageGenerator;
