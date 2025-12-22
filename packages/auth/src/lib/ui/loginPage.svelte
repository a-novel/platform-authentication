<script lang="ts">
  import { FullPageForm, FullPageFormSuccess, TextInput } from "$lib/ui/components";

  import type { ComponentProps } from "svelte";

  import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from "@a-novel/service-authentication-rest";
  import { Button } from "@a-novel/uikit/ui/components";
  import { CheckIcon, LoadingIcon } from "@a-novel/uikit/ui/icons";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props extends Omit<ComponentProps<typeof FullPageForm>, "children" | "title" | "success"> {
    email?: string;
    emailStatus?: "idle" | "validating" | "invalid" | "valid";
    emailStatusText?: string;
    emailError?: Error;

    password?: string;
    passwordStatus?: "idle" | "validating" | "invalid" | "valid";
    passwordStatusText?: string;
    passwordError?: Error;

    postSuccessAction?: () => void;
    registerAction?: () => void;
    passwordResetAction?: () => void;

    disabled?: boolean;
  }

  let {
    email = $bindable(""),
    password = $bindable(""),
    emailStatus = "idle",
    passwordStatus = "idle",
    emailStatusText,
    passwordStatusText,
    emailError,
    passwordError,
    postSuccessAction,
    registerAction,
    passwordResetAction,
    formStatus = "idle",
    disabled,
    ...props
  }: Props = $props();

  const { t } = getTranslate("auth.page.login");

  let revealPassword = $state(false);

  function toggleRevealPassword() {
    revealPassword = !revealPassword;
  }

  const successAnimationDelay = 1000; // milliseconds

  // Slightly delay the post-success action to show success screen.
  $effect(() => {
    if (formStatus !== "valid" || !postSuccessAction) {
      return;
    }

    const timeout = setTimeout(postSuccessAction, successAnimationDelay);
    return () => clearTimeout(timeout);
  });

  let disableSubmit = $derived(
    disabled || formStatus === "validating" || emailStatus === "validating" || passwordStatus === "validating"
  );
</script>

<FullPageForm {...props} aria-label={$t("aria.form", "Login form")} {formStatus}>
  {#snippet title()}
    {$t("title", "Login")}
  {/snippet}

  {#snippet success()}
    <FullPageFormSuccess>
      {#snippet message()}
        {@html $t("success.main", "Login successful! Welcome back, <strong>{user}</strong>.", {
          user: email,
        })}
      {/snippet}

      {#snippet sub()}
        {$t("success.sub", "Redirecting...")}
      {/snippet}
    </FullPageFormSuccess>
  {/snippet}

  <TextInput
    bind:value={email}
    required
    name="email"
    type="email"
    min={1}
    max={MAX_EMAIL_LENGTH}
    status={emailStatus}
    statusText={emailStatusText}
    error={emailError}
  >
    {#snippet label()}
      <Icon icon="material-symbols:mail-outline" />
      <span>{$t("field.email.label", "Email")}</span>
    {/snippet}

    {#snippet endAdornment()}
      {#if emailStatus === "validating"}
        <LoadingIcon font-size="1.5em" color="default" />
      {:else if emailStatus === "valid"}
        <CheckIcon font-size="1.8em" color="primary" />
      {/if}
    {/snippet}
  </TextInput>
  <TextInput
    bind:value={password}
    required
    name="password"
    min={1}
    max={MAX_PASSWORD_LENGTH}
    type={revealPassword ? "text" : "password"}
    status={passwordStatus}
    statusText={passwordStatusText}
    error={passwordError}
  >
    {#snippet label()}
      <Icon icon="material-symbols:password-2" />
      <span>{$t("field.password.label", "Password")}</span>
    {/snippet}

    {#snippet endAdornment()}
      <Button
        aria-label={revealPassword
          ? $t("field.password.aria.hide", "Hide password")
          : $t("field.password.aria.reveal", "Reveal password")}
        color={revealPassword ? "primary" : "invert"}
        icon
        onclick={toggleRevealPassword}
        type="button"
      >
        <Icon icon={revealPassword ? "material-symbols:password-2" : "material-symbols:password-2-off"} />
      </Button>
    {/snippet}
  </TextInput>

  <button class="password-forgot" type="button" onclick={passwordResetAction}>
    {$t("password.forgot", "Forgot your password?")}
  </button>

  <div class="actions">
    <Button style="flex-grow: 1.6" disabled={disableSubmit} color="primary" type="submit">
      {formStatus === "validating" ? $t("submitting", "Creating session...") : $t("submit", "Login")}
    </Button>
    <Button style="flex-grow: 1" color="invert" type="button" onclick={registerAction}>
      {$t("register", "Register")}
    </Button>
  </div>
</FullPageForm>

<style>
  .password-forgot {
    align-self: flex-end;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
    color: var(--color-primary-500);
    font-size: var(--font-size-s);
  }

  .actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-s);
    margin: var(--spacing-s) 0 var(--spacing-xs) 0;
  }
</style>
