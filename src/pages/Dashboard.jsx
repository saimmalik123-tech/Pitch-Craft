import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  FolderOpen,
  Share2,
  Menu,
  X,
  User,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  BarChart3,
  PlusCircle,
  Image,
  Palette,
  Brain,
  Loader2,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { usePitch } from "../context/PitchContext";
import { supabase } from "../supabase";

import CreatePitch from "../components/CreatePitch";
import SavedPitches from "../components/SavedPitches";
import ImageGenerator from "../components/ImageGenerator";
import ColorPalette from "../components/ColorPalette";
import AITools from "../components/AITools";
import Export from "../components/Export";
import Settings from "../components/Settings";

const Dashboard = () => {
  const { pitches, savedPitches, generatedImages, colorPalettes, images } =
    usePitch();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Create Pitch", icon: <FilePlus2 className="w-5 h-5" /> },
    { name: "Saved Pitches", icon: <FolderOpen className="w-5 h-5" /> },
    { name: "Export", icon: <Share2 className="w-5 h-5" /> },
    { name: "Image Generator", icon: <Image className="w-5 h-5" /> },
    { name: "Color Palette", icon: <Palette className="w-5 h-5" /> },
    { name: "AI Tools", icon: <Brain className="w-5 h-5" /> },
    { name: "Settings", icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (active) {
      case "Create Pitch":
        return <CreatePitch />;
      case "Saved Pitches":
        return <SavedPitches />;
      case "Image Generator":
        return <ImageGenerator />;
      case "Color Palette":
        return <ColorPalette />;
      case "AI Tools":
        return <AITools />;
      case "Export":
        return <Export />;
      case "Settings":
        return <Settings />;
      default:
        return (
          <DashboardHome
            pitches={pitches}
            savedPitches={savedPitches}
            generatedImages={generatedImages}
            colorPalettes={colorPalettes}
            images={images}
            setActive={setActive}
            user={user}
          />
        );
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-indigo-600 font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex fixed w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed z-50 inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-md border-r border-indigo-100 shadow-xl transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:shadow-lg overflow-hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h1 className="text-2xl font-extrabold text-indigo-700 flex items-center">
            <Sparkles className="w-6 h-6 mr-2" />
            PitchCraft
          </h1>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-indigo-600 hover:bg-indigo-100 p-1 rounded-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-24">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActive(item.name);
                setOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all border group ${
                active === item.name
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800 shadow-md"
                  : "border-transparent text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-sm"
              }`}
            >
              <span
                className={`${
                  active === item.name
                    ? "text-indigo-700"
                    : "text-gray-500 group-hover:text-indigo-600"
                } transition-colors`}
              >
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
              {active === item.name && (
                <ChevronRight className="w-4 h-4 ml-auto text-indigo-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md">
                {!user ? (
                  <User className="h-5 w-5" />
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.user_metadata?.full_name || "User"
                    )}&background=4F46E5&color=ffffff&size=128&rounded=true`}
                    alt={user.user_metadata?.full_name || "User Avatar"}
                    className="w-full h-ful rounded-full object-cover border-4 shadow-lg"
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-indigo-800 truncate">
                  {user.email || "Loading..."}
                </p>
                <p className="text-xs text-indigo-600 truncate">
                  {user.user_metadata?.full_name || "Loading..."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogout(true)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-indigo-100 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden rounded-lg bg-indigo-50 p-2 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-indigo-800 truncate flex items-center">
              {active === "Dashboard" && (
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              )}
              {active}
            </h2>
          </div>

          {window.innerWidth <= 768 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActive("Settings")}
                className="flex sm:hidden rounded-lg cursor-pointer bg-indigo-50 p-2 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowLogout(true)}
                className="rounded-lg bg-red-50 p-2 cursor-pointer text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/70">
          {renderContent()}
        </main>
      </div>

      <AnimatePresence>
        {showLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm border border-indigo-200 shadow-2xl"
            >
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full cursor-pointer bg-red-100 flex items-center justify-center">
                  <LogOut className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-indigo-800 text-center">
                Confirm Logout
              </h3>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Are you sure you want to logout?
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 py-2 font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 rounded-xl bg-red-500 py-2 font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DashboardHome = ({
  pitches,
  savedPitches,
  colorPalettes,
  setActive,
  images,
  user,
}) => {
  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 justify-start">
        <div className="relative">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.user_metadata?.full_name || "User"
            )}&background=4F46E5&color=ffffff&size=128&rounded=true`}
            alt={user.user_metadata?.full_name || "User Avatar"}
            className="w-17 h-17 sm:w-25 sm:h-25 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
          />
          <div className="absolute animate-bounce bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome back!
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">
            {user.user_metadata?.full_name || ""}
          </p>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Total Pitches",
            value: pitches.length,
            icon: FilePlus2,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Saved Pitches",
            value: savedPitches.length,
            icon: FolderOpen,
            color: "from-indigo-500 to-indigo-600",
            bgColor: "bg-indigo-50",
          },
          {
            title: "AI Images",
            value: images.length,
            icon: Image,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-50",
          },
          {
            title: "Color Palettes",
            value: colorPalettes.length,
            icon: Palette,
            color: "from-pink-500 to-pink-600",
            bgColor: "bg-pink-50",
          },
        ].map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{c.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {c.value}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-r ${c.color} flex items-center justify-center text-white shadow-md`}
              >
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Sparkles className="h-5 w-5 text-indigo-600" /> Recent Pitch
          </h3>
          {pitches.length > 0 ? (
            <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border border-indigo-100 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-indigo-800">
                {pitches[pitches.length - 1].title}
              </h4>
              <p className="mt-1 text-sm text-indigo-600 line-clamp-2">
                {pitches[pitches.length - 1].description}
              </p>
              <div className="mt-3 flex items-center text-xs text-indigo-500">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(
                  pitches[pitches.length - 1].created_at
                ).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FilePlus2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No pitches yet</p>
              <button
                onClick={() => setActive("Create Pitch")}
                className="mt-3 text-indigo-600 font-medium text-sm hover:text-indigo-700"
              >
                Create your first pitch
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <BarChart3 className="h-5 w-5 text-indigo-600" /> Activity
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Pitches created",
                value: pitches.length,
                icon: FilePlus2,
                color: "text-blue-600",
              },
              {
                label: "Images generated",
                value: images.length,
                icon: Image,
                color: "text-purple-600",
              },
              {
                label: "Color palettes",
                value: colorPalettes.length,
                icon: Palette,
                color: "text-pink-600",
              },
              {
                label: "Saved items",
                value: savedPitches.length,
                icon: FolderOpen,
                color: "text-indigo-600",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Create Pitch",
              page: "Create Pitch",
              icon: PlusCircle,
              color: "from-blue-500 to-blue-600",
            },
            {
              label: "Image Generator",
              page: "Image Generator",
              icon: Image,
              color: "from-purple-500 to-purple-600",
            },
            {
              label: "Color Palette",
              page: "Color Palette",
              icon: Palette,
              color: "from-pink-500 to-pink-600",
            },
            {
              label: "AI Tools",
              page: "AI Tools",
              icon: Brain,
              color: "from-indigo-500 to-indigo-600",
            },
          ].map((a) => (
            <motion.button
              key={a.page}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(a.page)}
              className="rounded-xl bg-gradient-to-r p-4 font-medium text-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
              }}
            >
              <a.icon className="h-5 w-5" />
              {a.label}
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
