// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { eslintCommon } from "./shared/index.js";

import storybook from "eslint-plugin-storybook";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(...eslintCommon, ...ts.configs.recommended, ...storybook.configs["flat/recommended"]);
