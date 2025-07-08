import { CompleteRegistrationForm } from "~/components/forms";
import { useCompleteRegistrationFormConnector } from "~/connectors/forms";

import { ShortCode, UserID } from "@a-novel/connector-authentication/api";
import { SessionPrivateSuspense } from "@a-novel/package-authenticator";
import type { RouteContext } from "@a-novel/tanstack-start-config";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const SearchParamsSchema = z.object({
  target: UserID,
  shortCode: ShortCode,
});

export const Route = createFileRoute("/ext/account/create")({
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
  const navigate = useNavigate();

  const completeRegistrationFormConnector = useCompleteRegistrationFormConnector({
    email: target,
    shortCode,
    toDashboard: () => navigate({ to: "/" }),
  });

  return <CompleteRegistrationForm connector={completeRegistrationFormConnector} />;
}
