import { CompleteRegistrationForm } from "~/components/forms";
import { useCompleteRegistrationFormConnector } from "~/connectors/forms";
import { decodeBase64URL } from "~/lib";

import { ShortCode } from "@a-novel/connector-authentication/api";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const SearchParamsSchema = z.object({
  target: z.base64url(),
  shortCode: ShortCode,
});

export const Route = createFileRoute("/ext/account/create")({
  beforeLoad: ({ context }) => ({
    title: context.tolgee.t("metadata.register.title", { ns: "platform.authentication" }),
  }),
  component: CompleteRegistration,
  validateSearch: zodValidator(SearchParamsSchema),
});

function CompleteRegistration() {
  const { target, shortCode } = Route.useSearch();
  const navigate = useNavigate();

  const completeRegistrationFormConnector = useCompleteRegistrationFormConnector({
    email: decodeBase64URL(target),
    shortCode,
    toDashboard: () => navigate({ to: "/" }),
  });

  return <CompleteRegistrationForm connector={completeRegistrationFormConnector} />;
}
