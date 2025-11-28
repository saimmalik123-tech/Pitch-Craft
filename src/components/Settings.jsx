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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [vipPopup, setVipPopup] = useState(null);

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
    setVipPopup({
      text: "Are you sure you want to delete ALL your data? This cannot be undone.",
      type: "confirm",
    });
  };

  const confirmClearData = async () => {
    setVipPopup(null);
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

  const exportAllData = async () => {
    setLoading(true);
    try {
      const [pitches, saved, images, palettes] = await Promise.all([
        supabase.from("pitches").select("*").eq("user_id", user.id),
        supabase.from("saved_pitches").select("*").eq("user_id", user.id),
        supabase.from("ai_images").select("*").eq("user_id", user.id),
        supabase.from("color_palettes").select("*").eq("user_id", user.id),
      ]);

      const data = {
        pitches: pitches.data || [],
        saved_pitches: saved.data || [],
        ai_images: images.data || [],
        color_palettes: palettes.data || [],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitchcraft_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      showMessage("Data exported!", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
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
              {vipPopup.type === "confirm" ? (
                <>
                  <p className="mb-4 text-gray-800">{vipPopup.text}</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={confirmClearData}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setVipPopup(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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

          <button
            onClick={exportAllData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50"
          >
            <Download className="w-5 h-5" /> Export All Data
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
