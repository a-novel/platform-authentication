import { defineConfig } from "vite";

import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    sourcemap: true,
  },
  resolve: { dedupe: ["svelte"] },
});
