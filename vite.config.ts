import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://back.dentin.cloud',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/sanctum': {
        target: 'https://back.dentin.cloud',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // 🔽 إضافة preview configuration
  preview: {
    host: "::",
    port: 8080,
    allowedHosts: ['dentin.cloud'] // 🔽 إضافة النطاق المسموح به
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));