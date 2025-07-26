import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      include: ["src/**/*.tsx"],
      exclude: ["src/routes/**/*", "src/routes.test/**/*", "**/*.{test,spec}.{js,jsx,mjs,ts,tsx}"],
    },
  },
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "./vite.storybook.config.ts",
      },
    },
  },
};
export default config;
