import { ErrorComponent, NotFoundComponent, RootComponent } from "~/components";

import { type AgoraRouterContext } from "@a-novel/package-ui/tanstack/start";

import arimo from "@fontsource-variable/arimo?url";
import { createRootRouteWithContext } from "@tanstack/react-router";

export const Route = createRootRouteWithContext<AgoraRouterContext>()({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
    links: [
      { href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined", rel: "stylesheet" },
      { href: arimo, rel: "stylesheet" },
      { rel: "icon", href: "/icon.png" },
    ],
  }),
  shellComponent: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});
