import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration: React plugin, default port 5173.
export default defineConfig({
  plugins: [react()],
});
