import React, { useState } from "react";
import { usePitch } from "../context/PitchContext";
import { useGemini } from "../context/GeminiContext";
import { useAuth } from "../context/AuthContext";
import {
  Save,
  Copy,
  AlertCircle,
  Wand2,
  Edit3,
  CheckCircle,
  Loader2,
  Sparkles,
  Download,
  FileText,
  BarChart3,
  Users,
  Target,
  DollarSign,
  TrendingUp,
  Tag,
  X,
  Eye,
} from "lucide-react";

const CreatePitch = () => {
  const { createPitch, loading, error } = usePitch();
  const { callGeminiText, loading: geminiLoading } = useGemini();
  const { user } = useAuth();

  const [pitchData, setPitchData] = useState({
    title: "",
    category: "",
    company: "",
    product: "",
    tagline: "",
    description: "",
    problem: "",
    solution: "",
    targetMarket: "",
    competition: "",
    businessModel: "",
    funding: "",
    team: "",
  });

  const [pitchesArray, setPitchesArray] = useState([]);
  const [allGenerated, setAllGenerated] = useState(false);
  const [loadingSections, setLoadingSections] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGenerationCompleteModal, setShowGenerationCompleteModal] =
    useState(false);
  const [currentGeneratedField, setCurrentGeneratedField] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [showPitchModal, setShowPitchModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPitchData({ ...pitchData, [name]: value });
  };

  const generateField = async (fieldName, prompt, label) => {
    if (loadingSections[fieldName]) return;

    setLoadingSections((prev) => ({ ...prev, [fieldName]: true }));
    setCurrentGeneratedField({ name: fieldName, label });

    try {
      let text = await callGeminiText(prompt);
      text = text.replace(/\*+/g, "").trim();
      setPitchData((prev) => ({ ...prev, [fieldName]: text }));

      setTimeout(() => {
        setCurrentGeneratedField(null);
      }, 2000);

      return text;
    } catch (error) {
      console.error(`Error generating ${fieldName}:`, error);
      setCurrentGeneratedField(null);
      throw error;
    } finally {
      setLoadingSections((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleGenerateAll = async () => {
    if (!pitchData.company || !pitchData.product) return;

    const fields = [
      {
        key: "tagline",
        label: "Tagline",
        prompt: `Generate a catchy tagline for "${pitchData.product}" by "${pitchData.company}".`,
      },
      {
        key: "description",
        label: "Company Description",
        prompt: `Write a compelling description in one para for the company "${pitchData.company}" that sells "${pitchData.product}".`,
      },
      {
        key: "problem",
        label: "The Problem",
        prompt: `Describe the main problems in one para customers face which "${pitchData.product}" solves.`,
      },
      {
        key: "solution",
        label: "Our Solution",
        prompt: `Provide a compelling solution in one para describing how "${pitchData.product}" addresses the problem.`,
      },
      {
        key: "targetMarket",
        label: "Target Market",
        prompt: `Describe the target market and ideal customers for "${pitchData.product}".`,
      },
      {
        key: "competition",
        label: "Competitive Analysis",
        prompt: `Analyze the competitive landscape for "${pitchData.product}".`,
      },
      {
        key: "businessModel",
        label: "Business Model",
        prompt: `Outline the business model in one para and revenue streams for "${pitchData.product}".`,
      },
      {
        key: "funding",
        label: "Funding Needs",
        prompt: `Specify the funding requirements in one para and use of funds for "${pitchData.product}".`,
      },
      {
        key: "team",
        label: "Team",
        prompt: `Highlight the team expertise in one para and key members for "${pitchData.company}".`,
      },
    ];

    const updatedPitchData = { ...pitchData };

    for (const field of fields) {
      const text = await generateField(field.key, field.prompt, field.label);
      updatedPitchData[field.key] = text;
    }

    setPitchesArray((prev) => [...prev, updatedPitchData]);
    setAllGenerated(true);
    setShowGenerationCompleteModal(true);
  };

  const handleCopy = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSavePitch = async () => {
    if (!user) {
      alert("Please log in to save your pitch");
      return;
    }

    if (!pitchData.title || !pitchData.company || !pitchData.product) {
      alert("Please fill in at least the title, company, and product fields");
      return;
    }

    setIsSaving(true);
    try {
      const latestPitch =
        pitchesArray.length > 0
          ? pitchesArray[pitchesArray.length - 1]
          : pitchData;

      const result = await createPitch([latestPitch]);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setPitchData({
          title: "",
          category: "",
          company: "",
          product: "",
          tagline: "",
          description: "",
          problem: "",
          solution: "",
          targetMarket: "",
          competition: "",
          businessModel: "",
          funding: "",
          team: "",
        });
        setPitchesArray([]);
        setAllGenerated(false);
      }, 3000);
    } catch (err) {
      console.error("Save failed in component:", err);
      alert(`Failed to save pitch: ${err.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      const checkPageBreak = (doc, yPosition, requiredSpace = 20) => {
        const pageHeight = doc.internal.pageSize.height;
        const marginBottom = 20;
        if (yPosition + requiredSpace > pageHeight - marginBottom) {
          doc.addPage();
          return 20;
        }
        return yPosition;
      };

      doc.setFontSize(20);
      doc.text(pitchData.title || "Investment Pitch", 20, 20);

      doc.setFontSize(16);
      let yPosition = 30;
      doc.text(`${pitchData.company} - ${pitchData.product}`, 20, yPosition);

      doc.setFontSize(12);
      yPosition += 10;
      doc.text(`Category: ${pitchData.category}`, 20, yPosition);

      yPosition += 20;
      doc.setFontSize(14);

      if (pitchData.tagline) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Tagline:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const taglineLines = doc.splitTextToSize(pitchData.tagline, 170);
        doc.text(taglineLines, 20, yPosition);
        yPosition += taglineLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.description) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Description:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const descLines = doc.splitTextToSize(pitchData.description, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += descLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.problem) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Problem:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const problemLines = doc.splitTextToSize(pitchData.problem, 170);
        doc.text(problemLines, 20, yPosition);
        yPosition += problemLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.solution) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Solution:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const solutionLines = doc.splitTextToSize(pitchData.solution, 170);
        doc.text(solutionLines, 20, yPosition);
        yPosition += solutionLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.targetMarket) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Target Market:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const marketLines = doc.splitTextToSize(pitchData.targetMarket, 170);
        doc.text(marketLines, 20, yPosition);
        yPosition += marketLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.competition) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Competition:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const competitionLines = doc.splitTextToSize(
          pitchData.competition,
          170
        );
        doc.text(competitionLines, 20, yPosition);
        yPosition += competitionLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.businessModel) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Business Model:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const modelLines = doc.splitTextToSize(pitchData.businessModel, 170);
        doc.text(modelLines, 20, yPosition);
        yPosition += modelLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.funding) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Funding Needs:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const fundingLines = doc.splitTextToSize(pitchData.funding, 170);
        doc.text(fundingLines, 20, yPosition);
        yPosition += fundingLines.length * 5 + 15;
        doc.setFontSize(14);
      }

      if (pitchData.team) {
        yPosition = checkPageBreak(doc, yPosition, 30);
        doc.text("Team:", 20, yPosition);
        yPosition += 10;
        doc.setFontSize(12);
        const teamLines = doc.splitTextToSize(pitchData.team, 170);
        doc.text(teamLines, 20, yPosition);
      }

      doc.save(`${pitchData.title || "pitch"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const sections = [
    { key: "tagline", label: "Tagline", icon: <Tag className="w-5 h-5" /> },
    {
      key: "description",
      label: "Company Description",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      key: "problem",
      label: "The Problem",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      key: "solution",
      label: "Our Solution",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      key: "targetMarket",
      label: "Target Market",
      icon: <Target className="w-5 h-5" />,
    },
    {
      key: "competition",
      label: "Competitive Analysis",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      key: "businessModel",
      label: "Business Model",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      key: "funding",
      label: "Funding Needs",
      icon: <TrendingUp className="w-5 h-5" />,
    },
    { key: "team", label: "Team", icon: <Users className="w-5 h-5" /> },
  ];

  const fieldLabels = {
    title: "Pitch Title",
    category: "Category",
    company: "Company Name",
    product: "Product/Service",
  };

  const categoryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Food & Beverage",
    "Real Estate",
    "Entertainment",
    "Transportation",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {showGenerationCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 mx-4 max-w-md w-full transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Pitch Generated Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your complete pitch has been generated with AI assistance.
                Review, edit, and save your pitch.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowGenerationCompleteModal(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Review Pitch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 mx-4 max-w-md w-full transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Pitch Saved!
              </h3>
              <p className="text-gray-600 mb-6">
                Your pitch has been successfully saved to your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAllGenerated(false);
                    setPitchesArray([]);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentGeneratedField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 mx-4 max-w-md w-full transform animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Content Generated!
              </h3>
              <p className="text-gray-600 mb-2">
                Successfully generated{" "}
                <span className="font-semibold text-indigo-600">
                  {currentGeneratedField.label}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                The content has been added to your pitch.
              </p>
            </div>
          </div>
        </div>
      )}

      {showPitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Pitch Preview
              </h2>
              <button
                onClick={() => setShowPitchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {pitchData.title || "Investment Pitch"}
                  </h1>
                  <p className="text-xl text-gray-600 mb-1">
                    {pitchData.company} - {pitchData.product}
                  </p>
                  {pitchData.category && (
                    <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      {pitchData.category}
                    </span>
                  )}
                </div>

                {sections.map(({ key, label, icon }) => (
                  <div key={key} className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
                      <span className="mr-2 text-indigo-600">{icon}</span>
                      {label}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {pitchData[key] || (
                        <span className="text-gray-400 italic">
                          No content available
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 sm:px-6 py-6 sm:py-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Create Investment Pitch
                </h1>
                <p className="text-indigo-100 text-base sm:text-lg">
                  Craft a compelling pitch deck with AI assistance
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="relative">
                  <Wand2 className="w-10 h-10 sm:w-12 sm:h-12 text-white opacity-90 animate-float" />
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("create")}
                className="py-4 px-6 text-center border-b-2 font-medium text-sm border-indigo-500 text-indigo-600"
              >
                Create Pitch
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {!allGenerated ? (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-indigo-600" />
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.keys(fieldLabels).map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {fieldLabels[field]}
                        </label>
                        {field === "category" ? (
                          <select
                            name={field}
                            value={pitchData[field]}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                          >
                            <option value="">Select a category</option>
                            {categoryOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={field}
                            value={pitchData[field]}
                            onChange={handleChange}
                            placeholder={`Enter ${fieldLabels[
                              field
                            ].toLowerCase()}`}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleGenerateAll}
                    disabled={
                      geminiLoading || !pitchData.company || !pitchData.product
                    }
                    className="group relative bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {geminiLoading ? (
                      <div className="flex items-center justify-center relative">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Your Pitch...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center relative">
                        <Wand2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Generate Complete Pitch
                      </div>
                    )}
                  </button>
                </div>

                {(!pitchData.company || !pitchData.product) && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      Please fill in Company Name and Product to generate your
                      pitch
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Generated Pitch
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowPitchModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Pitch
                    </button>
                    <button
                      onClick={handleSavePitch}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Pitch
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {isExporting ? (
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
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {sections.map(({ key, label, icon }) => (
                    <div key={key} className="relative group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <span className="mr-2 text-indigo-600">{icon}</span>
                          {label}
                        </h3>
                        {pitchData[key] && !loadingSections[key] && (
                          <button
                            type="button"
                            onClick={() => handleCopy(pitchData[key], key)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 border border-transparent hover:border-indigo-200 mt-2 sm:mt-0"
                          >
                            {copiedField === key ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
                        {loadingSections[key] ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-3" />
                            <span className="text-gray-600">
                              Generating content...
                            </span>
                          </div>
                        ) : (
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {pitchData[key] || (
                              <span className="text-gray-400 italic">
                                No content generated yet
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {!allGenerated && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 sm:mt-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Generate compelling pitch content using advanced AI
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional</h3>
              <p className="text-gray-600 text-sm">
                Investor-ready templates and structure
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-600 text-sm">
                Create complete pitches in minutes, not hours
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePitch;
