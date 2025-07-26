import { CompletePasswordResetForm } from "~/components/forms";
import { useCompletePasswordResetFormConnector } from "~/connectors/forms";

import { ShortCode, UserID } from "@a-novel/connector-authentication/api";

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const SearchParamsSchema = z.object({
  target: UserID,
  shortCode: ShortCode,
});

export const Route = createFileRoute("/ext/password/reset")({
  head: ({ match }) => ({
    meta: [{ title: match.context.tolgee.t("metadata.resetPassword.title", { ns: "platform.authentication" }) }],
  }),
  component: ResetPassword,
  validateSearch: zodValidator(SearchParamsSchema),
});

function ResetPassword() {
  const { target, shortCode } = Route.useSearch();

  const completePasswordResetFormConnector = useCompletePasswordResetFormConnector({ userID: target, shortCode });

  return <CompletePasswordResetForm connector={completePasswordResetFormConnector} />;
}
