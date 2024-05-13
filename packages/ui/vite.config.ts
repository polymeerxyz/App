import { crx } from "@crxjs/vite-plugin";
import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import manifest from "./manifest/base.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    svgr(),
    react(),
    crx({
      manifest: {
        ...manifest,
        background: {
          service_worker: "src/scripts/sw.ts",
          type: "module",
        },
        action: {
          default_popup: "index.html",
          default_title: "Polymeer",
        },
        icons: {
          "16": process.env.NODE_ENV === "production" ? "icon16.png" : "dev_icon16.png",
          "32": process.env.NODE_ENV === "production" ? "icon32.png" : "dev_icon32.png",
          "48": process.env.NODE_ENV === "production" ? "icon48.png" : "dev_icon48.png",
          "128": process.env.NODE_ENV === "production" ? "icon128.png" : "dev_icon128.png",
        },
      },
    }),
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util"],
      exclude: ["fs", "path", "vm"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    fs: {
      cachedChecks: false,
    },
  },
});
