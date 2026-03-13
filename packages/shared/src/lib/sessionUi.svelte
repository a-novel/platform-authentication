<script lang="ts">
  import { SESSION_SCREEN_CONTEXT_KEY, type SessionScreen, type SessionScreenContext } from "$lib";
  import { LoginPageConnector, PasswordResetPageConnector, RegisterPageConnector } from "$lib/connectors";

  import { type Snippet, setContext } from "svelte";

  import type { AuthenticationApi } from "@a-novel/service-authentication-rest";

  interface Props {
    children: Snippet;
    wrapper?: Snippet<[children: Snippet]>;
    api: AuthenticationApi;
  }

  let { children, wrapper, api }: Props = $props();

  let activeScreen = $state<SessionScreen>();

  setContext(SESSION_SCREEN_CONTEXT_KEY, {
    setScreen(sessionScreen?: SessionScreen) {
      activeScreen = sessionScreen;
    },
  } satisfies SessionScreenContext);
</script>

{#snippet content()}
  {#if activeScreen === "login"}
    <LoginPageConnector {api} />
  {:else if activeScreen === "register"}
    <RegisterPageConnector {api} />
  {:else if activeScreen === "passwordReset"}
    <PasswordResetPageConnector {api} />
  {:else}
    {@render children()}
  {/if}
{/snippet}

{#if wrapper}
  {@render wrapper(content)}
{:else}
  {@render content()}
{/if}
