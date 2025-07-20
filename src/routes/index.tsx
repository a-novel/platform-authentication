import { WithPrivateSession } from "@a-novel/package-authenticator";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: ({ match }) => ({
    meta: [{ title: match.context.tolgee.t("metadata.home.title", { ns: "platform.authentication" }) }],
  }),
  component: WithPrivateSession(Home),
});

function Home() {
  return null;
}
