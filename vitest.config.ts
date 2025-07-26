import svgr from "@svgr/rollup";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    viteReact(),
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
    alias: {
      "#": "/__test__",
      "~": "/src",
    },
    coverage: {
      enabled: true,
      clean: false,
      provider: "istanbul",
      reporter: ["json"],
      reportsDirectory: "./coverage/unit",
      include: ["src/**/*.{ts,tsx}"],
    },
    environment: "jsdom",
    server: {
      deps: {
        // Allows to mock the tolgee instance used by the UI components.
        inline: ["@a-novel/package-ui", "@a-novel/package-authenticator"],
      },
    },
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/routes.test"],
  },
});
