<script lang="ts">
  import type { ComponentProps } from "svelte";

  import { Button } from "@a-novel/uikit/ui/components";
  import { ActionSection } from "@a-novel/uikit/ui/components/nav";

  import { getTranslate } from "@tolgee/svelte";

  interface Props extends Omit<ComponentProps<typeof ActionSection>, "title" | "children"> {
    onLogin: () => void;
    onRegister: () => void;
    onLogout: () => void;
    onManageAccount: () => void;
    credentials?:
      | {
          email: string;
        }
      | "loading";
  }

  let { credentials, onLogin, onLogout, onManageAccount, onRegister, ...props }: Props = $props();

  const { t } = getTranslate("auth.nav");

  // Parse user mail by splitting it into user and host part. Since any registered
  // user has a valid email address, their should never be a case when splitting fails.
  // However, as scripts can be manipulated, we still handle edge cases here.
  function safeParseMail(source: string): [string, string] {
    const parts = source.split("@");

    // Only return what's provided, don't use placeholders.
    switch (parts.length) {
      case 0:
        return ["", ""];
      case 1:
        return [parts[0], ""];
      default:
        return [parts[0], parts.slice(1).join("@")];
    }
  }

  let splitMail = $derived(safeParseMail(typeof credentials === "object" ? credentials.email : ""));
</script>

{#snippet renderMobile()}
  <div class="account">
    {#if credentials === "loading"}
      <p class="info loading" aria-busy="true">{$t("account.loading", "Loading user info...")}</p>
    {:else if credentials}
      <p class="info">{$t("account.info", "You are logged in as")}</p>
      <p class="email">{credentials.email}</p>
    {/if}
    <div class="actions">
      <Button color="primary" aria-label={$t("account.aria.manage", "Manage account")} onclick={onManageAccount}>
        {$t("account.manage", "Manage")}
      </Button>
      <Button color="default" onclick={onLogout}>{$t("logout", "Logout")}</Button>
    </div>
  </div>
{/snippet}

{#snippet renderDesktop()}
  {#if credentials === "loading"}
    <button
      class="account loading"
      aria-busy="true"
      aria-label={$t("account.aria.manage", "Manage account")}
      onclick={onManageAccount}
    >
      <span class="username">&nbsp;</span>
      <span class="provider">&nbsp;</span>
    </button>
  {:else if credentials}
    <button class="account" aria-label={$t("account.aria.manage", "Manage account")} onclick={onManageAccount}>
      <span class="username">{splitMail[0]}</span>
      <span class="provider">@{splitMail[1]}</span>
    </button>
  {/if}
  <Button color="default" onclick={onLogout}>{$t("logout", "Logout")}</Button>
{/snippet}

{#if credentials}
  <ActionSection {...props} title={$t("account", "Account")}>
    {#if props.mobile}
      {@render renderMobile()}
    {:else}
      {@render renderDesktop()}
    {/if}
  </ActionSection>
{:else}
  <ActionSection {...props} title={$t("auth", "Authentication")}>
    <Button color="default" onclick={onLogin}>{$t("login", "Login")}</Button>
    <Button color="primary" onclick={onRegister}>{$t("register", "Register")}</Button>
  </ActionSection>
{/if}

<style>
  /* Mobile */
  div.account {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xxs);
    margin: 0;

    & > .info {
      margin: 0;
      color: var(--color-gray-600);
      font-size: var(--font-size-p);
      text-align: center;

      &.loading {
        font-style: italic;
      }
    }

    & > .email {
      margin: 0;
      color: var(--color-gray-900);
      font-size: var(--font-size-h6);
      text-align: center;
      word-break: break-all;
    }

    & > .actions {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-s);
      margin-top: var(--spacing-m);

      & > :global(*) {
        flex: 1 1 0;
      }
    }
  }

  /* Desktop */
  button.account {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;

    transition: linear 0.1s;

    cursor: pointer;
    margin: var(--spacing-xs) 0;
    border: none;

    border-radius: var(--spacing-xs);

    background: none;
    padding: var(--spacing-xxs) var(--spacing-xs);

    min-width: 10ch;
    max-width: 20ch;
    overflow: hidden;
    text-align: right;

    &.loading {
      animation: loadingPulse 3s infinite;
    }

    &:hover {
      transition: linear 0s;
      background-color: var(--color-gray-200);
    }

    & > .username {
      overflow: hidden;
      color: var(--color-gray-900);
      font-size: var(--font-size-p);
      text-overflow: ellipsis;
    }
    & > .provider {
      overflow: hidden;
      color: var(--color-gray-600);
      font-size: var(--font-size-xsmall);
      text-overflow: ellipsis;
    }
  }

  @keyframes loadingPulse {
    0% {
      background-color: var(--color-gray-100);
    }
    50% {
      background-color: var(--color-gray-200);
    }
    100% {
      background-color: var(--color-gray-100);
    }
  }
</style>
