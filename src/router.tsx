import { ErrorComponent, NotFoundComponent } from "~/components";

import { routeTree } from "./routeTree.gen";

import { init as initAuthAPI } from "@a-novel/connector-authentication";
import { routerWithAgoraContext } from "@a-novel/package-ui/tanstack/start";
import { getDefaultTolgeePreset } from "@a-novel/package-ui/translations";

import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";

// =====================================================================================================================
// Initialize dependencies.
// =====================================================================================================================

initAuthAPI({ baseURL: import.meta.env.VITE_SERVICE_AUTH_URL });

const tolgee = getDefaultTolgeePreset({ cdn: import.meta.env.VITE_TOLGEE_CDN });
await tolgee.addActiveNs("platform.authentication");

// =====================================================================================================================
// Create router.
// =====================================================================================================================

export function createRouter() {
  const queryClient = new QueryClient();

  const baseRouter = createTanstackRouter({
    routeTree,
    context: {
      tolgee,
      queryClient,
      titleTemplate: (title: string) => `${title} | Agora Social`,
    },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: NotFoundComponent,
    defaultErrorComponent: ErrorComponent,
  });

  return routerWithAgoraContext(baseRouter, { tolgee, queryClient });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
