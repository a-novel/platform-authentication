<script lang="ts">
  import { isHttpStatusError } from "@a-novel-kit/nodelib-browser/http";

  import { getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  const { t } = getTranslate("auth.validation");

  /**
   * Handle error on email field.
   */
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

  /**
   * Handle error on password field.
   */
  export function handlePasswordValidationError(val: $ZodIssue): { text: string; error?: Error } {
    switch (val.code) {
      case "too_big":
        return {
          text: $t("form.password.error.tooLong", "The password is too long. Maximum length is {max} characters.", {
            max: val.maximum,
          }),
        };
      case "custom":
        if (val.message === "password mismatch") {
          return {
            text: $t("form.password.error.mismatch", "The passwords do not match. Please re-enter them."),
          };
        }

      // No breakpoint is intentional: if the custom message is not recognized, we switch to generic error
      // handling.
      default:
        return {
          text: $t("form.password.error.unknown", "An error occurred while validating the password."),
          error: new Error(val.message),
        };
    }
  }

  /**
   * Handle general form validation error.
   */
  export function formValidationError(val: $ZodIssue) {
    return {
      title: $t("form.error.title", "Form validation error."),
      text: $t("form.error.text", "An unknown error occurred during form validation. You may try again later."),
      iconID: "material-symbols:error-outline",
      error: new Error(val.message),
    };
  }

  /**
   * Handle error on email field during form submission.
   */
  export function handleEmailSubmitError(err: unknown): { text: string; error?: Error } | undefined {
    if (isHttpStatusError(err, 409)) {
      return {
        text: $t("submit.error.email.exists", "An account with this email already exists."),
      };
    }

    return undefined;
  }

  /**
   * Handle error on the password field during form submission.
   */
  export function handlePasswordSubmitError(err: unknown): { text: string; error?: Error } | undefined {
    if (isHttpStatusError(err, 403)) {
      return {
        text: $t("submit.error.invalid.password", "The provided password is not the correct one."),
      };
    }

    return undefined;
  }
</script>

<!--
@component
Custom validation functions for authentication forms.

Methods are exposed as a svelte component because stores cannot be
easily accessed in a regular ts file.

To use:

```svelte
<script lang="ts">
 import { Validators } from "$lib/utils";

 let validators: ReturnType<typeof Validators>;

 this.[validators_method]();
</script>

<Validators bind:this={validators} />
```
-->
