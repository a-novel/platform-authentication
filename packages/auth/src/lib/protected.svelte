<script lang="ts">
  import { getSession, getSessionScreen } from "$lib";

  import { type Snippet, untrack } from "svelte";

  import { StatusPage } from "@a-novel/uikit/ui/components";

  import Icon from "@iconify/svelte";
  import { getTranslate } from "@tolgee/svelte";

  interface Props {
    children: Snippet;
    roles?: string[];
  }

  let { children, roles }: Props = $props();
  const session = getSession();
  const sessionScreen = getSessionScreen();
  const { t } = getTranslate("auth:protected");

  let forbidden = $derived.by(() => {
    // If some roles are required and the user has a session, verify them.
    // IF the user does not have the required roles, show forbidden message.
    if (roles?.length && session.claims?.userID) {
      const userRoles = (session.claims.roles || []) as string[];
      return !roles.some((role) => userRoles.includes(role));
    } else {
      return false;
    }
  });

  $effect(() => {
    // Render login screen if the user has no authenticated session.
    // Don't show login if there is no access token as it means the session
    // has not been initialized yet (an anonymous session is always created).
    if (session.accessToken && !session.claims?.userID) {
      untrack(() => {
        sessionScreen.setScreen("login");
      });
    }
  });
</script>

{#if !forbidden}
  {@render children()}
{:else}
  <StatusPage color="accent">
    {#snippet icon()}
      <Icon icon="healthicons:refused-outline" />
    {/snippet}

    {#snippet title()}
      {$t("page.forbidden.title", "Access forbidden.")}
    {/snippet}

    {$t(
      "page.forbidden.content",
      "You do not have the required permissions to access this page. Please contact an administrator to request higher privileges, or log in with a different account."
    )}
  </StatusPage>
{/if}
