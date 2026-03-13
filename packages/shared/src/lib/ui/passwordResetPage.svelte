<script lang="ts">
  import { type FormFieldStatus, FullPageForm, PageFormSuccess, TextInput } from "$lib/ui/components";

  import type { ComponentProps, Snippet } from "svelte";

  import { MAX_EMAIL_LENGTH } from "@a-novel/service-authentication-rest";
  import { Button } from "@a-novel/uikit/ui/components";
  import { CheckIcon, LoadingIcon } from "@a-novel/uikit/ui/icons";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props extends Omit<ComponentProps<typeof FullPageForm>, "children" | "title"> {
    email?: string;
    emailStatus?: FormFieldStatus;
    emailStatusText?: string;
    emailError?: Error;

    loginAction?: () => void;

    disabled?: boolean;

    children?: Snippet;
  }

  let {
    children,
    email = $bindable(""),
    emailStatus = "idle",
    emailStatusText,
    emailError,
    formStatus = "idle",
    loginAction,
    disabled,
    ...props
  }: Props = $props();

  const { t } = getTranslate("auth.page.passwordReset");

  let disableSubmit = $derived(disabled || formStatus === "validating" || emailStatus === "validating");
</script>

<FullPageForm {...props} aria-label={$t("aria.form", "Password-reset form")} {formStatus}>
  {#snippet title()}
    <h1>{$t("title", "Password reset")}</h1>
  {/snippet}

  {#snippet success()}
    <PageFormSuccess>
      {#snippet title()}
        {$t("success.title", "Password-reset form created!")}
      {/snippet}

      {#snippet message()}
        {@html $t(
          "success.main",
          "A link will be sent to <strong>{user}</strong>, if an account exists with this email. This link contains a single-usage temporary form to reset your password.",
          { user: email }
        )}
      {/snippet}

      {#snippet sub()}
        {@html $t(
          "success.sub",
          "If you fail to open and complete the form in time, you can always ask for a new one from this page. You may now <strong>leave this page</strong>, or proceed to <strong>login</strong> once you have reset your password."
        )}
      {/snippet}
    </PageFormSuccess>

    <div class="actions">
      <Button style="flex-grow: 1" color="primary" type="button" onclick={loginAction}>
        {$t("login", "Login")}
      </Button>
    </div>
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

    {#snippet helper()}
      <span>
        {$t("field.email.helper", "A link to a password-reset form will be sent to this address.")}
      </span>
    {/snippet}

    {#snippet endAdornment()}
      {#if emailStatus === "validating"}
        <LoadingIcon font-size="1.5em" color="default" />
      {:else if emailStatus === "valid"}
        <CheckIcon font-size="1.8em" color="primary" />
      {/if}
    {/snippet}
  </TextInput>

  {@render children?.()}

  <div class="actions">
    <Button style="flex-grow: 1.6" disabled={disableSubmit} color="primary" type="submit">
      {formStatus === "validating" ? $t("submitting", "Creating form...") : $t("submit", "Reset password")}
    </Button>
    <Button style="flex-grow: 1" color="invert" type="button" onclick={loginAction}>
      {$t("login", "Login")}
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
