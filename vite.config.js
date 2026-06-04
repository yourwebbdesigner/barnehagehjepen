import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          "vendor-pdf": ["jspdf"],
        },
      },
    },
  },
});
