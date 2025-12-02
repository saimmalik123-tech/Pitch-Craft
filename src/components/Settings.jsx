import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import {
  Settings as SettingsIcon,
  User,
  Trash2,
  Download,
  Check,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [vipPopup, setVipPopup] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const showVIPPopup = (text, type) => {
    setVipPopup({ text, type });
    setTimeout(() => setVipPopup(null), 3000);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    showVIPPopup(text, type);
  };

  const updateName = async () => {
    if (!name.trim()) return showMessage("Name cannot be empty", "error");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (error) throw error;
      showMessage("Name updated successfully!", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateEmail = async () => {
    if (!email.includes("@")) return showMessage("Invalid email", "error");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      showMessage("Check your email to confirm change", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setShowDeleteConfirmation(true);
  };

  const confirmClearData = async () => {
    if (deleteConfirmation !== "DELETE") return;

    setShowDeleteConfirmation(false);
    setDeleteConfirmation("");
    setLoading(true);
    try {
      await Promise.all([
        supabase.from("pitches").delete().eq("user_id", user.id),
        supabase.from("saved_pitches").delete().eq("user_id", user.id),
        supabase.from("ai_images").delete().eq("user_id", user.id),
        supabase.from("color_palettes").delete().eq("user_id", user.id),
      ]);
      showMessage("All data cleared!", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const exportAsJSON = async () => {
    setLoading(true);
    try {
      const [pitches, saved, images, palettes] = await Promise.all([
        supabase.from("pitches").select("*").eq("user_id", user.id),
        supabase.from("saved_pitches").select("*").eq("user_id", user.id),
        supabase.from("ai_images").select("*").eq("user_id", user.id),
        supabase.from("color_palettes").select("*").eq("user_id", user.id),
      ]);

      const data = {
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || "Unknown",
        },
        data: {
          pitches: pitches.data || [],
          saved_pitches: saved.data || [],
          ai_images: images.data || [],
          color_palettes: palettes.data || [],
        },
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitchcraft_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("Data exported as JSON!", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
      setShowExportOptions(false);
    }
  };

  const exportAsPDF = async () => {
    setLoading(true);
    try {
      const [pitches, saved, images, palettes] = await Promise.all([
        supabase.from("pitches").select("*").eq("user_id", user.id),
        supabase.from("saved_pitches").select("*").eq("user_id", user.id),
        supabase.from("ai_images").select("*").eq("user_id", user.id),
        supabase.from("color_palettes").select("*").eq("user_id", user.id),
      ]);

      const pdf = new jsPDF();

      pdf.setFontSize(24);
      pdf.text("PitchCraft Data Export", 20, 30);

      pdf.setFontSize(12);
      pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 40);
      pdf.text(`User: ${user.email}`, 20, 50);

      let yPosition = 70;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;

      const addNewPageIfNeeded = () => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
      };

      pdf.setFontSize(16);
      pdf.text("Pitches", margin, yPosition);
      yPosition += lineHeight + 5;

      pdf.setFontSize(11);
      const pitchesData = pitches.data || [];
      if (pitchesData.length === 0) {
        pdf.text("No pitches found", margin, yPosition);
        yPosition += lineHeight;
      } else {
        pitchesData.forEach((pitch, index) => {
          addNewPageIfNeeded();
          pdf.text(
            `${index + 1}. ${pitch.title || "Untitled"}`,
            margin,
            yPosition
          );
          yPosition += lineHeight;
          if (pitch.content) {
            const content = pitch.content.substring(0, 80);
            pdf.text(`   ${content}...`, margin, yPosition);
            yPosition += lineHeight;
          }
        });
      }

      yPosition += 10;
      addNewPageIfNeeded();
      pdf.setFontSize(16);
      pdf.text("Saved Pitches", margin, yPosition);
      yPosition += lineHeight + 5;

      pdf.setFontSize(11);
      const savedData = saved.data || [];
      if (savedData.length === 0) {
        pdf.text("No saved pitches found", margin, yPosition);
        yPosition += lineHeight;
      } else {
        savedData.forEach((pitch, index) => {
          addNewPageIfNeeded();
          pdf.text(
            `${index + 1}. ${pitch.title || "Untitled"}`,
            margin,
            yPosition
          );
          yPosition += lineHeight;
          if (pitch.content) {
            const content = pitch.content.substring(0, 80);
            pdf.text(`   ${content}...`, margin, yPosition);
            yPosition += lineHeight;
          }
        });
      }

      yPosition += 10;
      addNewPageIfNeeded();
      pdf.setFontSize(16);
      pdf.text("AI Images", margin, yPosition);
      yPosition += lineHeight + 5;

      pdf.setFontSize(11);
      const imagesData = images.data || [];
      if (imagesData.length === 0) {
        pdf.text("No AI images found", margin, yPosition);
        yPosition += lineHeight;
      } else {
        imagesData.forEach((image, index) => {
          addNewPageIfNeeded();
          pdf.text(
            `${index + 1}. ${image.prompt || "No prompt"}`,
            margin,
            yPosition
          );
          yPosition += lineHeight;
        });
      }

      yPosition += 10;
      addNewPageIfNeeded();
      pdf.setFontSize(16);
      pdf.text("Color Palettes", margin, yPosition);
      yPosition += lineHeight + 5;

      pdf.setFontSize(11);
      const palettesData = palettes.data || [];
      if (palettesData.length === 0) {
        pdf.text("No color palettes found", margin, yPosition);
        yPosition += lineHeight;
      } else {
        palettesData.forEach((palette, index) => {
          addNewPageIfNeeded();
          pdf.text(
            `${index + 1}. Palette with ${palette.colors?.length || 0} colors`,
            margin,
            yPosition
          );
          yPosition += lineHeight;
          if (palette.colors && Array.isArray(palette.colors)) {
            palette.colors.forEach((color) => {
              addNewPageIfNeeded();
              pdf.text(`   - ${color}`, margin + 5, yPosition);
              yPosition += lineHeight - 1;
            });
          }
        });
      }

      pdf.save(
        `pitchcraft_backup_${new Date().toISOString().split("T")[0]}.pdf`
      );
      showMessage("Data exported as PDF!", "success");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showMessage("Failed to export PDF: " + err.message, "error");
    } finally {
      setLoading(false);
      setShowExportOptions(false);
    }
  };

  const exportAsTXT = async () => {
    setLoading(true);
    try {
      const [pitches, saved, images, palettes] = await Promise.all([
        supabase.from("pitches").select("*").eq("user_id", user.id),
        supabase.from("saved_pitches").select("*").eq("user_id", user.id),
        supabase.from("ai_images").select("*").eq("user_id", user.id),
        supabase.from("color_palettes").select("*").eq("user_id", user.id),
      ]);

      let textContent = "PITCHCRAFT DATA EXPORT\n";
      textContent += "========================\n\n";
      textContent += `Export Date: ${new Date().toLocaleDateString()}\n`;
      textContent += `User: ${user.email}\n\n`;

      textContent += "PITCHES:\n";
      textContent += "--------\n";
      const pitchesData = pitches.data || [];
      if (pitchesData.length === 0) {
        textContent += "No pitches found\n\n";
      } else {
        pitchesData.forEach((pitch, index) => {
          textContent += `${index + 1}. ${pitch.title || "Untitled"}\n`;
          textContent += `   Created: ${
            pitch.created_at
              ? new Date(pitch.created_at).toLocaleDateString()
              : "Unknown"
          }\n`;
          textContent += `   Content: ${
            pitch.content
              ? pitch.content.substring(0, 200) +
                (pitch.content.length > 200 ? "..." : "")
              : "No content"
          }\n\n`;
        });
      }

      textContent += "SAVED PITCHES:\n";
      textContent += "-------------\n";
      const savedData = saved.data || [];
      if (savedData.length === 0) {
        textContent += "No saved pitches found\n\n";
      } else {
        savedData.forEach((pitch, index) => {
          textContent += `${index + 1}. ${pitch.title || "Untitled"}\n`;
          textContent += `   Created: ${
            pitch.created_at
              ? new Date(pitch.created_at).toLocaleDateString()
              : "Unknown"
          }\n`;
          textContent += `   Content: ${
            pitch.content
              ? pitch.content.substring(0, 200) +
                (pitch.content.length > 200 ? "..." : "")
              : "No content"
          }\n\n`;
        });
      }

      textContent += "AI IMAGES:\n";
      textContent += "----------\n";
      const imagesData = images.data || [];
      if (imagesData.length === 0) {
        textContent += "No AI images found\n\n";
      } else {
        imagesData.forEach((image, index) => {
          textContent += `${index + 1}. ${image.prompt || "No prompt"}\n`;
          textContent += `   Created: ${
            image.created_at
              ? new Date(image.created_at).toLocaleDateString()
              : "Unknown"
          }\n`;
          textContent += `   Image URL: ${
            image.image_url
              ? image.image_url.substring(0, 100) +
                (image.image_url.length > 100 ? "..." : "")
              : "No URL"
          }\n\n`;
        });
      }

      textContent += "COLOR PALETTES:\n";
      textContent += "---------------\n";
      const palettesData = palettes.data || [];
      if (palettesData.length === 0) {
        textContent += "No color palettes found\n\n";
      } else {
        palettesData.forEach((palette, index) => {
          textContent += `${index + 1}. Palette with ${
            palette.colors?.length || 0
          } colors\n`;
          textContent += `   Created: ${
            palette.created_at
              ? new Date(palette.created_at).toLocaleDateString()
              : "Unknown"
          }\n`;
          if (palette.colors && Array.isArray(palette.colors)) {
            textContent += `   Colors: ${palette.colors.join(", ")}\n`;
          }
          textContent += "\n";
        });
      }

      const blob = new Blob([textContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitchcraft_backup_${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showMessage("Data exported as TXT!", "success");
    } catch (err) {
      console.error("TXT Export Error:", err);
      showMessage("Failed to export TXT: " + err.message, "error");
    } finally {
      setLoading(false);
      setShowExportOptions(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      )}

      <AnimatePresence>
        {vipPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 h-screen flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl max-w-sm w-full border border-indigo-200 text-center"
            >
              <p
                className={`mb-4 text-${
                  vipPopup.type === "success" ? "green" : "red"
                }-800`}
              >
                {vipPopup.text}
              </p>
              <button
                onClick={() => setVipPopup(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm h-screen flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl max-w-md w-full border border-indigo-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-red-600">
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmation("");
                  }}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mb-4 text-gray-800">
                Are you sure you want to delete ALL your data? This cannot be
                undone.
              </p>

              <p className="mb-4 text-gray-600">
                Type <span className="font-bold text-red-600">DELETE</span> to
                confirm:
              </p>

              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full p-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                placeholder="Type DELETE here"
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmClearData}
                  disabled={deleteConfirmation !== "DELETE"}
                  className={`px-4 py-2 rounded-xl ${
                    deleteConfirmation === "DELETE"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setDeleteConfirmation("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-3">
        <SettingsIcon className="w-7 h-7" /> Settings
      </h2>

      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <section className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2 mb-4">
          <User className="w-5 h-5" /> Profile
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={updateName}
              disabled={loading}
              className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              Update Name
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={updateEmail}
              disabled={loading}
              className="mt-3 w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              Change Email
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5" /> Data & Privacy
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={clearAllData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" /> Clear All Data
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50 w-full"
            >
              <Download className="w-5 h-5" /> Export All Data
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showExportOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-indigo-200 overflow-hidden z-10"
                >
                  <button
                    onClick={exportAsJSON}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={exportAsPDF}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={exportAsTXT}
                    className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    Export as TXT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
