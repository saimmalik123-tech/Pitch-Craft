import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Palette,
  Image,
  Crown,
  Download,
  FileText,
  Zap,
  Star,
  Users,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Brain,
  MessageCircle,
  PenTool,
  Shield,
  Globe,
  Mail,
  Twitter,
  Instagram,
  Facebook,
  Award,
  BarChart,
  Layers,
  Target,
  Lightbulb,
  TrendingUp,
  UserCheck,
  Clock,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const sections = [
        "home",
        "features",
        "how-it-works",
        "tools",
        "showcase",
        "pricing",
        "testimonials",
        "team",
        "faq",
        "contact",
      ];

      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const fadeInUp = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 50, opacity: 0, rotateZ: 10 },
    visible: {
      y: 0,
      opacity: 1,
      rotateZ: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const floatingVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header
        className={`fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 z-50 transition-all duration-300 ${
          scrollY > 10 ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl sm:text-2xl font-bold text-indigo-600">
                PitchCraft
              </span>
            </motion.div>

            <nav className="hidden md:flex space-x-4 sm:space-x-8">
              {["home", "features", "tools", "showcase", "testimonials"].map(
                (item) => (
                  <motion.button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className={`capitalize text-sm sm:text-base transition-all duration-300 relative ${
                      activeSection === item
                        ? "text-indigo-600 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                    {activeSection === item && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        layoutId="activeSection"
                      />
                    )}
                  </motion.button>
                )
              )}
            </nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex items-center space-x-2 sm:space-x-4"
            >
              <Link
                to="/login"
                className="px-4 sm:px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
              >
                Login
              </Link>
              <Link to="/join">
                <motion.button
                  className="px-4 sm:px-6 py-2 cursor-pointer bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-200 text-white text-sm sm:text-base"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>

            <button
              className="md:hidden text-gray-600 p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.div
                animate={isMenuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-sm"
            >
              <div className="px-4 py-6 space-y-2">
                {["home", "features", "tools", "showcase", "testimonials"].map(
                  (item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => scrollToSection(item)}
                      className={`block w-full text-left capitalize py-3 px-4 rounded-lg transition-all text-base ${
                        activeSection === item
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      whileHover={{ x: 5 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {item}
                    </motion.button>
                  )
                )}
                <div className="pt-4 border-t border-gray-200 space-y-3 mt-4">
                  <motion.button
                    className="w-full text-center py-3 text-gray-600 hover:text-gray-900 text-base"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                  >
                    <Link to="/login">Login</Link>
                  </motion.button>
                  <motion.button
                    className="w-full text-center py-3 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-all text-white text-base"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.4 }}
                  >
                    <Link to="/join">Get Started</Link>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section
          id="home"
          className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-white to-purple-50 opacity-50"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6 sm:mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                <Crown className="w-4 h-4 text-indigo-500" />
              </motion.div>
              <span className="text-sm text-indigo-600">
                AI-Powered Creative Suite
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              <span className="text-indigo-600">Craft Perfect</span>
              <br />
              <span className="text-gray-900">Pitches & Designs</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Generate stunning pitches, logos, images, and color palettes with
              AI. Everything you need to bring your ideas to life in one
              platform.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.button
                className="cursor-pointer px-6 sm:px-8 py-3 sm:py-4 bg-indigo-500 rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-200 flex items-center space-x-3 group text-white w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base sm:text-lg font-semibold">
                  <Link to="/join">Start Creating Free</Link>
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                className="px-6 sm:px-8 py-3 sm:py-4 border border-indigo-200 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-300 flex items-center space-x-3 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base sm:text-base">Watch Demo</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-indigo-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                </div>
              </motion.button>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                { icon: FileText, label: "Pitch Generation", value: "10K+" },
                { icon: Image, label: "AI Images", value: "50K+" },
                { icon: Palette, label: "Color Palettes", value: "25K+" },
                { icon: Users, label: "Happy Users", value: "5K+" },
              ].map(({ icon: Icon, label, value }) => (
                <motion.div
                  key={label}
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-indigo-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
                  </motion.div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {value}
                  </div>
                  <div className="text-gray-500 text-xs sm:text-sm">
                    {label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="features"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to{" "}
                <span className="text-indigo-600">Succeed</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive AI tools designed for creators, marketers, and
                entrepreneurs
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: FileText,
                  title: "Pitch Generator",
                  description:
                    "Create compelling business pitches with AI assistance and export to PDF",
                  features: [
                    "AI-powered content",
                    "PDF export",
                    "Custom templates",
                    "Real-time editing",
                  ],
                },
                {
                  icon: Image,
                  title: "AI Image Creator",
                  description:
                    "Generate stunning visuals for your projects with text-to-image AI",
                  features: [
                    "Multiple styles",
                    "High resolution",
                    "Custom prompts",
                    "Batch generation",
                  ],
                },
                {
                  icon: Palette,
                  title: "Color Palette",
                  description:
                    "Discover perfect color combinations for your brand and designs",
                  features: [
                    "AI suggestions",
                    "Harmony rules",
                    "Export codes",
                    "Save favorites",
                  ],
                },
                {
                  icon: Zap,
                  title: "Logo Maker",
                  description:
                    "Design professional logos in minutes with AI-powered tools",
                  features: [
                    "Icon library",
                    "Custom fonts",
                    "Vector export",
                    "Multiple formats",
                  ],
                },
                {
                  icon: Brain,
                  title: "Idea Generator",
                  description:
                    "Never run out of creative ideas with our AI brainstorming tool",
                  features: [
                    "Industry-specific",
                    "Trend analysis",
                    "Save ideas",
                    "Collaborate",
                  ],
                },
                {
                  icon: MessageCircle,
                  title: "Tagline Maker",
                  description:
                    "Create catchy taglines and slogans that resonate with your audience",
                  features: [
                    "Brand alignment",
                    "Multiple options",
                    "A/B testing",
                    "Save favorites",
                  ],
                },
              ].map(({ icon: Icon, title, description, features }) => (
                <motion.div
                  key={title}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg"
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                    {title}
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                    {description}
                  </p>
                  <ul className="space-y-2 sm:space-y-3">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center space-x-2 sm:space-x-3 text-gray-500 text-sm sm:text-base"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How <span className="text-indigo-600">PitchCraft</span> Works
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Our simple 4-step process to create stunning content in minutes
              </p>
            </motion.div>

            <div className="hidden md:block relative">
              <motion.div
                className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                style={{ originX: 0 }}
              />
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  step: "01",
                  title: "Describe Your Idea",
                  description: "Tell our AI what you want to create",
                  icon: PenTool,
                },
                {
                  step: "02",
                  title: "AI Generates Content",
                  description: "Our AI creates multiple options for you",
                  icon: Brain,
                },
                {
                  step: "03",
                  title: "Customize & Refine",
                  description: "Edit and perfect your creation",
                  icon: Layers,
                },
                {
                  step: "04",
                  title: "Export & Share",
                  description: "Download or share your final product",
                  icon: Download,
                },
              ].map(({ step, title, description, icon: Icon }) => (
                <motion.div
                  key={step}
                  className="text-center relative z-10"
                  variants={itemVariants}
                >
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto border-2 border-indigo-200">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
                      variants={glowVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {step}
                    </motion.div>
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="tools"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Powerful <span className="text-indigo-600">AI Tools</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Specialized tools to enhance every aspect of your creative
                workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div
                className="space-y-4 sm:space-y-6 lg:space-y-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    icon: PenTool,
                    title: "Blog Writer",
                    description:
                      "Generate engaging blog posts with AI that captures your brand voice",
                    color: "bg-indigo-500",
                  },
                  {
                    icon: MessageCircle,
                    title: "Social Media Posts",
                    description:
                      "Create viral content for all social platforms with AI optimization",
                    color: "bg-indigo-500",
                  },
                  {
                    icon: FileText,
                    title: "Content Repurposer",
                    description:
                      "Transform existing content into multiple formats automatically",
                    color: "bg-indigo-500",
                  },
                  {
                    icon: Brain,
                    title: "Strategy Planner",
                    description:
                      "AI-powered business and marketing strategy recommendations",
                    color: "bg-indigo-500",
                  },
                ].map(({ icon: Icon, title, description, color }) => (
                  <motion.div
                    key={title}
                    className="flex items-start space-x-4 sm:space-x-6 p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-sm"
                    variants={itemVariants}
                    whileHover={{
                      x: 10,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    }}
                  >
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center shrink-0`}
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {title}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <motion.div
                  className="bg-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-indigo-100"
                  variants={floatingVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
                    <div className="flex items-center space-x-2 sm:space-x-4 mb-4">
                      <motion.div
                        className="w-3 h-3 bg-red-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-yellow-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      />
                      <motion.div
                        className="w-3 h-3 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                      >
                        <div className="h-16 sm:h-20 bg-gray-200 rounded-lg mb-2 sm:mb-3 animate-pulse"></div>
                        <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse"></div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-indigo-500 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md"
                  variants={glowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  Live Preview
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="showcase" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                See <span className="text-indigo-600">PitchCraft</span> in
                Action
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Real examples of what you can create with our AI-powered tools
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Startup Pitch Deck",
                  description:
                    "Complete investor presentation generated in minutes",
                  image: "🚀",
                  stats: "15 slides • 2 hours saved",
                },
                {
                  title: "Brand Identity Kit",
                  description:
                    "Logo, colors, and tagline created simultaneously",
                  image: "🎨",
                  stats: "3 assets • 1 hour saved",
                },
                {
                  title: "Marketing Campaign",
                  description: "Images, copy, and strategy generated together",
                  image: "📈",
                  stats: "10 pieces • 4 hours saved",
                },
              ].map(({ title, description, image, stats }) => (
                <motion.div
                  key={title}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 hover:border-indigo-300 transition-all duration-300 shadow-sm"
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <motion.div
                    className="text-3xl sm:text-4xl mb-4"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {image}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                    {title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    {description}
                  </p>
                  <div className="text-indigo-600 text-sm sm:text-base font-semibold">
                    {stats}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.button
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-indigo-300 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all duration-300 flex items-center space-x-3 mx-auto group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-base sm:text-lg font-semibold">
                  View All Examples
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        <section
          id="pricing"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, <span className="text-indigo-600">Transparent</span>{" "}
                Pricing
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the plan that works best for your creative needs
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  name: "Starter",
                  price: "$19",
                  period: "/month",
                  description: "Perfect for individuals and small projects",
                  features: [
                    "5 Pitches/month",
                    "10 AI Images",
                    "Basic Templates",
                    "PDF Export",
                    "Email Support",
                  ],
                  popular: false,
                },
                {
                  name: "Professional",
                  price: "$49",
                  period: "/month",
                  description: "Ideal for freelancers and growing businesses",
                  features: [
                    "Unlimited Pitches",
                    "100 AI Images",
                    "All Templates",
                    "Priority Support",
                    "Custom Branding",
                    "Advanced Analytics",
                  ],
                  popular: true,
                },
                {
                  name: "Enterprise",
                  price: "$99",
                  period: "/month",
                  description: "For teams and large-scale projects",
                  features: [
                    "Everything in Pro",
                    "Team Collaboration",
                    "API Access",
                    "Dedicated Manager",
                    "Custom AI Training",
                    "White-label",
                  ],
                  popular: false,
                },
              ].map(
                ({ name, price, period, description, features, popular }) => (
                  <motion.div
                    key={name}
                    className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${
                      popular
                        ? "bg-indigo-50 border-indigo-500 shadow-lg scale-105"
                        : "bg-white border-gray-200 shadow-sm"
                    }`}
                    variants={itemVariants}
                    whileHover={{
                      y: -10,
                      boxShadow:
                        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    {popular && (
                      <motion.div
                        className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Most Popular
                      </motion.div>
                    )}
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {name}
                      </h3>
                      <div className="flex items-baseline justify-center space-x-1 mb-4">
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                          {price}
                        </span>
                        <span className="text-gray-500 text-sm sm:text-base">
                          {period}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {description}
                      </p>
                    </div>
                    <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                      {features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center space-x-2 sm:space-x-3"
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
                          <span className="text-gray-600 text-sm sm:text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      className={`cursor-pointer w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                        popular
                          ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to="/join">Get Started</Link>
                    </motion.button>
                  </motion.div>
                )
              )}
            </motion.div>
          </div>
        </section>

        <section
          id="testimonials"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by <span className="text-indigo-600">Creators</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                See what our users are saying about their PitchCraft experience
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  name: "Sarah Chen",
                  role: "Startup Founder",
                  content:
                    "PitchCraft helped us secure $500K in funding. The AI-generated pitch was incredibly professional.",
                  rating: 5,
                },
                {
                  name: "Marcus Johnson",
                  role: "Marketing Director",
                  content:
                    "The tagline maker and image generator have revolutionized our campaign creation process.",
                  rating: 5,
                },
                {
                  name: "Elena Rodriguez",
                  role: "Freelance Designer",
                  content:
                    "I save 10+ hours every week using PitchCraft's color palette and logo tools. Game changer!",
                  rating: 5,
                },
              ].map(({ name, role, content, rating }) => (
                <motion.div
                  key={name}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm"
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic text-sm sm:text-base">
                    "{content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">{name}</div>
                    <div className="text-indigo-600 text-sm">{role}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="team"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Meet Our <span className="text-indigo-600">Team</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                The creative minds behind PitchCraft
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  name: "Alex Morgan",
                  role: "CEO & Founder",
                  bio: "Tech entrepreneur with 10+ years in AI and creative industries",
                },
                {
                  name: "Jamie Chen",
                  role: "CTO",
                  bio: "Machine learning expert with a passion for creative applications",
                },
                {
                  name: "Taylor Reed",
                  role: "Head of Design",
                  bio: "Award-winning designer focused on user experience and aesthetics",
                },
              ].map(({ name, role, bio }) => (
                <motion.div
                  key={name}
                  className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm text-center"
                  variants={itemVariants}
                  whileHover={{
                    y: -10,
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <motion.div
                    className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-2 border-indigo-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {name}
                  </h3>
                  <div className="text-indigo-600 font-medium mb-4 text-sm sm:text-base">
                    {role}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base">{bio}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked{" "}
                <span className="text-indigo-600">Questions</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Everything you need to know about PitchCraft
              </p>
            </motion.div>

            <motion.div
              className="space-y-4 sm:space-y-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  question: "How does the AI pitch generator work?",
                  answer:
                    "Our AI analyzes your business information and generates professional pitch decks with compelling content, structure, and design suggestions.",
                },
                {
                  question: "Can I export my pitches to PDF?",
                  answer:
                    "Yes! All plans include PDF export functionality with customizable layouts and branding options.",
                },
                {
                  question: "What image formats are supported?",
                  answer:
                    "We support PNG, JPG, and SVG formats for AI-generated images, with high-resolution downloads available.",
                },
                {
                  question: "Is there a free trial?",
                  answer:
                    "Yes, we offer a 14-day free trial with access to all basic features. No credit card required.",
                },
                {
                  question: "Can I use PitchCraft for commercial projects?",
                  answer:
                    "Absolutely! All generated content is yours to use commercially across personal and professional projects.",
                },
              ].map(({ question, answer }) => (
                <motion.div
                  key={question}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm"
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                    {question}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">{answer}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="contact"
          className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Ready to <span className="text-indigo-600">Transform</span> Your
                Creativity?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of creators already using PitchCraft to bring
                their ideas to life
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-indigo-500 rounded-xl sm:rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-200 flex items-center space-x-3 group text-white w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/join"
                    className="text-base sm:text-lg font-semibold"
                  >
                    Start Free Trial
                  </Link>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  className="px-6 sm:px-8 py-3 sm:py-4 border border-indigo-300 text-indigo-600 rounded-xl sm:rounded-2xl hover:bg-indigo-50 transition-all duration-300 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule a Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <motion.div
                  className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  PitchCraft
                </span>
              </div>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                AI-powered creative suite for generating pitches, designs, and
                content that stands out.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                {[Twitter, Facebook, Instagram].map((Icon, index) => (
                  <motion.button
                    key={index}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-gray-900 font-semibold mb-4 text-sm sm:text-base">
                Product
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Pitch Generator",
                  "AI Images",
                  "Color Palette",
                  "Logo Maker",
                  "Idea Generator",
                  "Tagline Maker",
                ].map((item) => (
                  <motion.li key={item} whileHover={{ x: 5 }}>
                    <button className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-gray-900 font-semibold mb-4 text-sm sm:text-base">
                Company
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "About",
                  "Blog",
                  "Careers",
                  "Contact",
                  "Privacy",
                  "Terms",
                ].map((item) => (
                  <motion.li key={item} whileHover={{ x: 5 }}>
                    <button className="text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            className="border-t border-gray-200 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-sm text-gray-500 text-center mt-4">
              &copy; 2024 PitchCraft. All rights reserved. Built with ❤️ for
              creators worldwide. Created by{" "}
              <span className="font-semibold text-indigo-700">Saim Malik</span>.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
