import { defineConfig } from "vite";

import svgr from "@svgr/rollup";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_SERVER_PORT ?? "0", 10) || undefined,
  },
  build: {
    chunkSizeWarningLimit: 999999,
    sourcemap: true,
  },
  esbuild: {
    logLevel: "error",
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.build.json"] }),
    // SVGO is disabled because it messes up with some icons by removing intermediate tags.
    svgr({ icon: true, svgo: false }),
    tanstackStart({ customViteReactPlugin: true }),
    viteReact(),
  ],
});
