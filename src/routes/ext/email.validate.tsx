import { EmailValidation as EmailValidationPage } from "~/components/misc";
import { useEmailValidationConnector } from "~/connectors/misc";

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

export const Route = createFileRoute("/ext/email/validate")({
  component: () => (
    <SessionPrivateSuspense>
      <EmailValidation />
    </SessionPrivateSuspense>
  ),
  validateSearch: zodValidator(SearchParamsSchema),
  beforeLoad: () =>
    ({
      getTitle: (tolgee) => tolgee.t("metadata.validateEmail.title", { ns: "platform.authentication" }),
    }) as RouteContext,
});

function EmailValidation() {
  const { target, shortCode } = Route.useSearch();

  const emailValidationConnector = useEmailValidationConnector({ userID: target, shortCode });

  return <EmailValidationPage connector={emailValidationConnector} />;
}
