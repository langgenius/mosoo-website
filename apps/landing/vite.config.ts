import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const sourceRoot = fileURLToPath(new URL("src", import.meta.url));
const appRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(appRoot, "index.html"),
        pricing: resolve(appRoot, "pricing.html"),
        status: resolve(appRoot, "status.html"),
        useCases: resolve(appRoot, "use-cases.html"),
        useCaseCodexPet: resolve(appRoot, "use-cases/codex-pet.html"),
        useCaseGoGym: resolve(appRoot, "use-cases/go-gym.html"),
        useCaseBlueprint: resolve(appRoot, "use-cases/blueprint.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(sourceRoot),
    },
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env["LANDING_DEV_PORT"] ?? "5173"),
    strictPort: true,
  },
});
