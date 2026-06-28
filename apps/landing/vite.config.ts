import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const sourceRoot = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
