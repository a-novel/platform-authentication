import { defineConfig } from "vite";

import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    // SVGO is disabled because it messes up with some icons by removing intermediate tags.
    svgr({
      icon: true,
      svgo: false,
    }),
  ],
});
