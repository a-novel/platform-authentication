<script lang="ts">
  import { ManageAccountPage } from "$lib/ui";

  import { onDestroy } from "svelte";
  import type { EventHandler } from "svelte/elements";

  import { Debounce } from "@a-novel-kit/nodelib-browser/utils";
  import { getSession } from "@a-novel/package-authentication";
  import type { FormFieldStatus, FormStatus } from "@a-novel/package-authentication/ui/components";
  import type { FormConnectorStatus, FormFieldConnectorStatus } from "@a-novel/package-authentication/ui/components";
  import { Validators } from "@a-novel/package-authentication/utils";
  import {
    type AuthenticationApi,
    CredentialsUpdatePasswordRequestSchema,
    ShortCodeCreateEmailUpdateRequestSchema,
    credentialsUpdatePassword,
    shortCodeCreateEmailUpdate,
  } from "@a-novel/service-authentication-rest";
  import { DEFAULT_LNG, LNG } from "@a-novel/uikit/const";

  import Icon from "@iconify/svelte";
  import { getTolgee, getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  // ===================================================================================================================
  // Props.
  // ===================================================================================================================
  interface Props {
    api: AuthenticationApi;
  }

  let { api }: Props = $props();

  // ===================================================================================================================
  // Stores & dependencies.
  // ===================================================================================================================
  const { t } = getTranslate("auth.platform.page.manageAccount");
  const session = getSession();
  let validators: ReturnType<typeof Validators>;

  const tolgee = getTolgee(["language", "pendingLanguage"]);
  let activeLocale = $tolgee.getLanguage() as LNG | undefined;

  const checkEmailDebouncer = new Debounce(300);
  onDestroy(() => {
    checkEmailDebouncer.cancel();
  });

  const UpdatePasswordExtendedSchema = CredentialsUpdatePasswordRequestSchema.extend({
    passwordConfirmation: CredentialsUpdatePasswordRequestSchema.shape.password,
  }).superRefine((val, ctx) => {
    if (val.password !== val.passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        message: "password mismatch",
        path: ["passwordConfirmation"],
      });
    }
  });

  // ===================================================================================================================
  // States.
  // ===================================================================================================================
  let // Email update: email.
    emailUpdateEmailStatus = $state<FormFieldStatus>("idle"),
    emailUpdateEmailStatusText = $state<string>(),
    emailUpdateEmailError = $state<Error>(),
    // Password update: new password.
    passwordUpdateNewPasswordStatus = $state<FormFieldStatus>("idle"),
    passwordUpdateNewPasswordStatusText = $state<string>(),
    passwordUpdateNewPasswordError = $state<Error>(),
    // Password update: confirm new password.
    passwordUpdateNewPasswordConfirmationStatus = $state<FormFieldStatus>("idle"),
    passwordUpdateNewPasswordConfirmationStatusText = $state<string>(),
    passwordUpdateNewPasswordConfirmationError = $state<Error>(),
    // Password update: current password.
    passwordUpdateCurrentPasswordStatus = $state<FormFieldStatus>("idle"),
    passwordUpdateCurrentPasswordStatusText = $state<string>(),
    passwordUpdateCurrentPasswordError = $state<Error>(),
    // Email update: form status.
    emailUpdateFormStatus = $state<FormStatus>("idle"),
    emailUpdateFormStatusTitle = $state<string>(),
    emailUpdateFormStatusText = $state<string>(),
    emailUpdateFormStatusIconID = $state<string>(),
    emailUpdateFormError = $state<Error>(),
    // Password update: form status.
    passwordUpdateFormStatus = $state<FormStatus>("idle"),
    passwordUpdateFormStatusTitle = $state<string>(),
    passwordUpdateFormStatusText = $state<string>(),
    passwordUpdateFormStatusIconID = $state<string>(),
    passwordUpdateFormError = $state<Error>();

  // ===================================================================================================================
  // Helpers.
  // ===================================================================================================================
  // Statuses
  function resetEmailUpdateStatuses() {
    emailUpdateEmailStatus = "idle";
    emailUpdateEmailStatusText = undefined;
    emailUpdateEmailError = undefined;
    emailUpdateFormStatus = "idle";
    emailUpdateFormStatusTitle = undefined;
    emailUpdateFormStatusText = undefined;
    emailUpdateFormStatusIconID = "";
    emailUpdateFormError = undefined;
  }

  function passwordResetUpdateStatuses() {
    passwordUpdateNewPasswordStatus = "idle";
    passwordUpdateNewPasswordStatusText = undefined;
    passwordUpdateNewPasswordError = undefined;
    passwordUpdateNewPasswordConfirmationStatus = "idle";
    passwordUpdateNewPasswordConfirmationStatusText = undefined;
    passwordUpdateNewPasswordConfirmationError = undefined;
    passwordUpdateCurrentPasswordStatus = "idle";
    passwordUpdateCurrentPasswordStatusText = undefined;
    passwordUpdateCurrentPasswordError = undefined;
    passwordUpdateFormStatus = "idle";
    passwordUpdateFormStatusTitle = undefined;
    passwordUpdateFormStatusText = undefined;
    passwordUpdateFormStatusIconID = "";
    passwordUpdateFormError = undefined;
  }

  function setEmailUpdateEmailStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      emailUpdateEmailStatus = params.status;
      emailUpdateEmailError = params.error;
      emailUpdateEmailStatusText = params.text;
    }
  }

  function setPasswordUpdateNewPasswordStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordUpdateNewPasswordStatus = params.status;
      passwordUpdateNewPasswordError = params.error;
      passwordUpdateNewPasswordStatusText = params.text;
    }
  }

  function setPasswordUpdateConfirmNewPasswordStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordUpdateNewPasswordConfirmationStatus = params.status;
      passwordUpdateNewPasswordConfirmationError = params.error;
      passwordUpdateNewPasswordConfirmationStatusText = params.text;
    }
  }

  function setPasswordUpdateCurrentPasswordStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordUpdateCurrentPasswordStatus = params.status;
      passwordUpdateCurrentPasswordError = params.error;
      passwordUpdateCurrentPasswordStatusText = params.text;
    }
  }

  function setEmailUpdateFormStatus(params?: FormConnectorStatus) {
    if (params) {
      emailUpdateFormStatus = params.status;
      emailUpdateFormError = params.error;
      emailUpdateFormStatusTitle = params.title;
      emailUpdateFormStatusText = params.text;
      emailUpdateFormStatusIconID = params.iconID ?? "";
    }
  }

  function setPasswordUpdateFormStatus(params?: FormConnectorStatus) {
    if (params) {
      passwordUpdateFormStatus = params.status;
      passwordUpdateFormError = params.error;
      passwordUpdateFormStatusTitle = params.title;
      passwordUpdateFormStatusText = params.text;
      passwordUpdateFormStatusIconID = params.iconID ?? "";
    }
  }

  // Handlers.
  function handleEmailUpdateValidationError(val: $ZodIssue) {
    switch (val.path.join(".")) {
      case "email":
        setEmailUpdateEmailStatus({ status: "invalid", ...validators.handleEmailValidationError(val) });
        break;
    }
  }

  function handlePasswordUpdateValidationError(val: $ZodIssue) {
    switch (val.path.join(".")) {
      case "password":
        setPasswordUpdateNewPasswordStatus({
          status: "invalid",
          ...validators.handlePasswordValidationError(val),
        });
        break;
      case "passwordConfirmation":
        setPasswordUpdateConfirmNewPasswordStatus({
          status: "invalid",
          ...validators.handlePasswordValidationError(val),
        });
        break;
      case "currentPassword":
        setPasswordUpdateCurrentPasswordStatus({
          status: "invalid",
          ...validators.handlePasswordValidationError(val),
        });
        break;
    }
  }

  function handleEmailUpdateSubmitError(err: unknown) {
    const emailValidated = validators.handleEmailSubmitError(err);
    setEmailUpdateEmailStatus(emailValidated && { status: "invalid", ...emailValidated });

    // If no specific error has been set, set a general form error.
    if (emailUpdateEmailStatus !== "invalid") {
      setEmailUpdateFormStatus({
        status: "invalid",
        title: $t("emailUpdate.submit.error.title", "Email update failed."),
        text: $t(
          "emailUpdate.submit.error.text",
          "An unknown error occurred during the creation of a validation link. You may try again later."
        ),
        iconID: "lucide:server-off",
        error: err instanceof Error ? err : undefined,
      });
    }
  }

  function handlePasswordUpdateSubmitError(err: unknown) {
    const currentPasswordValidated = validators.handlePasswordSubmitError(err);
    setPasswordUpdateCurrentPasswordStatus(
      currentPasswordValidated && { status: "invalid", ...currentPasswordValidated }
    );

    // If no specific error has been set, set a general form error.
    if (passwordUpdateNewPasswordStatus !== "invalid" && passwordUpdateCurrentPasswordStatus !== "invalid") {
      setPasswordUpdateFormStatus({
        status: "invalid",
        title: $t("passwordUpdate.submit.error.title", "Password update failed."),
        text: $t(
          "passwordUpdate.submit.error.text",
          "An unknown error occurred during password update. You may try again later."
        ),
        iconID: "lucide:server-off",
        error: err instanceof Error ? err : undefined,
      });
    }
  }

  async function onEmailUpdateSubmit(evt: Parameters<EventHandler<SubmitEvent, HTMLFormElement>>[0]) {
    evt.preventDefault();
    // Cancel any ongoing validation, so it does not conflict with the submission.
    checkEmailDebouncer.cancel();
    resetEmailUpdateStatuses();
    emailUpdateFormStatus = "validating";

    const rawFormData = Object.fromEntries(new FormData(evt.currentTarget).entries());

    const formData = await ShortCodeCreateEmailUpdateRequestSchema.safeParseAsync(rawFormData);
    formData.error?.issues.forEach(handleEmailUpdateValidationError);
    if (!formData.success) {
      emailUpdateFormStatus = emailUpdateFormStatus === "validating" ? "idle" : emailUpdateFormStatus;
      return;
    }

    // Submit to API.
    await shortCodeCreateEmailUpdate(api, session.accessToken, formData.data)
      .then(() => {
        setEmailUpdateFormStatus({ status: "valid" });
      })
      .catch(handleEmailUpdateSubmitError);
  }

  async function onPasswordUpdateSubmit(evt: Parameters<EventHandler<SubmitEvent, HTMLFormElement>>[0]) {
    evt.preventDefault();
    passwordResetUpdateStatuses();
    passwordUpdateFormStatus = "validating";

    const rawFormData = Object.fromEntries(new FormData(evt.currentTarget).entries());

    // Validate form data locally.
    const formData = await UpdatePasswordExtendedSchema.safeParseAsync(rawFormData);
    formData.error?.issues.forEach(handlePasswordUpdateValidationError);
    if (!formData.success) {
      passwordUpdateFormStatus = passwordUpdateFormStatus === "validating" ? "idle" : passwordUpdateFormStatus;
      return;
    }

    // Submit to API.
    await credentialsUpdatePassword(api, session.accessToken, {
      password: formData.data.password,
      currentPassword: formData.data.currentPassword,
    })
      .then(() => {
        setPasswordUpdateFormStatus({ status: "valid" });
      })
      .catch(handlePasswordUpdateSubmitError);
  }
