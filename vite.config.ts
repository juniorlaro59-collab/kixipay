// @lovable.dev/vite-tanstack-config already includes the required TanStack,
// React, Tailwind, Cloudflare, env injection, and alias plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts.
// API calls go directly to VITE_API_URL; no Vite proxy is used.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
