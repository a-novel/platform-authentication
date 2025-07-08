import type { UpdatePasswordFormConnector } from "~/components/forms";

import { BINDINGS_VALIDATION, isForbiddenError } from "@a-novel/connector-authentication/api";
import { UpdatePassword } from "@a-novel/connector-authentication/hooks";
import { useAccessToken } from "@a-novel/package-authenticator";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { useForm } from "@tanstack/react-form";
import { useTranslate, type UseTranslateResult } from "@tolgee/react";
import { z } from "zod";

type FormTFunction = UseTranslateResult["t"];

/**
 * Extends the original form with translated error messages.
 */
const formValidator = (t: FormTFunction) =>
  z
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

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
const handleSubmitError = (t: FormTFunction) => (error: any) => {
  if (isForbiddenError(error)) {
    return {
      fields: { password: t("fields.password.errors.invalid", { ns: "form" }) },
    };
  }

  return `${t("updatePassword.form.errors.generic", { ns: "platform.authentication.account" })} ${t("error", { ns: "generic" })}`;
};

export const useUpdatePasswordFormConnector = (): UpdatePasswordFormConnector<
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
  const { t } = useTranslate(["form", "generic", "platform.authentication.account"]);
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("generic");
  useTolgeeNamespaces("platform.authentication.account");

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
          .catch(handleSubmitError(t)),
    },
  });

  return { form };
};
