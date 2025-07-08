import { SessionPrivateSuspense } from "@a-novel/package-authenticator";
import type { RouteContext } from "@a-novel/tanstack-start-config";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <SessionPrivateSuspense>
      <Home />
    </SessionPrivateSuspense>
  ),
  beforeLoad: () =>
    ({
      getTitle: (tolgee) => tolgee.t("metadata.home.title", { ns: "platform.authentication" }),
    }) as RouteContext,
});

function Home() {
  return null;
}
