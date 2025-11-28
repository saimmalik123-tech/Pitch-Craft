import React, { useState } from "react";
import { usePitch } from "../context/PitchContext";
import {
  Share2,
  Download,
  FileText,
  Image,
  Palette,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";

const Export = () => {
  // Get pitches from context
  const { pitches } = usePitch();

  // State for UI controls
  const [exportType, setExportType] = useState("pitch");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Handle item selection
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === getCurrentItems().length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(getCurrentItems().map((item) => item.id));
    }
  };

  // Get current items based on export type
  const getCurrentItems = () => {
    switch (exportType) {
      case "pitch":
        return pitches;
      default:
        return [];
    }
  };

  // Export selected items as PDF
  const handleExportPDF = () => {
    const items = getCurrentItems().filter((item) =>
      selectedItems.includes(item.id)
    );
    if (items.length === 0) {
      alert("Please select at least one item to export");
      return;
    }

    setIsExporting(true);
    try {
      const doc = new jsPDF();
      let y = 10;

      items.forEach((item, index) => {
        doc.setFontSize(16);
        doc.text(`${item.title}`, 10, y);
        y += 10;

        doc.setFontSize(12);
        doc.text(`Category: ${item.category || ""}`, 10, y);
        y += 10;

        const fields = [
          "company",
          "product",
          "tagline",
          "description",
          "problem",
          "solution",
          "target_market",
          "competition",
          "business_model",
          "funding",
          "team",
        ];

        fields.forEach((field) => {
          if (item[field]) {
            const text = `${field.replace(/([A-Z])/g, " $1")}: ${item[field]}`;
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 10, y);
            y += splitText.length * 7;
          }
        });

        if (index < items.length - 1) doc.addPage();
        y = 10;
      });

      doc.save(`pitches_export_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-6">
        Export Data
      </h2>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setExportType("pitch");
              setSelectedItems([]);
            }}
            className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base ${
              exportType === "pitch"
                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                : "bg-gray-100 text-gray-700 border border-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Pitches
          </button>
        </div>
      </div>

      {getCurrentItems().length === 0 ? (
        <div className="text-center py-12">
          <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No items to export
          </h3>
          <p className="text-gray-500">
            Create some items first before exporting
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {selectedItems.length === getCurrentItems().length
                ? "Deselect All"
                : "Select All"}
            </button>
            <span className="text-sm text-gray-500">
              {selectedItems.length} of {getCurrentItems().length} selected
            </span>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden border border-gray-200 rounded-xl overflow-hidden mb-6 max-h-96 overflow-y-auto">
            {getCurrentItems().map((item) => (
              <div
                key={item.id}
                className={`p-4 border-b border-gray-100 last:border-b-0 ${
                  selectedItems.includes(item.id) ? "bg-indigo-50" : ""
                }`}
              >
                <div className="flex items-start">
                  <button
                    onClick={() => handleSelectItem(item.id)}
                    className={`mr-3 w-5 h-5 rounded border flex items-center justify-center ${
                      selectedItems.includes(item.id)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedItems.includes(item.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block border border-gray-200 rounded-xl overflow-hidden mb-6 max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === getCurrentItems().length
                      }
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-3">Title</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 ${
                      selectedItems.includes(item.id) ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3">{item.title}</td>
                    <td className="p-3">{item.category}</td>
                    <td className="p-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleExportPDF}
              disabled={selectedItems.length === 0 || isExporting}
              className="flex items-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Export PDF ({selectedItems.length})
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Export;
