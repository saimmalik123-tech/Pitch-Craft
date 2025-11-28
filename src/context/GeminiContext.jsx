import React, { createContext, useContext, useState } from "react";

const GeminiContext = createContext();

export const GeminiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const callGeminiText = async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (err) {
      console.error("Gemini Text API Error:", err);
      setError(err);
      return "";
    } finally {
      setLoading(false);
    }
  };

  const callGeminiImage = async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { image_config: { size: "1024x1024" } },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.image?.url || "";
    } catch (err) {
      console.error("Gemini Image API Error:", err);
      setError(err);
      return "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <GeminiContext.Provider
      value={{ callGeminiText, callGeminiImage, loading, error }}
    >
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = () => useContext(GeminiContext);
