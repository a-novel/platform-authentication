import svgr from "@svgr/rollup";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    // SVGO is disabled because it messes up with some icons by removing intermediate tags.
    svgr({ icon: true, svgo: false }),
  ],

  build: {
    minify: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    alias: {
      "#": "/__test__",
      "~": "/src",
    },
    server: {
      deps: {
        // Mock the tolgee instance used by the UI components.
        inline: ["@a-novel/neon-ui", "@a-novel/package-authenticator", "@a-novel/tanstack-start-config"],
      },
    },
    coverage: {
      enabled: true,
      clean: true,
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}", "__test__/**/*.{ts,tsx}"],
    },
  },
});
