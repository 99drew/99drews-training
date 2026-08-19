import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build de preview pra publicar como Artifact em claude.ai: mesmo app, mesma lógica,
// tudo num único arquivo HTML autocontido (sem Service Worker/manifest — o sandbox do
// artifact não instala PWA nem faz push real; isso é só uma prévia visual/funcional
// compartilhável). Rodar com: npm run build:artifact
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  define: {
    __ARTIFACT_PREVIEW__: true,
  },
  build: {
    outDir: "dist-artifact",
    cssCodeSplit: false,
    rollupOptions: {
      input: "index.artifact.html",
    },
  },
});
