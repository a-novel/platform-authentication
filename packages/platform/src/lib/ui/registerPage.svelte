<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";

  import {
    type FormFieldStatus,
    FullPageForm,
    PageFormSuccess,
    PasswordInput,
  } from "@a-novel/package-authentication/ui/components";
  import { MAX_PASSWORD_LENGTH } from "@a-novel/service-authentication-rest";
  import { Button } from "@a-novel/uikit/ui/components";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props extends Omit<ComponentProps<typeof FullPageForm>, "children" | "title" | "success"> {
    email: string;

    password?: string;
    passwordStatus?: FormFieldStatus;
    passwordStatusText?: string;
    passwordError?: Error;

    passwordConfirmation?: string;
    passwordConfirmationStatus?: FormFieldStatus;
    passwordConfirmationStatusText?: string;
    passwordConfirmationError?: Error;

    accountAction?: () => void;

    disabled?: boolean;

    children?: Snippet;
  }

  let {
    email,
    password = $bindable(""),
    passwordStatus = "idle",
    passwordStatusText,
    passwordError,
    passwordConfirmation = $bindable(""),
    passwordConfirmationStatus = "idle",
    passwordConfirmationStatusText,
    passwordConfirmationError,
    accountAction,
    formStatus = "idle",
    disabled,
    children,
    ...props
  }: Props = $props();

  const { t } = getTranslate("auth.platform.page.register");

  let disableSubmit = $derived(
    disabled ||
      formStatus === "validating" ||
      passwordStatus === "validating" ||
      passwordConfirmationStatus === "validating"
  );
</script>

<FullPageForm {...props} aria-label={$t("aria.form", "Register completion form")} {formStatus}>
  {#snippet title()}
    <h1>{$t("title", "Complete registration")}</h1>
  {/snippet}

  {#snippet success()}
    <PageFormSuccess>
      {#snippet title()}
        {$t("success.title", "Registration successful!")}
      {/snippet}

      {#snippet message()}
        {@html $t("success.main", "Registration completed! Welcome aboard, <strong>{user}</strong>.", {
          user: email,
        })}
      {/snippet}

      {#snippet sub()}
        {$t(
          "success.sub",
          "You may now close this page, or proceed to your account page. You are already logged in so no further action is required."
        )}
      {/snippet}
    </PageFormSuccess>

    <div class="actions">
      <Button style="flex-grow: 1" color="primary" type="button" onclick={accountAction}>
        {$t("account.action", "Manage my account")}
      </Button>
    </div>
  {/snippet}

  <PasswordInput
    bind:value={password}
    required
    name="password"
    min={1}
    max={MAX_PASSWORD_LENGTH}
    status={passwordStatus}
    statusText={passwordStatusText}
    error={passwordError}
  >
    {#snippet label()}
      <Icon icon="material-symbols:password-2" />
      <span>{$t("field.password.label", "Password")}</span>
    {/snippet}
  </PasswordInput>
  <PasswordInput
    bind:value={passwordConfirmation}
    required
    name="passwordConfirmation"
    min={1}
    max={MAX_PASSWORD_LENGTH}
    status={passwordConfirmationStatus}
    statusText={passwordConfirmationStatusText}
    error={passwordConfirmationError}
  >
    {#snippet label()}
      <Icon icon="material-symbols:password-2" />
      <span>{$t("field.passwordConfirmation.label", "Confirm password")}</span>
    {/snippet}
    {#snippet helper()}
      {$t("field.passwordConfirmation.helper", "Please re-enter your password to confirm it.")}
    {/snippet}
  </PasswordInput>

  {@render children?.()}

  <div class="actions">
    <Button style="flex-grow: 1" disabled={disableSubmit} color="primary" type="submit">
      {formStatus === "validating" ? $t("submitting", "Creating account...") : $t("submit", "Create account")}
    </Button>
  </div>
</FullPageForm>

<style>
  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-s);
    margin: var(--spacing-s) 0 var(--spacing-xs) 0;
  }
</style>
