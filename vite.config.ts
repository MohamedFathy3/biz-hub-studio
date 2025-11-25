import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 7000, 
    proxy: {
      "/api": {
        target: "https://back.dentin.cloud",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
            proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
            console.log("Response Headers:", proxyRes.headers);
          });
        },
      },
      "/sanctum": {
        target: "https://back.dentin.cloud",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("sanctum proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Sanctum Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Sanctum Response Headers:", proxyRes.headers);
          });
        },
      },
    },
  },
  // 🔽 إضافة هذا القسم لحل المشكلة
  preview: {
    host: "::",
    port: 7000,
    allowedHosts: [
      'dentin.cloud',
      'localhost',
      '127.0.0.1',
      '::1',
      '.dentin.cloud' // للسماح بالنطاقات الفرعية أيضاً
    ]
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));