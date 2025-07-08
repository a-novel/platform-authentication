import { routeTree } from "./routeTree.gen";

import { init as initAuthAPI } from "@a-novel/connector-authentication";
import { init as initAuthenticator } from "@a-novel/package-authenticator";
import { createAgoraRouter } from "@a-novel/tanstack-start-config";

import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

if (import.meta.env.DEV) {
  console.log(`starting server with env:`, JSON.stringify(import.meta.env, null, 2));
}

initAuthAPI({ baseURL: import.meta.env.VITE_AUTH_API_URL });
initAuthenticator({});

export function createRouter() {
  return createAgoraRouter({ routeTree, queryClient });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
