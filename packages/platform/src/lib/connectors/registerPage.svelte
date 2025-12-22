<script lang="ts">
  import { RegisterPage } from "$lib/ui";

  import { onDestroy } from "svelte";
  import type { EventHandler } from "svelte/elements";

  import { isHttpStatusError } from "@a-novel-kit/nodelib-browser/http";
  import { Debounce } from "@a-novel-kit/nodelib-browser/utils";
  import { getSession } from "@a-novel/package-authentication";
  import type { FormFieldStatus, FormStatus } from "@a-novel/package-authentication/ui/components";
  import type { FormConnectorStatus, FormFieldConnectorStatus } from "@a-novel/package-authentication/ui/components";
  import { Validators } from "@a-novel/package-authentication/utils";
  import {
    type AuthenticationApi,
    CredentialsCreateRequestSchema,
    credentialsCreate,
  } from "@a-novel/service-authentication-rest";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";
  import type { $ZodIssue } from "zod/v4/core";

  // ===================================================================================================================
  // Props.
  // ===================================================================================================================
  interface Props {
    api: AuthenticationApi;
    shortCode: string;
    email: string;
  }

  let { api, shortCode, email }: Props = $props();

  // ===================================================================================================================
  // Stores & dependencies.
  // ===================================================================================================================
  const { t } = getTranslate("auth.platform.page.register");
  const session = getSession();
  let validators: ReturnType<typeof Validators>;

  const checkEmailDebouncer = new Debounce(300);
  onDestroy(() => {
    checkEmailDebouncer.cancel();
  });

  const ExtendedSchema = CredentialsCreateRequestSchema.extend({
    passwordConfirmation: CredentialsCreateRequestSchema.shape.password,
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
  let // Password update: new password.
    passwordStatus = $state<FormFieldStatus>("idle"),
    passwordStatusText = $state<string>(),
    passwordError = $state<Error>(),
    // Password update: confirm new password.
    passwordConfirmationStatus = $state<FormFieldStatus>("idle"),
    passwordConfirmationStatusText = $state<string>(),
    passwordConfirmationError = $state<Error>(),
    // Password update: form status.
    formStatus = $state<FormStatus>("idle"),
    formStatusTitle = $state<string>(),
    formStatusText = $state<string>(),
    formStatusIconID = $state<string>(),
    formError = $state<Error>();

  // ===================================================================================================================
  // Helpers.
  // ===================================================================================================================
  // Statuses
  function resetAllStatuses() {
    // Password
    passwordStatus = "idle";
    passwordStatusText = undefined;
    passwordError = undefined;
    // Password confirmation
    passwordConfirmationStatus = "idle";
    passwordConfirmationStatusText = undefined;
    passwordConfirmationError = undefined;
    // Form
    formStatus = "idle";
    formStatusTitle = undefined;
    formStatusText = undefined;
    formStatusIconID = undefined;
    formError = undefined;
  }

  function setPasswordStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordStatus = params.status;
      passwordStatusText = params.text;
      passwordError = params.error;
    }
  }

  function setPasswordConfirmationStatus(params?: FormFieldConnectorStatus) {
    if (params) {
      passwordConfirmationStatus = params.status;
      passwordConfirmationStatusText = params.text;
      passwordConfirmationError = params.error;
    }
  }

  function setFormStatus(params?: FormConnectorStatus) {
    if (params) {
      formStatus = params.status;
      formStatusTitle = params.title;
      formStatusText = params.text;
      formStatusIconID = params.iconID;
      formError = params.error;
    }
  }

  // Handlers.
  function handleValidationError(val: $ZodIssue) {
    switch (val.path.join(".")) {
      case "password":
        setPasswordStatus({
          status: "invalid",
          ...validators.handlePasswordValidationError(val),
        });
        break;
      case "passwordConfirmation":
        setPasswordConfirmationStatus({
          status: "invalid",
          ...validators.handlePasswordValidationError(val),
        });
        break;
    }
  }

  function handleSubmitError(err: unknown) {
    switch (true) {
      case isHttpStatusError(err, 403):
        setFormStatus({
          status: "invalid",
          text: $t(
            "submit.error.unauthorized.text",
            "You are not allowed to create an account with the provided information. The link you are trying to use may have expired or is invalid, or has already been used."
          ),
        });
        break;
      case isHttpStatusError(err, 409):
        setFormStatus({
          status: "invalid",
          text: $t(
            "submit.error.alreadyTaken.text",
            "An account with the source email already exists. This means your link has probably already been used. You may try logging in instead."
          ),
        });
        break;
      default:
        setFormStatus({
          status: "invalid",
          title: $t("submit.error.title", "Registration failed."),
          text: $t("submit.error.text", "An unknown error occurred during registration. You may try again later."),
          iconID: "lucide:server-off",
          error: err instanceof Error ? err : undefined,
        });
    }
  }

  async function onsubmit(evt: Parameters<EventHandler<SubmitEvent, HTMLFormElement>>[0]) {
    evt.preventDefault();
    resetAllStatuses();

    const rawFormData = Object.fromEntries(new FormData(evt.currentTarget).entries());

    // Validate form data locally.
    const formData = await ExtendedSchema.safeParseAsync(rawFormData);
    formData.error?.issues.forEach(handleValidationError);
    if (!formData.success) {
      formStatus = formStatus === "validating" ? "idle" : formStatus;
      return;
    }

    // Submit to API.
    await credentialsCreate(api, session.accessToken, {
      email: formData.data.email,
      password: formData.data.password,
      shortCode: formData.data.shortCode,
    })
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

<RegisterPage
  {email}
  {formStatus}
  {formStatusTitle}
  {formStatusText}
  {formError}
  {formStatusIcon}
  {onsubmit}
  {passwordStatus}
  {passwordStatusText}
  {passwordError}
  {passwordConfirmationStatus}
  {passwordConfirmationStatusText}
  {passwordConfirmationError}
>
  <input type="hidden" name="email" value={email} />
  <input type="hidden" name="shortCode" value={shortCode} />
</RegisterPage>