</script>

{#snippet emailUpdateFormStatusIcon()}
  <Icon icon={emailUpdateFormStatusIconID ?? ""} />
{/snippet}

{#snippet passwordUpdateFormStatusIcon()}
  <Icon icon={passwordUpdateFormStatusIconID ?? ""} />
{/snippet}

<Validators bind:this={validators} />

<ManageAccountPage
  {onEmailUpdateSubmit}
  {emailUpdateEmailStatus}
  {emailUpdateEmailStatusText}
  {emailUpdateEmailError}
  {onPasswordUpdateSubmit}
  {passwordUpdateNewPasswordStatus}
  {passwordUpdateNewPasswordStatusText}
  {passwordUpdateNewPasswordError}
  {passwordUpdateNewPasswordConfirmationStatus}
  {passwordUpdateNewPasswordConfirmationStatusText}
  {passwordUpdateNewPasswordConfirmationError}
  {passwordUpdateCurrentPasswordStatus}
  {passwordUpdateCurrentPasswordStatusText}
  {passwordUpdateCurrentPasswordError}
  {emailUpdateFormStatus}
  {emailUpdateFormError}
  {emailUpdateFormStatusTitle}
  {emailUpdateFormStatusText}
  {emailUpdateFormStatusIcon}
  {passwordUpdateFormStatus}
  {passwordUpdateFormError}
  {passwordUpdateFormStatusTitle}
  {passwordUpdateFormStatusText}
  {passwordUpdateFormStatusIcon}
>
  {#snippet emailUpdateChildren()}
    <input type="hidden" name="lang" value={activeLocale ?? DEFAULT_LNG} />
  {/snippet}
</ManageAccountPage>
