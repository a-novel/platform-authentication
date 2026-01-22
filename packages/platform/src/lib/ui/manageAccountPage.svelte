<script lang="ts">
  import type { Component, Snippet } from "svelte";
  import type { HTMLFormAttributes } from "svelte/elements";

  import {
    type FormFieldStatus,
    type FormStatus,
    PageForm,
    PageFormSuccess,
    PasswordInput,
    TextInput,
  } from "@a-novel/package-authentication/ui/components";
  import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@a-novel/service-authentication-rest";
  import { Button } from "@a-novel/uikit/ui/components";
  import { CheckIcon, LoadingIcon } from "@a-novel/uikit/ui/icons";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props {
    // Email update form.
    onEmailUpdateSubmit?: HTMLFormAttributes["onsubmit"];

    emailUpdateEmail?: string;
    emailUpdateEmailStatus?: FormFieldStatus;
    emailUpdateEmailStatusText?: string;
    emailUpdateEmailError?: Error;

    emailUpdateFormStatus?: FormStatus;
    emailUpdateFormError?: Error;
    emailUpdateFormStatusTitle?: string;
    emailUpdateFormStatusText?: string;
    emailUpdateFormStatusIcon?: Snippet | Component<{}, {}, "">;

    emailUpdateDisabled?: boolean;

    emailUpdateChildren?: Snippet;

    // Password update
    onPasswordUpdateSubmit?: HTMLFormAttributes["onsubmit"];

    passwordUpdateNewPassword?: string;
    passwordUpdateNewPasswordStatus?: FormFieldStatus;
    passwordUpdateNewPasswordStatusText?: string;
    passwordUpdateNewPasswordError?: Error;

    passwordUpdateNewPasswordConfirmation?: string;
    passwordUpdateNewPasswordConfirmationStatus?: FormFieldStatus;
    passwordUpdateNewPasswordConfirmationStatusText?: string;
    passwordUpdateNewPasswordConfirmationError?: Error;

    passwordUpdateCurrentPassword?: string;
    passwordUpdateCurrentPasswordStatus?: FormFieldStatus;
    passwordUpdateCurrentPasswordStatusText?: string;
    passwordUpdateCurrentPasswordError?: Error;

    passwordUpdateFormStatus?: FormStatus;
    passwordUpdateFormError?: Error;
    passwordUpdateFormStatusTitle?: string;
    passwordUpdateFormStatusText?: string;
    passwordUpdateFormStatusIcon?: Snippet | Component<{}, {}, "">;

    passwordUpdateDisabled?: boolean;

    passwordUpdateChildren?: Snippet;
  }

  let {
    onEmailUpdateSubmit,
    emailUpdateEmail = $bindable(""),
    emailUpdateEmailStatus = "idle",
    emailUpdateEmailStatusText,
    emailUpdateEmailError,
    emailUpdateFormStatus = "idle",
    emailUpdateFormError,
    emailUpdateFormStatusTitle,
    emailUpdateFormStatusText,
    emailUpdateFormStatusIcon,
    emailUpdateDisabled,
    emailUpdateChildren,
    onPasswordUpdateSubmit,
    passwordUpdateNewPassword = $bindable(""),
    passwordUpdateNewPasswordStatus = "idle",
    passwordUpdateNewPasswordStatusText,
    passwordUpdateNewPasswordError,
    passwordUpdateNewPasswordConfirmation = $bindable(""),
    passwordUpdateNewPasswordConfirmationStatus = "idle",
    passwordUpdateNewPasswordConfirmationStatusText,
    passwordUpdateNewPasswordConfirmationError,
    passwordUpdateCurrentPassword = $bindable(""),
    passwordUpdateCurrentPasswordStatus = "idle",
    passwordUpdateCurrentPasswordStatusText,
    passwordUpdateCurrentPasswordError,
    passwordUpdateFormStatus = "idle",
    passwordUpdateFormError,
    passwordUpdateFormStatusTitle,
    passwordUpdateFormStatusText,
    passwordUpdateFormStatusIcon,
    passwordUpdateDisabled,
    passwordUpdateChildren,
  }: Props = $props();

  const { t } = getTranslate("auth.platform.page.manageAccount");

  let disableEmailUpdateSubmit = $derived(
    emailUpdateDisabled || emailUpdateFormStatus === "validating" || emailUpdateEmailStatus === "validating"
  );

  let disablePasswordUpdateSubmit = $derived(
    passwordUpdateDisabled ||
      passwordUpdateFormStatus === "validating" ||
      passwordUpdateNewPasswordStatus === "validating" ||
      passwordUpdateNewPasswordConfirmationStatus === "validating" ||
      passwordUpdateCurrentPasswordStatus === "validating"
  );
</script>

