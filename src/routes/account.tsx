import { AccountPage } from "~/components/pages";
import { useRequestEmailUpdateFormConnector, useUpdatePasswordFormConnector } from "~/connectors/forms";

import { WithPrivateSession } from "@a-novel/package-authenticator";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  head: ({ match }) => ({
    meta: [{ title: match.context.tolgee.t("metadata.account.title", { ns: "platform.authentication" }) }],
  }),
  component: WithPrivateSession(Account),
});

function Account() {
  const requestEmailUpdateConnector = useRequestEmailUpdateFormConnector();
  const updatePasswordConnector = useUpdatePasswordFormConnector();

  return (
    <AccountPage
      requestEmailUpdateConnector={requestEmailUpdateConnector}
      updatePasswordConnector={updatePasswordConnector}
    />
  );
}
