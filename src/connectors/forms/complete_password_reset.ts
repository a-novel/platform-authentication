import { BINDINGS_VALIDATION, isForbiddenError } from "@a-novel/connector-authentication/api";
import { ResetPassword } from "@a-novel/connector-authentication/hooks";
import { useAccessToken } from "@a-novel/package-authenticator";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { type Dispatch, type SetStateAction, useState } from "react";

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
      message: t("resetPassword.fields.newPasswordConfirmation.errors.mismatch", { ns: "platform.authentication.ext" }),
    });

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
const handleSubmitError = (t: FormTFunction, setLinkError: Dispatch<SetStateAction<boolean>>) => (error: any) => {
  if (isForbiddenError(error)) {
    setLinkError(true);
    return null;
  }

  return `${t("resetPassword.form.errors.generic", { ns: "platform.authentication.ext" })} ${t("error", { ns: "generic" })}`;
};

export interface CompletePasswordResetFormConnectorProps {
  shortCode: string;
  userID: string;
}

export const useCompletePasswordResetFormConnector = ({
  shortCode,
  userID,
}: CompletePasswordResetFormConnectorProps) => {
  const { t } = useTranslate(["form", "generic", "platform.authentication.ext"]);
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("generic");
  useTolgeeNamespaces("platform.authentication.ext");

  const accessToken = useAccessToken();
  const completePasswordReset = ResetPassword.useAPI(accessToken);

  const [isLinkError, setIsLinkError] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onBlur: formValidator(t),
      onSubmitAsync: ({ value }) =>
        completePasswordReset
          .mutateAsync({
            password: value.password,
            shortCode,
            userID,
          })
          .then(() => null)
          .catch(handleSubmitError(t, setIsLinkError)),
    },
  });

  return {
    form,
    isLinkError,
  };
};
