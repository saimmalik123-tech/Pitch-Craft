import React, { createContext, useContext, useState } from "react";
import { supabase } from "../supabase";

const ImageContext = createContext();
export const useImage = () => useContext(ImageContext);

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HF_TOKEN;

const FLUX_MODELS = [
  "black-forest-labs/FLUX.1-dev",
  "black-forest-labs/FLUX.2-fast-Free",
  "black-forest-labs/FLUX.3-highres-Free",
  "black-forest-labs/FLUX.4-stylized-Free",
  "black-forest-labs/FLUX.5-cinematic-Free",
  "black-forest-labs/FLUX.6-artistic-Free",
  "black-forest-labs/FLUX.7-realistic-Free",
  "black-forest-labs/FLUX.8-fantasy-Free",
  "black-forest-labs/FLUX.9-abstract-Free",
  "black-forest-labs/FLUX.10-mini-Free",
];

export const ImageProvider = ({ children }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tryHuggingFace = async (prompt, model) => {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: "image/png" });
  };

  const tryPuter = async (prompt, model) => {
    if (!window.puter?.ai?.txt2img) return null;
    const imgElement = await window.puter.ai.txt2img(prompt, { model });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgElement.naturalWidth || 1024;
    canvas.height = imgElement.naturalHeight || 1024;
    ctx.drawImage(imgElement, 0, 0);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const generateImage = async (prompt, modelIndex = 0) => {
    if (!prompt || prompt.trim().length < 5) {
      setError("Prompt too short");
      return;
    }
    setLoading(true);
    setError("");
    let finalBlob = null;
    for (let i = modelIndex; i < FLUX_MODELS.length; i++) {
      try {
        finalBlob = await tryHuggingFace(prompt, FLUX_MODELS[i]);
        if (finalBlob) break;
      } catch (_) {}
    }
    if (!finalBlob) {
      try {
        finalBlob = await tryPuter(
          prompt,
          FLUX_MODELS[modelIndex] || FLUX_MODELS[0]
        );
      } catch (_) {}
    }
    if (!finalBlob) {
      setError("All models failed");
      setLoading(false);
      return;
    }
    const filename = `generated/${Date.now()}.png`;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filename, finalBlob, {
        cacheControl: "3600",
        upsert: false,
        metadata: { user_id: userData.user.id },
      });
    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }
    const { data: publicData, error: urlError } = supabase.storage
      .from("images")
      .getPublicUrl(filename);
    if (urlError) {
      setError(urlError.message);
      setLoading(false);
      return;
    }
    setGeneratedImages((prev) => [publicData.publicUrl, ...prev]);
    setLoading(false);
    return publicData.publicUrl;
  };

  return (
    <ImageContext.Provider
      value={{ generatedImages, generateImage, loading, error, FLUX_MODELS }}
    >
      {children}
    </ImageContext.Provider>
  );
};
