import type { RequestEmailUpdateFormConnector } from "~/components/forms";
import { getLang } from "~/lib";

import { BINDINGS_VALIDATION, Lang, LangEnum } from "@a-novel/connector-authentication/api";
import { GetUser, RequestEmailUpdate } from "@a-novel/connector-authentication/hooks";
import { useAccessToken, useSession } from "@a-novel/package-authenticator";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { useEffect } from "react";

import { useForm } from "@tanstack/react-form";
import { useTolgee, useTranslate, type UseTranslateResult } from "@tolgee/react";
import { z } from "zod";

type FormTFunction = UseTranslateResult["t"];

/**
 * Extends the original form with translated error messages.
 */
const formValidator = (t: FormTFunction) =>
  z.object({
    email: z
      .string()
      .nonempty(t("text.errors.required", { ns: "form" }))
      .min(
        BINDINGS_VALIDATION.EMAIL.MIN,
        t("text.errors.tooShort", {
          ns: "form",
          count: BINDINGS_VALIDATION.EMAIL.MIN,
        })
      )
      .max(
        BINDINGS_VALIDATION.EMAIL.MAX,
        t("text.errors.tooLong", {
          ns: "form",
          count: BINDINGS_VALIDATION.EMAIL.MAX,
        })
      )
      .email(t("fields.email.errors.invalid", { ns: "form" })),
    lang: Lang,
  });

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
const handleSubmitError = (t: FormTFunction) => (_: any) =>
  `${t("requestEmailUpdate.form.errors.generic", { ns: "platform.authentication.account" })} ${t("error", { ns: "generic" })}`;

export const useRequestEmailUpdateFormConnector = (): RequestEmailUpdateFormConnector<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> => {
  const { getLanguage, getPendingLanguage } = useTolgee();
  const { t } = useTranslate(["form", "generic", "platform.authentication.account"]);
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("generic");
  useTolgeeNamespaces("platform.authentication.account");

  const accessToken = useAccessToken();
  const { session } = useSession();
  const requestEmailUpdate = RequestEmailUpdate.useAPI(accessToken);

  const user = GetUser.useAPI(accessToken, { userID: session?.claims?.userID ?? "" });

  const form = useForm({
    defaultValues: {
      email: user.data?.email ?? "",
      lang: LangEnum.En,
    },
    validators: {
      onBlur: formValidator(t),
      onSubmitAsync: ({ value }) =>
        requestEmailUpdate
          .mutateAsync({
            ...value,
            // Override the lang with the one inferred from the i18n instance. This language will be used for
            // the email sent to the user.
            lang: getLang(getLanguage() ?? getPendingLanguage() ?? LangEnum.En),
          })
          .then(() => null)
          .catch(handleSubmitError(t)),
    },
  });

  const { setFieldValue } = form;

  // Update form when new user data is fetched.
  useEffect(() => {
    setFieldValue("email", user.data?.email ?? "");
  }, [setFieldValue, user.data?.email]);

  return {
    form,
    currentEmail: user.data?.email ?? "",
  };
};
