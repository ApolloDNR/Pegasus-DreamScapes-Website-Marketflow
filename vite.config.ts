import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { existsSync, realpathSync } from "fs";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const projectRoot = import.meta.dirname;
const localNodeModules = path.resolve(projectRoot, "node_modules");
const nodeModulesRoot = existsSync(localNodeModules)
  ? realpathSync(localNodeModules)
  : localNodeModules;

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(projectRoot, "client"),
  build: {
    outDir: path.resolve(projectRoot, "dist/public"),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      output: {
        // §32.9 performance budget: keep the app entry lean and let the
        // stable framework code cache independently across deploys.
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-app": ["wouter", "@tanstack/react-query", "lucide-react"],
          // The shared, stable project record is used by Home and the case study.
          // Cache it independently instead of duplicating evidence in the app entry.
          "nelson-record": [path.resolve(projectRoot, "client/src/pegasus/nelson-gallery-data.ts"), path.resolve(projectRoot, "client/src/pegasus/nelson-story.ts")],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      allow: [projectRoot, nodeModulesRoot],
      deny: ["**/.*"],
    },
  },
});
