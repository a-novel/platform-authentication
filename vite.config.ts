import { defineConfig } from "vite";

import svgr from "@svgr/rollup";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: parseInt(process.env.CLIENT_PORT ?? "8080", 10),
  },
  build: {
    chunkSizeWarningLimit: 999999,
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    // SVGO is disabled because it messes up with some icons by removing intermediate tags.
    svgr({ icon: true, svgo: false }),
    tanstackStart({ target: "node-server" }),
  ],
});
