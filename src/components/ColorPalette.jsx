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
  Settings,
  PaintBucket,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

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
  const [colorCount, setColorCount] = useState(5);
  const [colorScheme, setColorScheme] = useState("theme");
  const [showSettings, setShowSettings] = useState(false);
  const [themeColors, setThemeColors] = useState({
    primary: "#4f46e5",
    secondary: "#9333ea",
    accent: "#ec4899",
    background: "#ffffff",
    text: "#111827",
  });
  const [themeType, setThemeType] = useState("vibrant");
  const [showThemeExample, setShowThemeExample] = useState(false);
  const [examplePalette, setExamplePalette] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { user } = useAuth();

  const showPopup = (type, message) => {
    setPopup({ isOpen: true, type, message });
  };

  const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, "0")}`;
  };

  const generateLightColor = () => {
    const r = Math.floor(Math.random() * 55) + 200;
    const g = Math.floor(Math.random() * 55) + 200;
    const b = Math.floor(Math.random() * 55) + 200;
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const generateDarkColor = () => {
    const r = Math.floor(Math.random() * 100);
    const g = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const generateLightDarkColor = (index) => {
    if (index < colorCount / 2) {
      return generateLightColor();
    } else {
      return generateDarkColor();
    }
  };

  const generateThemeColor = (index) => {
    const baseColors = [
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      themeColors.background,
      themeColors.text,
    ];
    return baseColors[index % baseColors.length];
  };

  const generateThemeVariation = (index) => {
    const baseColor =
      index % 2 === 0 ? themeColors.primary : themeColors.secondary;
    const variation = Math.floor(index / 2) % 5;

    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    const factor = 0.2 * variation;
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, "0")}${newG
      .toString(16)
      .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  };

  const generateVibrantPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];

    for (let i = 0; i < colorCount; i++) {
      const hue = (baseHue + (i * 360) / colorCount) % 360;
      const saturation = 70 + Math.floor(Math.random() * 30);
      const lightness = 45 + Math.floor(Math.random() * 20);
      colors.push(hslToHex(hue, saturation, lightness));
    }

    return colors;
  };

  const generateMinimalPalette = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const colors = [];

    for (let i = 0; i < colorCount; i++) {
      const hue = baseHue;
      const saturation = 10 + Math.floor(Math.random() * 20);
      const lightness = 20 + (i * 60) / colorCount;
      colors.push(hslToHex(hue, saturation, lightness));
    }

    return colors;
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const applyTheme = (palette) => {
    const newTheme = {
      primary: palette.colors[0] || themeColors.primary,
      secondary: palette.colors[1] || themeColors.secondary,
      accent: palette.colors[2] || themeColors.accent,
      background: palette.colors[3] || themeColors.background,
      text: palette.colors[4] || themeColors.text,
    };
    setThemeColors(newTheme);
    showPopup("generate", "Theme Applied Successfully!");
    setShowThemeExample(false);
  };

  const generatePalette = () => {
    setLoading(true);
    setTimeout(() => {
      let colors;
      if (colorScheme === "light") {
        colors = Array.from({ length: colorCount }, () => generateLightColor());
      } else if (colorScheme === "dark") {
        colors = Array.from({ length: colorCount }, () => generateDarkColor());
      } else if (colorScheme === "light-dark") {
        colors = Array.from({ length: colorCount }, (_, i) =>
          generateLightDarkColor(i)
        );
      } else if (colorScheme === "theme") {
        colors = Array.from({ length: colorCount }, (_, i) =>
          generateThemeColor(i)
        );
      } else if (colorScheme === "theme-variation") {
        colors = Array.from({ length: colorCount }, (_, i) =>
          generateThemeVariation(i)
        );
      } else if (colorScheme === "vibrant") {
        colors = generateVibrantPalette();
      } else if (colorScheme === "minimal") {
        colors = generateMinimalPalette();
      } else {
        colors = Array.from({ length: colorCount }, () =>
          generateRandomColor()
        );
      }

      const newPalette = {
        id: Date.now(),
        colors,
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
        const { error: textError } = await supabase
          .from("color_palettes")
          .insert({
            id: newId,
            colors: JSON.stringify(colors),
            user_id: user.id,
          });

        if (textError) {
          const pgArray = `{${colors.map((color) => `"${color}"`).join(",")}}`;
          const { error: arrayError } = await supabase
            .from("color_palettes")
            .insert({
              id: newId,
              colors: pgArray,
              user_id: user.id,
            });

          if (arrayError) {
            console.error("Save error:", arrayError);
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

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "color-palette-history.json";
    link.href = url;
    link.click();
    setShowExportOptions(false);
  };

  const exportAsPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("Color Palette History", 20, 20);

    let yPosition = 40;

    filteredHistory.forEach((palette, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`Palette ${index + 1}`, 20, yPosition);

      yPosition += 10;
      pdf.setFontSize(10);
      pdf.text(
        `Created: ${new Date(palette.created_at).toLocaleDateString()}`,
        20,
        yPosition
      );

      yPosition += 10;
      pdf.text("Colors:", 20, yPosition);

      yPosition += 7;
      palette.colors.forEach((color) => {
        pdf.setTextColor(color);
        pdf.rect(20, yPosition - 5, 10, 10, "F");
        pdf.setTextColor(0, 0, 0);
        pdf.text(color, 35, yPosition);
        yPosition += 7;
      });

      yPosition += 10;
    });

    pdf.save("color-palette-history.pdf");
    setShowExportOptions(false);
  };

  const exportAsTXT = () => {
    let textContent = "COLOR PALETTE HISTORY\n";
    textContent += "=====================\n\n";

    filteredHistory.forEach((palette, index) => {
      textContent += `Palette ${index + 1}\n`;
      textContent += `Created: ${new Date(
        palette.created_at
      ).toLocaleDateString()}\n`;
      textContent += "Colors:\n";

      palette.colors.forEach((color) => {
        textContent += `- ${color}\n`;
      });

      textContent += "\n";
    });

    const dataBlob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = "color-palette-history.txt";
    link.href = url;
    link.click();
    setShowExportOptions(false);
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

  const openThemeExample = (palette) => {
    setExamplePalette(palette);
    setShowThemeExample(true);
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

  const colorVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
    hover: { scale: 1.05 },
  };

  const colorItemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const isLightColor = (hexColor) => {
    if (!hexColor || hexColor.length < 7) return true;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const getContrastColor = (hexColor) => {
    return isLightColor(hexColor) ? "#111827" : "#ffffff";
  };

  const adjustColor = (hexColor, amount) => {
    if (!hexColor || hexColor.length < 7) return hexColor;
    const r = Math.max(
      0,
      Math.min(255, parseInt(hexColor.slice(1, 3), 16) + amount)
    );
    const g = Math.max(
      0,
      Math.min(255, parseInt(hexColor.slice(3, 5), 16) + amount)
    );
    const b = Math.max(
      0,
      Math.min(255, parseInt(hexColor.slice(5, 7), 16) + amount)
    );
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const ThemePreview = ({ palette, onApplyTheme }) => {
    if (!palette || palette.colors.length === 0) return null;

    const primary = palette.colors[0] || "#4f46e5";
    const secondary = palette.colors[1] || "#9333ea";
    const accent =
      palette.colors[2] ||
      (palette.colors.length > 2 ? palette.colors[2] : "#ec4899");
    const background =
      palette.colors[3] ||
      (palette.colors.length > 3
        ? palette.colors[3]
        : isLightColor(primary)
        ? "#ffffff"
        : "#111827");
    const text =
      palette.colors[4] ||
      (palette.colors.length > 4
        ? palette.colors[4]
        : getContrastColor(background));

    const headerTextColor = getContrastColor(primary);
    const footerTextColor = getContrastColor(secondary);

    return (
      <div className="w-full h-full overflow-auto">
        <div
          className="min-h-screen"
          style={{ backgroundColor: background, color: text }}
        >
          <header
            className="sticky top-0 z-50 py-4 px-6 flex justify-between items-center shadow-md"
            style={{ backgroundColor: primary }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Palette
                  className="w-5 h-5"
                  style={{ color: headerTextColor }}
                />
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: headerTextColor }}
              >
                BrandName
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a
                href="#"
                className="hover:opacity-80 transition-opacity"
                style={{ color: headerTextColor }}
              >
                Home
              </a>
              <a
                href="#"
                className="hover:opacity-80 transition-opacity"
                style={{ color: headerTextColor }}
              >
                Features
              </a>
              <a
                href="#"
                className="hover:opacity-80 transition-opacity"
                style={{ color: headerTextColor }}
              >
                Pricing
              </a>
              <a
                href="#"
                className="hover:opacity-80 transition-opacity"
                style={{ color: headerTextColor }}
              >
                Contact
              </a>
            </nav>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: accent,
                color: getContrastColor(accent),
              }}
            >
              Get Started
            </button>
          </header>

          <section className="py-16 px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Transform Your Business with Our Solution
              </h1>
              <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-80">
                Discover how our platform can streamline your workflow and boost
                productivity with innovative features designed for modern teams.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-lg shadow-lg"
                  style={{
                    backgroundColor: primary,
                    color: getContrastColor(primary),
                  }}
                >
                  Start Free Trial
                </button>
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-lg border-2 shadow-lg"
                  style={{ borderColor: secondary, color: secondary }}
                >
                  View Demo
                </button>
              </div>
            </div>
          </section>

          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                Powerful Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Real-time Collaboration",
                    desc: "Work together seamlessly with your team in real-time",
                    icon: "🔄",
                  },
                  {
                    title: "Advanced Analytics",
                    desc: "Gain insights with powerful data visualization tools",
                    icon: "📊",
                  },
                  {
                    title: "Secure Infrastructure",
                    desc: "Enterprise-grade security to protect your data",
                    icon: "🔒",
                  },
                  {
                    title: "Custom Integrations",
                    desc: "Connect with your favorite tools and services",
                    icon: "🔌",
                  },
                  {
                    title: "24/7 Support",
                    desc: "Get help whenever you need it from our expert team",
                    icon: "🛟",
                  },
                  {
                    title: "Scalable Platform",
                    desc: "Grow your business without worrying about infrastructure",
                    icon: "📈",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl shadow-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? adjustColor(primary, 10)
                          : adjustColor(secondary, 10),
                    }}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="opacity-80">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="py-16 px-6"
            style={{ backgroundColor: adjustColor(primary, 5) }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                What Our Customers Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Sarah Johnson",
                    role: "Product Manager",
                    content:
                      "This platform has completely transformed how our team collaborates. The real-time features are a game-changer!",
                    avatar: "👩‍💼",
                  },
                  {
                    name: "Michael Chen",
                    role: "CTO",
                    content:
                      "The security features give us peace of mind. We can focus on our business knowing our data is protected.",
                    avatar: "👨‍💻",
                  },
                  {
                    name: "Emily Rodriguez",
                    role: "Marketing Director",
                    content:
                      "The analytics tools have helped us understand our customers better than ever before.",
                    avatar: "👩‍🎨",
                  },
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-xl shadow-lg"
                    style={{ backgroundColor: background }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{testimonial.avatar}</div>
                      <div>
                        <div className="font-bold">{testimonial.name}</div>
                        <div className="text-sm opacity-70">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <p className="italic">"{testimonial.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                Simple, Transparent Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    name: "Starter",
                    price: "$19",
                    features: [
                      "Up to 5 users",
                      "Basic analytics",
                      "Email support",
                      "1GB storage",
                    ],
                    popular: false,
                  },
                  {
                    name: "Professional",
                    price: "$49",
                    features: [
                      "Up to 20 users",
                      "Advanced analytics",
                      "Priority support",
                      "10GB storage",
                      "Custom integrations",
                    ],
                    popular: true,
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    features: [
                      "Unlimited users",
                      "Full analytics suite",
                      "24/7 dedicated support",
                      "Unlimited storage",
                      "Custom development",
                    ],
                    popular: false,
                  },
                ].map((plan, index) => (
                  <div
                    key={index}
                    className={`p-8 rounded-xl shadow-lg ${
                      plan.popular ? "ring-4" : ""
                    }`}
                    style={{
                      backgroundColor: background,
                      borderColor: plan.popular ? accent : "transparent",
                    }}
                  >
                    {plan.popular && (
                      <div className="text-center mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor: accent,
                            color: getContrastColor(accent),
                          }}
                        >
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-center mb-4">
                      {plan.name}
                    </h3>
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-lg opacity-70">/month</span>
                    </div>
                    <ul className="mb-8 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <div
                            className="w-5 h-5 rounded-full mr-2 flex items-center justify-center"
                            style={{
                              backgroundColor: accent,
                              color: getContrastColor(accent),
                            }}
                          >
                            ✓
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-3 rounded-lg font-semibold ${
                        plan.popular ? "text-white" : ""
                      }`}
                      style={{
                        backgroundColor: plan.popular ? accent : secondary,
                        color: plan.popular
                          ? getContrastColor(accent)
                          : getContrastColor(secondary),
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className="py-16 px-6 text-center"
            style={{ backgroundColor: primary }}
          >
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: getContrastColor(primary) }}
              >
                Ready to Get Started?
              </h2>
              <p
                className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90"
                style={{ color: getContrastColor(primary) }}
              >
                Join thousands of satisfied customers and transform your
                business today.
              </p>
              <button
                className="px-8 py-3 rounded-lg font-semibold text-lg shadow-lg"
                style={{
                  backgroundColor: accent,
                  color: getContrastColor(accent),
                }}
              >
                Sign Up Now
              </button>
            </div>
          </section>

          <footer className="py-12 px-6" style={{ backgroundColor: secondary }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Palette
                      className="w-5 h-5"
                      style={{ color: footerTextColor }}
                    />
                  </div>
                  <div
                    className="text-xl font-bold"
                    style={{ color: footerTextColor }}
                  >
                    BrandName
                  </div>
                </div>
                <p className="opacity-80" style={{ color: footerTextColor }}>
                  Innovative solutions for modern businesses.
                </p>
              </div>
              <div>
                <h4
                  className="font-bold mb-4"
                  style={{ color: footerTextColor }}
                >
                  Product
                </h4>
                <ul
                  className="space-y-2 opacity-80"
                  style={{ color: footerTextColor }}
                >
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Integrations
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Updates
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4
                  className="font-bold mb-4"
                  style={{ color: footerTextColor }}
                >
                  Company
                </h4>
                <ul
                  className="space-y-2 opacity-80"
                  style={{ color: footerTextColor }}
                >
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="hover:opacity-100 transition-opacity"
                    >
                      Press
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4
                  className="font-bold mb-4"
                  style={{ color: footerTextColor }}
                >
                  Contact
                </h4>
                <ul
                  className="space-y-2 opacity-80"
                  style={{ color: footerTextColor }}
                >
                  <li>contact@brandname.com</li>
                  <li>+1 (555) 123-4567</li>
                  <li>123 Business Ave, Suite 100</li>
                  <li>San Francisco, CA 94107</li>
                </ul>
              </div>
            </div>
            <div
              className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/20 text-center opacity-70"
              style={{ color: footerTextColor }}
            >
              <p>© 2023 BrandName. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen p-3 sm:p-4 md:p-6 transition-colors duration-500"
      style={{
        backgroundColor: themeColors.background,
        color: themeColors.text,
      }}
    >
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
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600"
                  : popup.type === "save"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-red-500 to-pink-600"
              }`}
            >
              <PopupContent type={popup.type} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 mb-10 border border-gray-200"
          style={{ backgroundColor: themeColors.background }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="w-full lg:w-auto">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <Palette
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  style={{ color: themeColors.primary }}
                />
                Professional Color Palette Generator
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Create vibrant and minimal color themes for your projects
              </p>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                }}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={generatePalette}
                disabled={loading}
                className="flex-1 lg:flex-none text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
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
          </div>

          {showSettings && (
            <div
              className="mb-6 p-4 rounded-2xl border border-gray-200 transition-colors duration-300"
              style={{ backgroundColor: themeColors.background }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Number of Colors
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={colorCount}
                      onChange={(e) => setColorCount(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                      }}
                    />
                    <span className="text-lg font-semibold w-8 text-center">
                      {colorCount}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      "random",
                      "light",
                      "dark",
                      "light-dark",
                      "theme",
                      "theme-variation",
                      "vibrant",
                      "minimal",
                    ].map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          colorScheme === scheme ? "text-white" : ""
                        }`}
                        style={{
                          backgroundColor:
                            colorScheme === scheme
                              ? themeColors.primary
                              : themeColors.background,
                          color:
                            colorScheme === scheme ? "white" : themeColors.text,
                        }}
                      >
                        {scheme
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Theme Type
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setThemeType("vibrant")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      themeType === "vibrant" ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        themeType === "vibrant"
                          ? themeColors.primary
                          : themeColors.background,
                      color:
                        themeType === "vibrant" ? "white" : themeColors.text,
                    }}
                  >
                    Vibrant
                  </button>
                  <button
                    onClick={() => setThemeType("minimal")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      themeType === "minimal" ? "text-white" : ""
                    }`}
                    style={{
                      backgroundColor:
                        themeType === "minimal"
                          ? themeColors.primary
                          : themeColors.background,
                      color:
                        themeType === "minimal" ? "white" : themeColors.text,
                    }}
                  >
                    Minimal
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Current Theme Colors
                </label>
                <div className="flex gap-2">
                  {Object.entries(themeColors).map(([key, color]) => (
                    <div key={key} className="flex-1 text-center">
                      <div
                        className="h-10 rounded-lg mb-1 transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {palettes.map((palette) => (
              <motion.div
                key={palette.id}
                className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                variants={colorVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                style={{ backgroundColor: themeColors.background }}
              >
                <div className="flex h-24 sm:h-32">
                  {palette.colors.map((color, index) => (
                    <motion.div
                      key={index}
                      className="flex-1 relative group cursor-pointer transition-all duration-300 hover:flex-2"
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopyColor(color)}
                      variants={colorItemVariants}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-20">
                        <span className="bg-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                          {color}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(palette.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openThemeExample(palette)}
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{ color: themeColors.text }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => savePalette(palette.id, palette.colors)}
                        disabled={savingId === palette.id}
                        className="text-white px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                        style={{ backgroundColor: themeColors.accent }}
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
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className="rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200"
          style={{ backgroundColor: themeColors.background }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
            <div className="w-full lg:w-auto">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                <History
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  style={{ color: themeColors.primary }}
                />
                Palette History
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Your saved color palette collection
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="relative">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 border border-gray-200 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                  style={{ color: themeColors.text }}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showExportOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
                      style={{ backgroundColor: themeColors.background }}
                    >
                      <button
                        onClick={exportAsJSON}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                        style={{ color: themeColors.text }}
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={exportAsPDF}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                        style={{ color: themeColors.text }}
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={exportAsTXT}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                        style={{ color: themeColors.text }}
                      >
                        Export as TXT
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 text-white rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: themeColors.accent }}
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
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
                  placeholder="Search colors or palettes..."
                  style={{ color: themeColors.text }}
                />
              </div>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
              style={{ color: themeColors.text }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-3 sm:py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm text-sm sm:text-base"
              style={{ color: themeColors.text }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredHistory.map((palette) => (
              <motion.div
                key={palette.id}
                className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedPalette(palette)}
                variants={colorVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                style={{ backgroundColor: themeColors.background }}
              >
                <div className="flex h-20 sm:h-24">
                  {palette.colors.map((color, index) => (
                    <motion.div
                      key={index}
                      className="flex-1 transition-all duration-300 hover:flex-2"
                      style={{ backgroundColor: color }}
                      variants={colorItemVariants}
                    />
                  ))}
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
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
                          openThemeExample(palette);
                        }}
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{ color: themeColors.text }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sharePalette(palette);
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: themeColors.text }}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFromHistory(palette.id);
                        }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: themeColors.text }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
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
                className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-xs sm:max-w-md md:max-w-lg p-5 sm:p-8 shadow-2xl border border-gray-200"
                style={{ backgroundColor: themeColors.background }}
              >
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3
                    className="text-xl sm:text-2xl font-bold"
                    style={{ color: themeColors.text }}
                  >
                    Palette Details
                  </h3>
                  <button
                    onClick={() => setSelectedPalette(null)}
                    className="p-2 rounded-lg transition"
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: themeColors.text }}
                    />
                  </button>
                </div>

                <div className="flex h-20 sm:h-24 md:h-28 mb-5 sm:mb-6 rounded-xl overflow-hidden border border-gray-200">
                  {selectedPalette.colors.map((color, i) => (
                    <motion.div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                  {selectedPalette.colors.map((color, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/70 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{ backgroundColor: themeColors.background }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <span
                          className="text-sm sm:text-base font-mono"
                          style={{ color: themeColors.text }}
                        >
                          {color}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyColor(color)}
                        className="p-2 rounded-lg transition"
                      >
                        <Copy
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: themeColors.primary }}
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedPalette(null);
                      openThemeExample(selectedPalette);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-white"
                    style={{
                      background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    <PaintBucket className="w-4 h-4" />
                    Apply as Theme
                  </button>
                  <button
                    onClick={() => setSelectedPalette(null)}
                    className="flex-1 py-3 sm:py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                    style={{
                      backgroundColor: themeColors.accent,
                      color: "white",
                    }}
                  >
                    Close Palette
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showThemeExample && examplePalette && (
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
                className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-6xl h-[90vh] p-1 shadow-2xl border border-gray-200 overflow-hidden"
              >
                <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                  <h3 className="text-xl font-bold">Theme Preview</h3>
                  <button
                    onClick={() => setShowThemeExample(false)}
                    className="p-2 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="h-[calc(90vh-73px)] overflow-auto">
                  <ThemePreview
                    palette={examplePalette}
                    onApplyTheme={() => applyTheme(examplePalette)}
                  />
                </div>
                <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                  <button
                    onClick={() => applyTheme(examplePalette)}
                    className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${
                        examplePalette.colors[0] || themeColors.primary
                      }, ${examplePalette.colors[1] || themeColors.secondary})`,
                    }}
                  >
                    Apply as Theme
                  </button>
                  <button
                    onClick={() => setShowThemeExample(false)}
                    className="px-6 py-3 rounded-xl font-semibold shadow-lg"
                    style={{
                      backgroundColor:
                        examplePalette.colors[2] || themeColors.accent,
                      color: "white",
                    }}
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {copiedColor && (
          <motion.div
            className="fixed bottom-6 right-6 text-white px-4 sm:px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            <Copy className="w-4 h-4" />
            Copied {copiedColor}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;
