import { DecoratorComponent } from "../src/lib";
import "./preview.css";

import { LNG } from "@a-novel/uikit/const";
import "@a-novel/uikit/ui/designSystem.css";

import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/sveltekit";
import { themes } from "storybook/theming";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

themes.dark = {
  ...themes.dark,
  appBg: "#000000",
  appContentBg: "#000000",
  appPreviewBg: "#000000",
  fontBase: "Arimo, sans-serif",
  brandTitle: "A-Novel",
};

themes.light = {
  ...themes.light,
  appBg: "#FFFFFF",
  appContentBg: "#FFFFFF",
  appPreviewBg: "#FFFFFF",
  fontBase: "Arimo, sans-serif",
  brandTitle: "A-Novel",
};

// Create a global variable called locale in storybook
// and add a menu in the toolbar to change your locale
export const globalTypes = {
  locale: {
    name: "Locale",
    description: "Internationalization locale",
    toolbar: {
      icon: "globe",
      items: [
        { value: LNG.EN, title: "English" },
        { value: LNG.FR, title: "Francais" },
      ],
      showName: true,
    },
  },
};

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.dark,
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "dark",
      attributeName: "data-theme",
    }),
    (_, params) => ({
      Component: DecoratorComponent,
      props: {
        theme: params.globals.theme || "dark",
        locale: params.globals.locale,
      },
    }),
  ],

  initialGlobals: {
    viewport: {
      value: "ipad",
      isRotated: false,
    },
  },
};

export default preview;
