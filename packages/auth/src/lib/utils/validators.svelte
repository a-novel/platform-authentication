<script lang="ts">
  import { getSession } from "$lib";

  import { isHttpStatusError } from "@a-novel-kit/nodelib-browser/http";
  import { type AuthenticationApi, EmailSchema, credentialsExists } from "@a-novel/service-authentication-rest";

  import { getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  const { t } = getTranslate("auth.validation");
  const session = getSession();

  export function handleEmailValidationError(val: $ZodIssue): { text: string; error?: Error } {
    switch (val.code) {
      case "too_big":
        return {
          text: $t("form.email.error.tooLong", "The email is too long. Maximum length is {max} characters.", {
            max: val.maximum,
          }),
        };
      case "invalid_format":
        return {
          text: $t(
            "form.email.error.invalidFormat",
            "The email format is invalid. Please enter a valid email address."
          ),
        };
      default:
        return {
          text: $t("form.email.error.unknown", "An error occurred while validating the email."),
          error: new Error(val.message),
        };
    }
  }

  export function handlePasswordValidationError(val: $ZodIssue): { text: string; error?: Error } {
    switch (val.code) {
      case "too_big":
        return {
          text: $t("form.password.error.tooLong", "The password is too long. Maximum length is {max} characters.", {
            max: val.maximum,
          }),
        };
      default:
        return {
          text: $t("form.password.error.unknown", "An error occurred while validating the password."),
          error: new Error(val.message),
        };
    }
  }

  export function formValidationError(val: $ZodIssue) {
    return {
      title: $t("form.error.title", "Form validation error."),
      text: $t("form.error.text", "An unknown error occurred during form validation. You may try again later."),
      iconID: "material-symbols:error-outline",
      error: new Error(val.message),
    };
  }

  export function handleEmailSubmitError(err: unknown): { text: string; error?: Error } | undefined {
    if (isHttpStatusError(err, 404)) {
      return {
        text: $t("submit.error.invalid.email", "No account found with the provided email."),
      };
    }

    if (isHttpStatusError(err, 409)) {
      return {
        text: $t("submit.error.email.exists", "An account with this email already exists."),
      };
    }

    return undefined;
  }

  export function handlePasswordSubmitError(err: unknown): { text: string; error?: Error } | undefined {
    if (isHttpStatusError(err, 403)) {
      return {
        text: $t("submit.error.invalid.password", "The provided password is not the correct one."),
      };
    }

    return undefined;
  }

  interface SetEmailStatusParams {
    status: "valid" | "invalid" | "idle" | "validating";
    text?: string;
    error?: Error;
  }

  export async function validateEmail(
    rawEmail: string,
    api: AuthenticationApi,
    setStatus: (params?: SetEmailStatusParams) => void,
    creation?: boolean
  ) {
    const email = await EmailSchema.parseAsync(rawEmail).catch(() => "");
    // Email not ready for async validation.
    if (!email) {
      return setStatus({ status: "idle" });
    }

    // Start async validation.
    setStatus({ status: "validating" });
    try {
      const exist = await credentialsExists(api, session.accessToken, { email });

      if (creation && exist) {
        return setStatus({
          status: "invalid",
          text: $t("validation.error.email.exists", "An account with this email already exists."),
        });
      }

      if (!creation && !exist) {
        return setStatus({
          status: "invalid",
          text: $t("validation.error.invalid.email", "No account found with the provided email."),
        });
      }

      return setStatus({
        status: "valid",
        text: creation
          ? $t("validation.success.email.available", "The email is available.")
          : $t("validation.success.email.exists", "An account with this email exists."),
      });
    } catch (err) {
      return setStatus({
        status: "idle",
        text: $t(
          "validation.error",
          "Cannot validate email due to unexpected error. You might try to proceed anyways."
        ),
        error: err as Error,
      });
    }
  }
</script>
