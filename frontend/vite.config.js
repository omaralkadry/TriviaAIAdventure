import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  json: {
    namedExports: true, // Enables named exports for JSON files
    stringify: false,   // Prevents JSON stringification
  },
});