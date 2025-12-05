import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|ts|svelte)"],
  addons: [
    {
      name: getAbsolutePath("@storybook/addon-svelte-csf"),
      options: {},
    },
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-themes"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/sveltekit"),
    options: {},
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
