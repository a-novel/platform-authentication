// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { eslintCommon } from "../../shared/index.js";
import svelteConfig from "./svelte.config.js";

import svelte from "eslint-plugin-svelte";
import { defineConfig, globalIgnores } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  globalIgnores([".wuchale", "build", "dist", ".svelte-kit"]),
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  ...svelte.configs.prettier,
  ...eslintCommon,
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
  }
);
