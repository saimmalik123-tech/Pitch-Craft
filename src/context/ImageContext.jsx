import React, { createContext, useContext, useState } from "react";
import { supabase } from "../supabase";

const ImageContext = createContext();
export const useImage = () => useContext(ImageContext);

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HF_TOKEN;

const FLUX_MODELS = [
  "black-forest-labs/FLUX.1-dev",
  "black-forest-labs/FLUX.1-schnell",
  "black-forest-labs/FLUX.1-fast-Free",
  "black-forest-labs/FLUX.1-highres-Free",
  "black-forest-labs/FLUX.1-stylized-Free",
  "black-forest-labs/FLUX.1-cinematic-Free",
  "black-forest-labs/FLUX.1-artistic-Free",
  "black-forest-labs/FLUX.1-realistic-Free",
  "black-forest-labs/FLUX.1-fantasy-Free",
  "black-forest-labs/FLUX.1-abstract-Free",
  "black-forest-labs/FLUX.1-mini-Free",
];

const TOGETHER_MODELS = [
  // "black-forest-labs/FLUX.1-dev",
  "black-forest-labs/FLUX.1-schnell-Free",
  // "stabilityai/stable-diffusion",
  // "runwayml/stable-diffusion-v1-5",
];

export const ImageProvider = ({ children }) => {
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tryHuggingFace = async (prompt, model) => {
    console.log(`Trying Hugging Face model: ${model}`);
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
    if (!response.ok) {
      console.log(`Hugging Face model ${model} failed`);
      return null;
    }
    console.log(`Hugging Face model ${model} succeeded`);
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: "image/png" });
  };

  const tryPuter = async (prompt) => {
    console.log("Switching to Puter as fallback");
    if (!window.puter?.ai?.txt2img) {
      console.log("Puter not available");
      return null;
    }

    // Try Together.ai models that work with Puter
    for (const model of TOGETHER_MODELS) {
      try {
        console.log(`Attempting Puter with model: ${model}`);
        const imgElement = await window.puter.ai.txt2img(prompt, { model });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = imgElement.naturalWidth || 1024;
        canvas.height = imgElement.naturalHeight || 1024;
        ctx.drawImage(imgElement, 0, 0);
        console.log(`Puter generation succeeded with model: ${model}`);
        return await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
      } catch (error) {
        console.log(`Puter model ${model} failed:`, error.message);
      }
    }

    console.log("All Puter models failed");
    return null;
  };

  const generateImage = async (prompt, modelIndex = 0) => {
    console.log(`Starting image generation with prompt: "${prompt}"`);
    if (!prompt || prompt.trim().length < 5) {
      console.log("Prompt validation failed: too short");
      setError("Prompt too short");
      return;
    }
    setLoading(true);
    setError("");
    let finalBlob = null;
    let lastTriedModel = null;

    console.log(`Starting with model index: ${modelIndex}`);
    for (let i = modelIndex; i < FLUX_MODELS.length; i++) {
      lastTriedModel = FLUX_MODELS[i];
      console.log(`Attempting model: ${lastTriedModel}`);
      try {
        finalBlob = await tryHuggingFace(prompt, lastTriedModel);
        if (finalBlob) {
          console.log(
            `Successfully generated image with model: ${lastTriedModel}`
          );
          break;
        }
      } catch (error) {
        console.log(`Error with model ${lastTriedModel}:`, error);
      }
    }

    if (!finalBlob) {
      console.log("All Hugging Face models failed, trying Puter");
      try {
        finalBlob = await tryPuter(prompt);
      } catch (error) {
        console.log("Puter failed:", error);
      }
    }

    if (!finalBlob) {
      console.log("All generation attempts failed");
      setError("All models failed");
      setLoading(false);
      return;
    }

    console.log("Image generated successfully, uploading to storage");
    const filename = `generated/${Date.now()}.png`;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      console.log("User authentication failed");
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    console.log(`Uploading image as ${filename}`);
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filename, finalBlob, {
        cacheControl: "3600",
        upsert: false,
        metadata: { user_id: userData.user.id },
      });
    if (uploadError) {
      console.log("Upload error:", uploadError);
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    console.log("Getting public URL for uploaded image");
    const { data: publicData, error: urlError } = supabase.storage
      .from("images")
      .getPublicUrl(filename);
    if (urlError) {
      console.log("URL generation error:", urlError);
      setError(urlError.message);
      setLoading(false);
      return;
    }

    console.log(
      `Image successfully generated and available at: ${publicData.publicUrl}`
    );
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
