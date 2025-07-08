import { AccountPage } from "~/components/pages";
import { useRequestEmailUpdateFormConnector, useUpdatePasswordFormConnector } from "~/connectors/forms";

import { SessionPrivateSuspense } from "@a-novel/package-authenticator";
import type { RouteContext } from "@a-novel/tanstack-start-config";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account")({
  component: () => (
    <SessionPrivateSuspense>
      <Account />
    </SessionPrivateSuspense>
  ),
  beforeLoad: () =>
    ({
      getTitle: (tolgee) => tolgee.t("metadata.account.title", { ns: "platform.authentication" }),
    }) as RouteContext,
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
