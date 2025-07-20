import { BINDINGS_VALIDATION, isForbiddenError } from "@a-novel/connector-authentication/api";
import { UpdatePassword } from "@a-novel/connector-authentication/hooks";
import { useAccessToken } from "@a-novel/package-authenticator";
import { useTolgeeNs } from "@a-novel/package-ui/translations";

import { useForm } from "@tanstack/react-form";
import { useTranslate, type UseTranslateResult } from "@tolgee/react";
import { z } from "zod";

type FormTFunction = UseTranslateResult["t"];

export type UpdatePasswordFormConnector = ReturnType<typeof useUpdatePasswordFormConnector>;

const ns = ["form", "generic", "platform.authentication.account"];

export const useUpdatePasswordFormConnector = () => {
  const { t } = useTranslate(ns);
  useTolgeeNs(ns);

  const accessToken = useAccessToken();
  const updatePassword = UpdatePassword.useAPI(accessToken);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onBlur: formValidator(t),
      onSubmitAsync: ({ value }) =>
        updatePassword
          .mutateAsync(value)
          .then(() => null)
          .catch(newSubmitErrorHandler(t)),
    },
  });

  return { form };
};

/**
 * Extends the original form with translated error messages.
 */
function formValidator(t: FormTFunction) {
  return z
    .object({
      currentPassword: z
        .string()
        .nonempty(t("text.errors.required", { ns: "form" }))
        .min(
          BINDINGS_VALIDATION.PASSWORD.MIN,
          t("text.errors.tooShort", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MIN,
          })
        )
        .max(
          BINDINGS_VALIDATION.PASSWORD.MAX,
          t("text.errors.tooLong", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MAX,
          })
        ),
      password: z
        .string()
        .nonempty(t("text.errors.required", { ns: "form" }))
        .min(
          BINDINGS_VALIDATION.PASSWORD.MIN,
          t("text.errors.tooShort", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MIN,
          })
        )
        .max(
          BINDINGS_VALIDATION.PASSWORD.MAX,
          t("text.errors.tooLong", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MAX,
          })
        ),
      passwordConfirmation: z
        .string()
        .nonempty(t("text.errors.required", { ns: "form" }))
        .min(
          BINDINGS_VALIDATION.PASSWORD.MIN,
          t("text.errors.tooShort", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MIN,
          })
        )
        .max(
          BINDINGS_VALIDATION.PASSWORD.MAX,
          t("text.errors.tooLong", {
            ns: "form",
            count: BINDINGS_VALIDATION.PASSWORD.MAX,
          })
        ),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      path: ["passwordConfirmation"],
      message: t("updatePassword.fields.newPasswordConfirmation.errors.mismatch", {
        ns: "platform.authentication.account",
      }),
    });
}

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
function newSubmitErrorHandler(t: FormTFunction) {
  return function handleSubmitError(error: any) {
    if (isForbiddenError(error)) {
      return {
        fields: { password: t("fields.password.errors.invalid", { ns: "form" }) },
      };
    }

    return `${t("updatePassword.form.errors.generic", { ns: "platform.authentication.account" })} ${t("error", { ns: "generic" })}`;
  };
}
