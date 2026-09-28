import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base './' so the built site works from any static host path (GitHub Pages, Vercel, file://)
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    fs: {
      // Allow reading up to the repo root: the case corpus lives one level up
      // (evidence-engine/, shared with the MCP server) and the noir design
      // system lives at the repo root (design-system/), imported by the styles.
      allow: ["../.."],
    },
  },
});
