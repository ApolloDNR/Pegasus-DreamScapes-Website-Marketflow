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
  },
  server: {
    fs: {
      strict: true,
      allow: [projectRoot, nodeModulesRoot],
      deny: ["**/.*"],
    },
  },
});
