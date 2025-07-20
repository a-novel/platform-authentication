import { getLang } from "~/lib";

import { BINDINGS_VALIDATION, Lang, LangEnum } from "@a-novel/connector-authentication/api";
import { GetUser, RequestEmailUpdate } from "@a-novel/connector-authentication/hooks";
import { useAccessToken, useSession } from "@a-novel/package-authenticator";
import { useTolgeeNs } from "@a-novel/package-ui/translations";

import { useEffect } from "react";

import { useForm } from "@tanstack/react-form";
import { useTolgee, useTranslate, type UseTranslateResult } from "@tolgee/react";
import { z } from "zod";

type FormTFunction = UseTranslateResult["t"];

export type RequestEmailUpdateFormConnector = ReturnType<typeof useRequestEmailUpdateFormConnector>;

const ns = ["form", "generic", "platform.authentication.account"];

export const useRequestEmailUpdateFormConnector = () => {
  const { getLanguage, getPendingLanguage } = useTolgee();
  const { t } = useTranslate(ns);
  useTolgeeNs(ns);

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
          .catch(newSubmitErrorHandler(t)),
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

/**
 * Extends the original form with translated error messages.
 */
function formValidator(t: FormTFunction) {
  return z.object({
    email: z
      .email(t("fields.email.errors.invalid", { ns: "form" }))
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
      ),
    lang: Lang,
  });
}

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
function newSubmitErrorHandler(t: FormTFunction) {
  return function handleSubmitError(_: any) {
    return `${t("requestEmailUpdate.form.errors.generic", { ns: "platform.authentication.account" })} ${t("error", { ns: "generic" })}`;
  };
}
