import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    global: "globalThis",
  },
  server: {
    proxy: {
      "/s3": {
        target: "http://127.0.0.1:8080", // Use IPv4 explicitly
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
