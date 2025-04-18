import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    host: "0.0.0.0",
    sourcemapIgnoreList: false,
    proxy: {
      // 配置代理
      "/fileUploadAndDownload": {
        target: "120.79.47.172:9081", // 替换为你的后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fileUploadAndDownload/, ""),
        // 如果需要，可以添加自定义请求头
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
      // 如果有其他接口地址，可以继续添加
      "/upload": {
        target: "http://your-upload-server.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload/, ""),
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    devSourcemap: true,
  },
  build: {
    sourcemap: true,
  },
  plugins: [
    vue({
      reactivityTransform: true,
      template: {
        compilerOptions: {
          // This makes components easier to inspect in dev tools
          whitespace: "preserve",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
