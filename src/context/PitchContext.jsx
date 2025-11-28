import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useGemini } from "./GeminiContext";
import { supabase } from "../supabase";

const PitchContext = createContext();

export const PitchProvider = ({ children }) => {
  const { user } = useAuth();
  const { callGeminiText, callGeminiImage } = useGemini();

  const [images, setImages] = useState([]);
  const [pitches, setPitches] = useState([]);
  const [savedPitches, setSavedPitches] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [colorPalettes, setColorPalettes] = useState([]);
  const [aiTools, setAiTools] = useState({
    ideas: [],
    taglines: [],
    blogs: [],
    scripts: [],
  });
  const [loading, setLoading] = useState({
    idea: false,
    tagline: false,
    blog: false,
    script: false,
    image: false,
    palette: false,
    pitch: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) fetchAllAITools();
    else {
      setSavedPitches([]);
      setAiTools({ ideas: [], taglines: [], blogs: [], scripts: [] });
    }
  }, [user]);

  const fetchPitches = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPitches(data);
      setSavedPitches(data);
    } catch (err) {
      setError("Failed to load your pitches.", err);
    }
  }, [user]);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);

  const fetchAllAITools = async () => {
    if (!user) return;
    try {
      const [ideas, taglines, blogs] = await Promise.all([
        fetchIdeas(),
        fetchTaglines(),
        fetchBlogs(),
      ]);
      setAiTools({ ideas, taglines, blogs, scripts: [] });
    } catch {
      setError("Failed to load your AI tools.");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchPalettes = async () => {
      try {
        const { data, error } = await supabase
          .from("color_palettes")
          .select("*");
        if (error) throw error;
        setColorPalettes(data);
      } catch (err) {
        console.error("Error fetching color palettes:", err);
      }
    };
    fetchPalettes();

    const channel = supabase
      .channel("color-palettes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "color_palettes" },
        () => {
          fetchPalettes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchIdeas = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "idea")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      setError("Failed to load your ideas.");
      return [];
    }
  };

  const fetchImages = async () => {
    if (!user.id) return;
    console.log(user.id)
    try {
      const { data, error } = await supabase
        .from("ai_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data) setImages([]);
      else setImages(data);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to load your images.");
    }
  };
  useEffect(() => {
    if (!user) return;
    fetchImages();
  }, [user]);

  const fetchTaglines = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "tagline")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      setError("Failed to load your taglines.");
      return [];
    }
  };

  const fetchBlogs = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "blog")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch {
      setError("Failed to load your blogs.");
      return [];
    }
  };

  const saveAITool = async (toolData) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .insert([{ user_id: user.id, ...toolData }])
        .select();
      if (error) throw error;
      if (toolData.type === "idea")
        setAiTools((prev) => ({ ...prev, ideas: [data[0], ...prev.ideas] }));
      else if (toolData.type === "tagline")
        setAiTools((prev) => ({
          ...prev,
          taglines: [data[0], ...prev.taglines],
        }));
      else if (toolData.type === "blog")
        setAiTools((prev) => ({ ...prev, blogs: [data[0], ...prev.blogs] }));
      return data[0];
    } catch {
      setError("Failed to save your AI tool.");
      return null;
    }
  };

  const deleteAITool = async (id) => {
    if (!user) return;
    try {
      let itemType = null;
      let itemArray = [];

      const ideaIndex = aiTools.ideas.findIndex((item) => item.id === id);
      if (ideaIndex !== -1) {
        itemType = "idea";
        itemArray = [...aiTools.ideas];
        itemArray.splice(ideaIndex, 1);
      }

      const taglineIndex = aiTools.taglines.findIndex((item) => item.id === id);
      if (taglineIndex !== -1) {
        itemType = "tagline";
        itemArray = [...aiTools.taglines];
        itemArray.splice(taglineIndex, 1);
      }

      const blogIndex = aiTools.blogs.findIndex((item) => item.id === id);
      if (blogIndex !== -1) {
        itemType = "blog";
        itemArray = [...aiTools.blogs];
        itemArray.splice(blogIndex, 1);
      }

      if (!itemType) throw new Error("Item not found");

      const { error } = await supabase
        .from("ai_tools")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;

      setAiTools((prev) => ({ ...prev, [itemType + "s"]: itemArray }));
    } catch {
      setError("Failed to delete your AI tool.");
    }
  };

  const createPitch = async (pitchesArray) => {
    if (!user) return null;
    setLoading((prev) => ({ ...prev, pitch: true }));
    setError(null);
    try {
      const pitchData = pitchesArray[pitchesArray.length - 1];
      const { data, error } = await supabase
        .from("pitches")
        .insert([
          {
            user_id: user.id,
            title: pitchData.title || "Untitled Pitch",
            category: pitchData.category || "",
            company: pitchData.company || "",
            product: pitchData.product || "",
            tagline: pitchData.tagline || "",
            description: pitchData.description || "",
            problem: pitchData.problem || "",
            solution: pitchData.solution || "",
            target_market: pitchData.targetMarket || "",
            competition: pitchData.competition || "",
            business_model: pitchData.businessModel || "",
            funding: pitchData.funding || "",
            team: pitchData.team || "",
          },
        ])
        .select();
      if (error) throw error;
      setPitches((prev) => [data[0], ...prev]);
      setSavedPitches((prev) => [data[0], ...prev]);
      return data[0];
    } catch {
      setError("Failed to save your pitch.");
    } finally {
      setLoading((prev) => ({ ...prev, pitch: false }));
    }
  };

  const updatePitch = async (id, updatedData) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("pitches")
        .update(updatedData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select();
      if (error) throw error;
      setPitches(
        pitches.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );
      setSavedPitches(
        savedPitches.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );
      return data[0];
    } catch {
      setError("Failed to update your pitch.");
    }
  };

  const deletePitch = async (id) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("pitches")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setPitches(pitches.filter((p) => p.id !== id));
      setSavedPitches(savedPitches.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete your pitch.");
    }
  };

  const generateIdea = async (topic) => {
    setLoading((prev) => ({ ...prev, idea: true }));
    setError(null);
    try {
      const ideaText = await callGeminiText(
        `Generate a creative business idea about ${topic}`
      );
      const newIdea = { type: "idea", topic, content: ideaText };
      await saveAITool(newIdea);
      return ideaText;
    } finally {
      setLoading((prev) => ({ ...prev, idea: false }));
    }
  };

  const generateTagline = async (company, product) => {
    setLoading((prev) => ({ ...prev, tagline: true }));
    setError(null);
    try {
      const taglineText = await callGeminiText(
        `Generate a catchy tagline for ${product} by ${company}`
      );
      const newTagline = {
        type: "tagline",
        company,
        product,
        content: taglineText,
      };
      await saveAITool(newTagline);
      return taglineText;
    } finally {
      setLoading((prev) => ({ ...prev, tagline: false }));
    }
  };

  const generateBlog = async (topic) => {
    setLoading((prev) => ({ ...prev, blog: true }));
    setError(null);
    try {
      const blogContent = await callGeminiText(
        `Write a detailed blog post about ${topic}`
      );
      const newBlog = {
        type: "blog",
        topic,
        title: `The Ultimate Guide to ${topic}`,
        content: blogContent,
      };
      await saveAITool(newBlog);
      return { title: newBlog.title, content: blogContent };
    } finally {
      setLoading((prev) => ({ ...prev, blog: false }));
    }
  };

  const generateScript = async (topic, duration) => {
    setLoading((prev) => ({ ...prev, script: true }));
    setError(null);
    try {
      const scriptText = await callGeminiText(
        `Write a video script about ${topic} for ${duration} minutes`
      );
      const newScript = {
        type: "script",
        topic,
        duration,
        content: scriptText,
      };
      await saveAITool(newScript);
      return scriptText;
    } finally {
      setLoading((prev) => ({ ...prev, script: false }));
    }
  };

  const generateImage = async (prompt) => {
    setLoading((prev) => ({ ...prev, image: true }));
    setError(null);
    try {
      const url = await callGeminiImage(prompt);
      const newImage = {
        id: Date.now(),
        prompt,
        url,
        createdAt: new Date().toISOString(),
      };
      setGeneratedImages([...generatedImages, newImage]);
      return url;
    } finally {
      setLoading((prev) => ({ ...prev, image: false }));
    }
  };

  const generateColorPalette = () => {
    setLoading((prev) => ({ ...prev, palette: true }));
    setError(null);
    try {
      const generateRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++)
          color += letters[Math.floor(Math.random() * 16)];
        return color;
      };
      const newPalette = {
        id: Date.now(),
        colors: Array(5).fill().map(generateRandomColor),
        createdAt: new Date().toISOString(),
      };
      setColorPalettes([...colorPalettes, newPalette]);
      return newPalette.colors;
    } finally {
      setLoading((prev) => ({ ...prev, palette: false }));
    }
  };

  return (
    <PitchContext.Provider
      value={{
        pitches,
        savedPitches,
        generatedImages,
        colorPalettes,
        aiTools,
        loading,
        error,
        images,
        createPitch,
        updatePitch,
        deletePitch,
        generateIdea,
        generateTagline,
        generateBlog,
        generateScript,
        generateImage,
        generateColorPalette,
        fetchIdeas,
        fetchTaglines,
        fetchBlogs,
        deleteAITool,
        fetchPitches,
        fetchImages,
      }}
    >
      {children}
    </PitchContext.Provider>
  );
};

export const usePitch = () => useContext(PitchContext);
