import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { PitchProvider } from "./context/PitchContext.jsx";
import { GeminiProvider } from "./context/GeminiContext.jsx";
import { ImageProvider } from "./context/ImageContext.jsx";
import { ChakraProvider } from "@chakra-ui/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GeminiProvider>
          <PitchProvider>
            <ImageProvider>
              <App />
            </ImageProvider>
          </PitchProvider>
        </GeminiProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
