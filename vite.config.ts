import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        icon: true,
        // exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/test.setup.ts",
    include: ["**/?(*.)test.ts?(x)"],
    coverage: {
      enabled: true,
      provider: "istanbul",
      reporter: ["html", "text", "text-summary", "json"],
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      components: path.resolve("src/components/"),
      pages: path.resolve("src/pages/"),
      constants: path.resolve("src/constants/"),
      routes: path.resolve("src/routes/"),
    },
  },
  preview: {
    port: 3000,
    host: true
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true,
    }
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
  build: {
    outDir: "dist",
    assetsDir: "src/assets",
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern'
      }
    }
  }
});
