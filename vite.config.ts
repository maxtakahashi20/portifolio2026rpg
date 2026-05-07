import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "https://portifolio2026rpg-1.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
