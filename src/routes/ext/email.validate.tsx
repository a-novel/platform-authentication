import { EmailValidation as EmailValidationPage } from "~/components/forms/static";
import { useEmailValidationConnector } from "~/connectors/misc";

import { ShortCode, UserID } from "@a-novel/connector-authentication/api";

import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const SearchParamsSchema = z.object({
  target: UserID,
  shortCode: ShortCode,
});

export const Route = createFileRoute("/ext/email/validate")({
  beforeLoad: ({ context }) => ({
    title: context.tolgee.t("metadata.validateEmail.title", { ns: "platform.authentication" }),
  }),
  component: ValidateEmail,
  validateSearch: zodValidator(SearchParamsSchema),
});

function ValidateEmail() {
  const { target, shortCode } = Route.useSearch();

  const emailValidationConnector = useEmailValidationConnector({ userID: target, shortCode });

  return <EmailValidationPage connector={emailValidationConnector} />;
}
