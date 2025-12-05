import { adapter as svelte } from "@wuchale/svelte";
import { defineConfig } from "wuchale";

export default defineConfig({
  source: "en",
  otherLocales: ["fr"],
  adapters: {
    main: svelte({
      loader: "sveltekit",
      files: ["src/lib/**/*.svelte"],
    }),
  },
});
