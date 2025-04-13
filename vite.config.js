import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    host: true,
    sourcemapIgnoreList: false,
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
});
