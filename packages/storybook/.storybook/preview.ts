import { DecoratorComponent } from "../src/lib";
import "./preview.css";

import { preview, setThemes } from "@a-novel/uikit/storybook";
import "@a-novel/uikit/ui/designSystem.css";

import { themes } from "storybook/theming";

setThemes(themes);

preview.decorators = [
  () => ({
    Component: DecoratorComponent,
  }),
  ...(preview.decorators ? (Array.isArray(preview.decorators) ? preview.decorators : [preview.decorators]) : []),
];

export default { ...preview };
