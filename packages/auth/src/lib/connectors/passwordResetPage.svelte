<script lang="ts">
  import { getSession, getSessionScreen } from "$lib";
  import { PasswordResetPage } from "$lib/ui";
  import { FullPageForm } from "$lib/ui/components";
  import { Validators } from "$lib/utils";

  import { type ComponentProps, onDestroy } from "svelte";
  import type { EventHandler } from "svelte/elements";

  import { Debounce } from "@a-novel-kit/nodelib-browser/utils";
  import {
    type AuthenticationApi,
    ShortCodeCreatePasswordResetRequestSchema,
    shortCodeCreatePasswordReset,
  } from "@a-novel/service-authentication-rest";
  import { DEFAULT_LNG, LNG } from "@a-novel/uikit/const";

  import Icon from "@iconify/svelte";
  import { getTolgee, getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  // ===================================================================================================================
  // Props.
  // ===================================================================================================================
  type FormProps = ComponentProps<typeof PasswordResetPage>;

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

  interface EmailStatus {
    status: FormProps["emailStatus"];
    text?: string;
    error?: Error;
  }
  interface FormStatus {
    status: FormProps["formStatus"];
    title?: string;
    text?: string;
    iconID?: string;
    error?: Error;
  }

  let { api, ...props }: Props = $props();

  // ===================================================================================================================
  // Stores & dependencies.
  // ===================================================================================================================
  const { t } = getTranslate("auth.page.passwordReset");
  const session = getSession();
  const sessionScreen = getSessionScreen();
  let validators: ReturnType<typeof Validators>;

  const tolgee = getTolgee(["language", "pendingLanguage"]);
  let activeLocale = $tolgee.getLanguage() as LNG | undefined;

  const checkEmailDebouncer = new Debounce(100);
  onDestroy(() => {
    checkEmailDebouncer.cancel();
  });

  // ===================================================================================================================
  // States.
  // ===================================================================================================================
  let // Email.
    email = $state(""),
    emailStatus = $state<FormProps["emailStatus"]>("idle"),
    emailStatusText = $state<FormProps["emailStatusText"]>(),
    emailError = $state<FormProps["emailError"]>(),
    // Form.
    formError = $state<FormProps["formError"]>(),
    formStatus = $state<FormProps["formStatus"]>(),
    formStatusTitle = $state<FormProps["formStatusTitle"]>(),
    formStatusText = $state<FormProps["formStatusText"]>(),
    formStatusIconID = $state("");

  // ===================================================================================================================
  // Helpers.
  // ===================================================================================================================
  // Basic.
  function loginAction() {
    sessionScreen.setScreen("login");
  }

  // Statuses
  function resetAllStatuses() {
    emailError = undefined;
    formError = undefined;
    emailStatus = "idle";
    formStatus = "idle";
    formStatusTitle = undefined;
    formStatusText = undefined;
    formStatusIconID = "";
    emailStatusText = undefined;
  }

  function setEmailStatus(params?: EmailStatus) {
    if (params) {
      emailStatus = params.status;
      emailError = params.error;
      emailStatusText = params.text;
    }
  }
  function setFormStatus(params?: FormStatus) {
    if (params) {
      formStatus = params.status;
      formError = params.error;
      formStatusTitle = params.title;
      formStatusText = params.text;
      formStatusIconID = params.iconID ?? "";
    }
  }

  function handleValidationError(val: $ZodIssue) {
    switch (val.path.join(".")) {
      case "email":
        setEmailStatus({ status: "invalid", ...validators.handleEmailValidationError(val) });
        break;
      default:
        setFormStatus({ status: "invalid", ...validators.formValidationError(val) });
        break;
    }
  }
  function handleSubmitError(err: unknown) {
    const emailValidated = validators.handleEmailSubmitError(err);
    setEmailStatus(emailValidated && { status: "invalid", ...emailValidated });

    // If no specific error has been set, set a general form error.
    if (emailStatus !== "invalid") {
      setFormStatus({
        status: "invalid",
        title: $t("submit.error.title", "Password-reset failed."),
        text: $t(
          "submit.error.text",
          "An unknown error occurred during password-reset form creation. You may try again later."
        ),
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
    const formData = await ShortCodeCreatePasswordResetRequestSchema.safeParseAsync(rawFormData);
    formData.error?.issues.forEach(handleValidationError);
    if (!formData.success) {
      formStatus = formStatus === "validating" ? "idle" : formStatus;
      return;
    }

    // Submit to API.
    await shortCodeCreatePasswordReset(api, session.accessToken, formData.data)
      .then(() => {
        setFormStatus({ status: "valid" });
      })
      .catch(handleSubmitError);
  }

  // Getters & Setters.
  function getEmail() {
    return email;
  }

  function setEmail(value: string) {
    value = value.trim(); // IMPORTANT: keep separate reference to the current value.
    email = value;
    checkEmailDebouncer.call(() => {
      validators.validateEmail(value, api, setEmailStatus, false);
    });
  }
</script>

{#snippet formStatusIcon()}
  <Icon icon={formStatusIconID} />
{/snippet}

<Validators bind:this={validators} />

<PasswordResetPage
  {...props}
  bind:email={getEmail, setEmail}
  {onsubmit}
  {loginAction}
  {emailStatus}
  {emailStatusText}
  {emailError}
  {formStatus}
  {formError}
  {formStatusTitle}
  {formStatusText}
  {formStatusIcon}
  disabled={!session.accessToken}
>
  <input type="hidden" name="lang" value={activeLocale ?? DEFAULT_LNG} />
</PasswordResetPage>
