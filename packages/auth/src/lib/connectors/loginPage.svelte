<script lang="ts">
  import { getSession, getSessionScreen } from "$lib";
  import { LoginPage } from "$lib/ui";
  import {
    type FormConnectorStatus,
    type FormFieldConnectorStatus,
    type FormFieldStatus,
    type FormStatus,
    FullPageForm,
  } from "$lib/ui/components";
  import { Validators } from "$lib/utils";

  import { type ComponentProps, onDestroy } from "svelte";
  import type { EventHandler } from "svelte/elements";

  import { Debounce } from "@a-novel-kit/nodelib-browser/utils";
  import { type AuthenticationApi, TokenCreateRequestSchema } from "@a-novel/service-authentication-rest";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  // ===================================================================================================================
  // Props.
  // ===================================================================================================================
  interface Props extends Omit<
    ComponentProps<typeof FullPageForm>,
    | "children"
    | "title"
    | "success"
    | "method"
    | "onsubmit"
    | "formStatus"
    | "formStatusTitle"
    | "formStatusText"
    | "formStatusIcon"
    | "formError"
  > {
    api: AuthenticationApi;
  }

  let { api, ...props }: Props = $props();

  // ===================================================================================================================
  // Stores & dependencies.
  // ===================================================================================================================
  const { t } = getTranslate("auth.page.login");
  const session = getSession();
  let validators: ReturnType<typeof Validators>;
  const sessionScreen = getSessionScreen();

  const checkEmailDebouncer = new Debounce(300);
  onDestroy(() => {
    checkEmailDebouncer.cancel();
  });

  // ===================================================================================================================
  // States.
  // ===================================================================================================================
  let // Email.
    emailStatus = $state<FormFieldStatus>("idle"),
    emailStatusText = $state<string>(),
    emailError = $state<Error>(),
    // Password.
    passwordStatus = $state<FormFieldStatus>("idle"),
    passwordStatusText = $state<string>(),
    passwordError = $state<Error>(),
    // Form.
    formStatus = $state<FormStatus>("idle"),
    formError = $state<Error>(),
    formStatusTitle = $state<string>(),
    formStatusText = $state<string>(),
    formStatusIconID = $state<string>();

  // ===================================================================================================================
  // Helpers.
  // ===================================================================================================================
  // Basic.
  function postSuccessAction() {
    sessionScreen.setScreen();
  }
  function registerAction() {
    sessionScreen.setScreen("register");
  }
  function passwordResetAction() {
    sessionScreen.setScreen("passwordReset");
  }

  // Statuses
  function resetAllStatuses() {
    emailError = undefined;
    passwordError = undefined;
    formError = undefined;
    emailStatus = "idle";
    passwordStatus = "idle";
    formStatus = "idle";
    formStatusTitle = undefined;
    formStatusText = undefined;
    formStatusIconID = "";
    emailStatusText = undefined;
    passwordStatusText = undefined;
  }

  function setEmailStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      emailStatus = params.status;
      emailError = params.error;
      emailStatusText = params.text;
    }
  }
  function setPasswordStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordStatus = params.status;
      passwordError = params.error;
      passwordStatusText = params.text;
    }
  }
  function setFormStatus(params?: FormConnectorStatus) {
    if (params) {
      formStatus = params.status;
      formError = params.error;
      formStatusTitle = params.title;
      formStatusText = params.text;
      formStatusIconID = params.iconID ?? "";
    }
  }

  // Handlers.
  function handleValidationError(val: $ZodIssue) {
    switch (val.path.join(".")) {
      case "email":
        setEmailStatus({ status: "invalid", ...validators.handleEmailValidationError(val) });
        break;
      case "password":
        setPasswordStatus({ status: "invalid", ...validators.handlePasswordValidationError(val) });
        break;
      default:
        setFormStatus({ status: "invalid", ...validators.formValidationError(val) });
        break;
    }
  }
  function handleSubmitError(err: unknown) {
    const emailValidated = validators.handleEmailSubmitError(err);
    const passwordValidated = validators.handlePasswordSubmitError(err);
    setEmailStatus(emailValidated && { status: "invalid", ...emailValidated });
    setPasswordStatus(passwordValidated && { status: "invalid", ...passwordValidated });

    // If no specific error has been set, set a general form error.
    if (emailStatus !== "invalid" && passwordStatus !== "invalid") {
      setFormStatus({
        status: "invalid",
        title: $t("submit.error.title", "Login failed."),
        text: $t("submit.error.text", "An unknown error occurred during session creation. You may try again later."),
        iconID: "lucide:server-off",
        error: err instanceof Error ? err : undefined,
      });
    }
  }
  async function onsubmit(evt: Parameters<EventHandler<SubmitEvent, HTMLFormElement>>[0]) {
    evt.preventDefault();
    // Cancel any ongoing validation, so it does not conflict with the submission.
    checkEmailDebouncer.cancel();
    resetAllStatuses();
    formStatus = "validating";

    const rawFormData = Object.fromEntries(new FormData(evt.currentTarget).entries());

    // Validate form data locally.
    const formData = await TokenCreateRequestSchema.safeParseAsync(rawFormData);
    formData.error?.issues.forEach(handleValidationError);
    if (!formData.success) {
      formStatus = formStatus === "validating" ? "idle" : formStatus;
      return;
    }

    // Submit to API.
    await session
      .authenticate(formData.data)
      .then(() => {
        setFormStatus({ status: "valid" });
      })
      .catch(handleSubmitError);
  }
</script>

{#snippet formStatusIcon()}
  <Icon icon={formStatusIconID ?? ""} />
{/snippet}

<Validators bind:this={validators} />

<LoginPage
  {...props}
  {onsubmit}
  {postSuccessAction}
  {registerAction}
  {passwordResetAction}
  {emailStatus}
  {passwordStatus}
  {emailStatusText}
  {passwordStatusText}
  {emailError}
  {passwordError}
  {formStatus}
  {formError}
  {formStatusTitle}
  {formStatusText}
  {formStatusIcon}
  disabled={!session.accessToken}
/>
