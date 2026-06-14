import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base './' so the built site works from any static host path (GitHub Pages, Vercel, file://)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    fs: {
      // the case corpus lives one level up, shared with the MCP server
      allow: [".."],
    },
  },
});