<section data-width="l">
  <h1>{$t("page.title", "Account management")}</h1>

  <PageForm
    onsubmit={onEmailUpdateSubmit}
    formError={emailUpdateFormError}
    formStatus={emailUpdateFormStatus}
    formStatusTitle={emailUpdateFormStatusTitle}
    formStatusText={emailUpdateFormStatusText}
    formStatusIcon={emailUpdateFormStatusIcon}
    aria-label={$t("emailUpdate.aria.form", "Email update form")}
  >
    {#snippet title()}
      <h2>{$t("emailUpdate.title", "Update email address")}</h2>
    {/snippet}

    {#snippet success()}
      <PageFormSuccess>
        {#snippet title()}
          {$t("emailUpdate.success.title", "Confirmation email sent")}
        {/snippet}

        {#snippet message()}
          {@html $t(
            "emailUpdate.success.main",
            "A validation link will be sent to <strong>{email}</strong>, if no account uses this email yet. You must click this link to activate your new email.",
            { email: emailUpdateEmail }
          )}
        {/snippet}

        {#snippet sub()}
          {$t(
            "emailUpdate.success.sub",
            "If you don't receive the email shortly, please check your spam folder. You can ask for a new link by reloading this page."
          )}
        {/snippet}
      </PageFormSuccess>
    {/snippet}

    <TextInput
      bind:value={emailUpdateEmail}
      required
      name="email"
      type="email"
      min={1}
      max={MAX_EMAIL_LENGTH}
      status={emailUpdateEmailStatus}
      statusText={emailUpdateEmailStatusText}
      error={emailUpdateEmailError}
    >
      {#snippet label()}
        <Icon icon="material-symbols:mail-outline" />
        <span>{$t("emailUpdate.field.email.label", "New email")}</span>
      {/snippet}

      {#snippet helper()}
        <span>
          {$t("emailUpdate.field.email.helper", "A validation link will be sent to this address.")}
        </span>
      {/snippet}

      {#snippet endAdornment()}
        {#if emailUpdateEmailStatus === "validating"}
          <LoadingIcon font-size="1.5em" color="default" />
        {:else if emailUpdateEmailStatus === "valid"}
          <CheckIcon font-size="1.8em" color="primary" />
        {/if}
      {/snippet}
    </TextInput>

    {@render emailUpdateChildren?.()}

    <div class="actions">
      <Button style="flex-grow: 1" disabled={disableEmailUpdateSubmit} color="primary" type="submit">
        {emailUpdateFormStatus === "validating"
          ? $t("emailUpdate.submitting", "Sending validation link...")
          : $t("emailUpdate.submit", "Get validation link")}
      </Button>
    </div>
  </PageForm>

  <PageForm
    onsubmit={onPasswordUpdateSubmit}
    formError={passwordUpdateFormError}
    formStatus={passwordUpdateFormStatus}
    formStatusTitle={passwordUpdateFormStatusTitle}
    formStatusText={passwordUpdateFormStatusText}
    formStatusIcon={passwordUpdateFormStatusIcon}
    aria-label={$t("passwordUpdate.aria.form", "Password update form")}
  >
    {#snippet title()}
      <h2>{$t("passwordUpdate.title", "Update password")}</h2>
    {/snippet}

    {#snippet success()}
      <PageFormSuccess>
        {#snippet title()}
          {$t("passwordUpdate.success.title", "Password updated successfully!")}
        {/snippet}

        {#snippet message()}
          {$t(
            "passwordUpdate.success.main",
            "Your password has been successfully updated. You can now use your new password to log in."
          )}
        {/snippet}
      </PageFormSuccess>
    {/snippet}

    <PasswordInput
      bind:value={passwordUpdateNewPassword}
      required
      name="password"
      min={1}
      max={MAX_PASSWORD_LENGTH}
      status={passwordUpdateNewPasswordStatus}
      statusText={passwordUpdateNewPasswordStatusText}
      error={passwordUpdateNewPasswordError}
    >
      {#snippet label()}
        <Icon icon="material-symbols:password-2" />
        <span>{$t("passwordUpdate.field.newPassword.label", "New password")}</span>
      {/snippet}
    </PasswordInput>

    <PasswordInput
      bind:value={passwordUpdateNewPasswordConfirmation}
      required
      name="passwordConfirmation"
      min={1}
      max={MAX_PASSWORD_LENGTH}
      status={passwordUpdateNewPasswordConfirmationStatus}
      statusText={passwordUpdateNewPasswordConfirmationStatusText}
      error={passwordUpdateNewPasswordConfirmationError}
    >
      {#snippet label()}
        <Icon icon="material-symbols:password-2" />
        <span>{$t("passwordUpdate.field.newPasswordConfirmation.label", "Confirm new password")}</span>
      {/snippet}
      {#snippet helper()}
        {$t("passwordUpdate.field.newPasswordConfirmation.helper", "Please re-enter your new password to confirm it.")}
      {/snippet}
    </PasswordInput>

    <PasswordInput
      bind:value={passwordUpdateCurrentPassword}
      required
      name="currentPassword"
      min={1}
      max={MAX_PASSWORD_LENGTH}
      status={passwordUpdateCurrentPasswordStatus}
      statusText={passwordUpdateCurrentPasswordStatusText}
      error={passwordUpdateCurrentPasswordError}
    >
      {#snippet label()}
        <Icon icon="material-symbols:password-2" />
        <span>{$t("passwordUpdate.field.currentPassword.label", "Current password")}</span>
      {/snippet}
    </PasswordInput>

    {@render passwordUpdateChildren?.()}

    <div class="actions">
      <Button style="flex-grow: 1" disabled={disablePasswordUpdateSubmit} color="primary" type="submit">
        {passwordUpdateFormStatus === "validating"
          ? $t("passwordUpdate.submitting", "Updating password...")
          : $t("passwordUpdate.submit", "Update password")}
      </Button>
    </div>
  </PageForm>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-l);
    margin: auto;
    padding: var(--spacing-s);
  }

  h1 {
    text-align: center;
  }

  h2 {
    margin: var(--spacing-m) 0;
    color: var(--text);
    font-size: var(--font-size-h3);
    text-align: center;
  }

  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-s);
    margin: var(--spacing-s) 0 var(--spacing-xs) 0;
  }
</style>
