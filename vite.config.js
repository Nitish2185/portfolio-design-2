import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb"],
  // three.js + gsap + cannon-es ship in one ~1MB chunk, same as the original site
  build: { chunkSizeWarningLimit: 1200 },
});
