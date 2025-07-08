import type { CompleteRegistrationFormConnector } from "~/components/forms";
import { decodeBase64URL } from "~/lib";

import { BINDINGS_VALIDATION, isEmailTakenError, isForbiddenError } from "@a-novel/connector-authentication/api";
import { CreateUser } from "@a-novel/connector-authentication/hooks";
import { useAccessToken, useSession } from "@a-novel/package-authenticator";
import { useTolgeeNamespaces } from "@a-novel/tanstack-start-config";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";

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
      message: t("register.fields.passwordConfirmation.errors.mismatch", { ns: "platform.authentication.ext" }),
    });

/**
 * Handle error from login form submit. Properly sets field errors for tanstack depending on the returned value.
 */
const handleSubmitError = (t: FormTFunction, setLinkError: Dispatch<SetStateAction<boolean>>) => (error: any) => {
  if (isForbiddenError(error)) {
    setLinkError(true);
    return null;
  }

  if (isEmailTakenError(error)) {
    return t("fields.email.errors.taken", { ns: "form" });
  }

  return `${t("register.form.errors.generic", { ns: "platform.authentication.ext" })} ${t("error", { ns: "generic" })}`;
};

export interface CompleteRegistrationFormConnectorProps {
  shortCode: string;
  email: string;
  toDashboard: () => void;
}

export const useCompleteRegistrationFormConnector = ({
  shortCode,
  email,
  toDashboard,
}: CompleteRegistrationFormConnectorProps): CompleteRegistrationFormConnector<
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
  const { t } = useTranslate(["form", "generic", "platform.authentication.ext"]);
  useTolgeeNamespaces("form");
  useTolgeeNamespaces("generic");
  useTolgeeNamespaces("platform.authentication.ext");

  const accessToken = useAccessToken();
  const { setSession } = useSession();
  const register = CreateUser.useAPI(accessToken);

  const [isLinkError, setIsLinkError] = useState(false);

  // Email is received from URL params, encoded in base64url format to prevent issues with special characters.
  const decodedMail = useMemo(() => decodeBase64URL(email), [email]);

  const form = useForm({
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    validators: {
      onBlur: formValidator(t),
      onSubmitAsync: ({ value }) =>
        register
          .mutateAsync({
            password: value.password,
            shortCode,
            email: decodedMail,
          })
          .then(() => null)
          .catch(handleSubmitError(t, setIsLinkError)),
    },
  });

  // Log user in on successful registration.
  useEffect(() => {
    if (register.isSuccess && register.data) {
      setSession((session) => ({ ...session, accessToken: register.data.accessToken }));
    }
  }, [accessToken, register.data, register.isSuccess, setSession]);

  return {
    form,
    toDashboard,
    isLinkError,
  };
};
