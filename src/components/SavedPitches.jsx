import React, { useState, useEffect } from "react";
import { usePitch } from "../context/PitchContext";
import {
  FolderOpen,
  Eye,
  Trash2,
  Download,
  Loader2,
  X,
  Calendar,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SavedPitches = () => {
  const { pitches, deletePitch, loading, fetchPitches } = usePitch();
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [isDeleting, setIsDeleting] = useState(null);
  const [isExporting, setIsExporting] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  const handleDeletePitch = async (id) => {
    setDeleteModal({ show: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    setIsDeleting(id);
    try {
      await deletePitch(id);
      if (selectedPitch?.id === id) setSelectedPitch(null);
    } finally {
      setIsDeleting(null);
      setDeleteModal({ show: false, id: null });
    }
  };

  const handleExportPDF = async (pitch) => {
    setIsExporting(pitch.id);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.text(pitch.title || "Investment Pitch", 20, y);
      y += 10;
      doc.setFontSize(12);
      Object.entries(pitch).forEach(([key, value]) => {
        if (!value || ["id", "user_id", "created_at"].includes(key)) return;
        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        if (y + 20 > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(14);
        doc.text(`${label}:`, 20, y);
        y += 6;
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(value, 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 6;
      });
      doc.save(`${pitch.title || "pitch"}.pdf`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
          Saved Pitches
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base ${
              viewMode === "grid"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded-lg text-sm sm:text-base ${
              viewMode === "list"
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {loading.pitch ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-gray-500">Loading pitches...</p>
        </div>
      ) : pitches.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No saved pitches yet
          </h3>
          <p className="text-gray-500">
            Create your first pitch to see it here
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg text-indigo-700 mb-1">
                {pitch.title}
              </h3>
              <p className="text-sm text-gray-500 mb-2">{pitch.category}</p>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {pitch.description}
              </p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedPitch(pitch)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportPDF(pitch)}
                    disabled={isExporting === pitch.id}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                  >
                    {isExporting === pitch.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePitch(pitch.id)}
                    disabled={isDeleting === pitch.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    {isDeleting === pitch.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mobile-friendly list view
        <div className="space-y-4">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-indigo-700">
                  {pitch.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPitch(pitch)}
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleExportPDF(pitch)}
                    disabled={isExporting === pitch.id}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50 p-1"
                  >
                    {isExporting === pitch.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePitch(pitch.id)}
                    disabled={isDeleting === pitch.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                  >
                    {isDeleting === pitch.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {pitch.category}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(pitch.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-600 line-clamp-2">{pitch.description}</p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedPitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 border border-gray-200 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
                  {selectedPitch.title}
                </h2>
                <button
                  onClick={() => setSelectedPitch(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(selectedPitch).map(([key, value]) => {
                  if (!value || ["id", "user_id", "created_at"].includes(key))
                    return null;
                  const label = key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
                  return (
                    <div key={key}>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {label}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {value}
                      </p>
                    </div>
                  );
                })}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <button
                    onClick={() => handleExportPDF(selectedPitch)}
                    disabled={isExporting === selectedPitch.id}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isExporting === selectedPitch.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedPitch(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6">
                Are you sure you want to delete this pitch?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedPitches;
