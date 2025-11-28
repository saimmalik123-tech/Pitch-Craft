import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Tag,
  FileText,
  RefreshCw,
  Copy,
  Trash2,
  User,
  LogIn,
  Loader2,
} from "lucide-react";
import { usePitch } from "../context/PitchContext";
import { useAuth } from "../context/AuthContext";

const AITools = () => {
  const {
    generateIdea,
    generateTagline,
    generateBlog,
    aiTools,
    loading,
    error,
    fetchAITools,
    deleteAITool,
    fetchIdeas,
    fetchTaglines,
    fetchBlogs,
  } = usePitch();

  const { user } = useAuth();

  const [ideaTopic, setIdeaTopic] = useState("");
  const [taglineCompany, setTaglineCompany] = useState("");
  const [taglineProduct, setTaglineProduct] = useState("");
  const [blogTopic, setBlogTopic] = useState("");
  const [copiedText, setCopiedText] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  // Category-specific loading states
  const [categoryLoading, setCategoryLoading] = useState({
    ideas: false,
    taglines: false,
    blogs: false,
  });

  // State for generated content
  const [generatedContent, setGeneratedContent] = useState({
    idea: null,
    tagline: null,
    blog: null,
  });

  useEffect(() => {
    if (user) {
      fetchAllCategories();
    }
  }, [user]);

  useEffect(() => {
    if (copiedText) {
      setShowCopied(true);
      const timer = setTimeout(() => {
        setShowCopied(false);
        setCopiedText(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedText]);

  const fetchAllCategories = async () => {
    if (!user) return;

    try {
      // Fetch all categories in parallel
      await Promise.all([
        fetchCategory("ideas"),
        fetchCategory("taglines"),
        fetchCategory("blogs"),
      ]);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCategory = async (category) => {
    setCategoryLoading((prev) => ({ ...prev, [category]: true }));

    try {
      switch (category) {
        case "ideas":
          await fetchIdeas();
          break;
        case "taglines":
          await fetchTaglines();
          break;
        case "blogs":
          await fetchBlogs();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${category}:`, err);
    } finally {
      setCategoryLoading((prev) => ({ ...prev, [category]: false }));
    }
  };

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedText(text);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedText(text);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleGenerateIdea = async (e) => {
    e.preventDefault();
    if (!ideaTopic.trim()) return;

    try {
      const idea = await generateIdea(ideaTopic);
      setGeneratedContent((prev) => ({ ...prev, idea }));
      setIdeaTopic("");
      // Refresh ideas after generation
      await fetchCategory("ideas");
    } catch (err) {
      console.error("Error generating idea:", err);
    }
  };

  const handleGenerateTagline = async (e) => {
    e.preventDefault();
    if (!taglineCompany.trim() || !taglineProduct.trim()) return;

    try {
      const tagline = await generateTagline(taglineCompany, taglineProduct);
      setGeneratedContent((prev) => ({ ...prev, tagline }));
      setTaglineCompany("");
      setTaglineProduct("");
      // Refresh taglines after generation
      await fetchCategory("taglines");
    } catch (err) {
      console.error("Error generating tagline:", err);
    }
  };

  const handleGenerateBlog = async (e) => {
    e.preventDefault();
    if (!blogTopic.trim()) return;

    try {
      const blog = await generateBlog(blogTopic);
      setGeneratedContent((prev) => ({ ...prev, blog }));
      setBlogTopic("");
      // Refresh blogs after generation
      await fetchCategory("blogs");
    } catch (err) {
      console.error("Error generating blog:", err);
    }
  };

  const handleDelete = async (id, type) => {
    setIsDeleting(id);
    try {
      await deleteAITool(id);
      // Refresh the specific category after deletion
      await fetchCategory(type + "s"); // Convert 'idea' to 'ideas', etc.
    } catch (err) {
      console.error("Error deleting item:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredTools = () => {
    if (activeTab === "all") {
      return [
        ...aiTools.ideas.map((item) => ({ ...item, type: "idea" })),
        ...aiTools.taglines.map((item) => ({ ...item, type: "tagline" })),
        ...aiTools.blogs.map((item) => ({ ...item, type: "blog" })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return aiTools[activeTab] || [];
  };

  const getIcon = (type) => {
    switch (type) {
      case "idea":
        return <Lightbulb className="w-4 h-4 text-indigo-600" />;
      case "tagline":
        return <Tag className="w-4 h-4 text-purple-600" />;
      case "blog":
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "idea":
        return "Idea";
      case "tagline":
        return "Tagline";
      case "blog":
        return "Blog";
      default:
        return "AI Tool";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "idea":
        return "bg-indigo-100 text-indigo-800";
      case "tagline":
        return "bg-purple-100 text-purple-800";
      case "blog":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to save and access your AI-generated content
          </p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 mx-auto">
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">AI Tools</h2>
          <p className="text-gray-600 text-sm mt-1">
            Generate ideas, taglines, and blog content with AI
          </p>
        </div>
        <button
          onClick={fetchAllCategories}
          disabled={
            categoryLoading.ideas ||
            categoryLoading.taglines ||
            categoryLoading.blogs
          }
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm disabled:opacity-50"
        >
          {categoryLoading.ideas ||
          categoryLoading.taglines ||
          categoryLoading.blogs ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh All
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Idea Generator */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-indigo-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Lightbulb className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Idea Generator
            </h3>
          </div>
          <form onSubmit={handleGenerateIdea} className="mb-4">
            <input
              type="text"
              value={ideaTopic}
              onChange={(e) => setIdeaTopic(e.target.value)}
              placeholder="Enter a topic..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              disabled={loading.idea}
            />
            <button
              type="submit"
              disabled={loading.idea || !ideaTopic.trim()}
              className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.idea ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Idea"
              )}
            </button>
          </form>

          {/* Display generated idea */}
          {generatedContent.idea && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-sm text-gray-700">{generatedContent.idea}</p>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleCopy(generatedContent.idea)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tagline Maker */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-purple-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Tag className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Tagline Maker
            </h3>
          </div>
          <form onSubmit={handleGenerateTagline} className="mb-4">
            <input
              type="text"
              value={taglineCompany}
              onChange={(e) => setTaglineCompany(e.target.value)}
              placeholder="Company name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
              disabled={loading.tagline}
            />
            <input
              type="text"
              value={taglineProduct}
              onChange={(e) => setTaglineProduct(e.target.value)}
              placeholder="Product name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
              disabled={loading.tagline}
            />
            <button
              type="submit"
              disabled={
                loading.tagline ||
                !taglineCompany.trim() ||
                !taglineProduct.trim()
              }
              className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.tagline ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Tagline"
              )}
            </button>
          </form>

          {/* Display generated tagline */}
          {generatedContent.tagline && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-700">
                {generatedContent.tagline}
              </p>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleCopy(generatedContent.tagline)}
                  className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Blog Writer */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Blog Writer</h3>
          </div>
          <form onSubmit={handleGenerateBlog} className="mb-4">
            <input
              type="text"
              value={blogTopic}
              onChange={(e) => setBlogTopic(e.target.value)}
              placeholder="Enter a topic..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              disabled={loading.blog}
            />
            <button
              type="submit"
              disabled={loading.blog || !blogTopic.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading.blog ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Blog"
              )}
            </button>
          </form>

          {/* Display generated blog */}
          {generatedContent.blog && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-sm text-gray-800 mb-1">
                {generatedContent.blog.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-3">
                {generatedContent.blog.content}
              </p>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleCopy(generatedContent.blog.content)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800">Your AI Creations</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("ideas")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "ideas"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Ideas
            </button>
            <button
              onClick={() => setActiveTab("taglines")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "taglines"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Taglines
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === "blogs"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Blogs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools().length > 0 ? (
            filteredTools().map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getIcon(item.type)}
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id, item.type)}
                    disabled={isDeleting === item.id}
                    className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                  >
                    {isDeleting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {item.title && (
                  <h4 className="font-medium text-gray-800 mb-2">
                    {item.title}
                  </h4>
                )}

                <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                  {item.content}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {item.topic && (
                      <span className="block truncate max-w-[70%]">
                        {item.topic}
                      </span>
                    )}
                    {item.company && item.product && (
                      <span className="block truncate max-w-[70%]">
                        {item.company} - {item.product}
                      </span>
                    )}
                    <span className="block">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.content)}
                    className="text-indigo-600 hover:text-indigo-800 flex-shrink-0"
                    aria-label="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No AI creations yet
              </h3>
              <p className="text-gray-500 text-sm">
                Generate your first idea, tagline, or blog post
              </p>
            </div>
          )}
        </div>
      </div>

      {showCopied && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 transition-opacity duration-300">
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default AITools;
