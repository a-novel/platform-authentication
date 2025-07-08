import { Layout } from "~/components";

import { createAgoraRootRoute } from "@a-novel/tanstack-start-config";

export const Route = createAgoraRootRoute({
  layout: Layout,
  tolgee: {
    titleNS: "platform.authentication",
  },
});
