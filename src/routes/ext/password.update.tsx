import { CompletePasswordResetForm } from "~/components/forms";
import { useCompletePasswordResetFormConnector } from "~/connectors/forms";

import { ShortCode, UserID } from "@a-novel/connector-authentication/api";
import { SessionPrivateSuspense } from "@a-novel/package-authenticator";
import type { RouteContext } from "@a-novel/tanstack-start-config";

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const SearchParamsSchema = z.object({
  target: UserID,
  shortCode: ShortCode,
});

export const Route = createFileRoute("/ext/password/update")({
  component: () => (
    <SessionPrivateSuspense>
      <ResetPassword />
    </SessionPrivateSuspense>
  ),
  validateSearch: zodValidator(SearchParamsSchema),
  beforeLoad: () =>
    ({
      getTitle: (tolgee) => tolgee.t("metadata.resetPassword.title", { ns: "platform.authentication" }),
    }) as RouteContext,
});

function ResetPassword() {
  const { target, shortCode } = Route.useSearch();

  const completePasswordResetFormConnector = useCompletePasswordResetFormConnector({ userID: target, shortCode });

  return <CompletePasswordResetForm connector={completePasswordResetFormConnector} />;
}
