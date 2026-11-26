import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/calendrier-en-ligne/",
  root: "demo",
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: "demo-dist",
    emptyOutDir: true,
  },
});
