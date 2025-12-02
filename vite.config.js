import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "widget.js",
      name: "HimsChatbot",
      fileName: "chatbot-widget",
      formats: ["iife"],
    },
  },
});
