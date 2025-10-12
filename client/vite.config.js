import { defineConfig, searchForWorkspaceRoot } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    fs: {
      allow: [
        // Allow serving files from one level up to the project root
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
