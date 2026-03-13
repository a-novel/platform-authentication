<script lang="ts">
  import { getSession, getSessionScreen } from "$lib";
  import { NavAuth } from "$lib/ui";

  import type { ComponentProps } from "svelte";

  import { type AuthenticationApi, credentialsGet } from "@a-novel/service-authentication-rest";

  interface Props extends Omit<ComponentProps<typeof NavAuth>, "onLogin" | "onRegister" | "onLogout" | "credentials"> {
    api: AuthenticationApi;
  }

  let { api, ...props }: Props = $props();

  const session = getSession();
  const sessionScreen = getSessionScreen();

  function onLogin() {
    sessionScreen.setScreen("login");
  }

  function onRegister() {
    sessionScreen.setScreen("register");
  }

  function onLogout() {
    return session.resetSession();
  }

  let credentialsRequest = $derived.by(() => {
    // An anon session must at least be present.
    if (!session.accessToken) return undefined;
    return credentialsGet(api, session.accessToken, {
      id: session.claims?.userID ?? "",
    });
  });
</script>

{#await credentialsRequest}
  <NavAuth {...props} {onLogin} {onRegister} {onLogout} credentials="loading" />
{:then credentials}
  <NavAuth {...props} {onLogin} {onRegister} {onLogout} {credentials} />
{:catch _error}
  <NavAuth {...props} {onLogin} {onRegister} {onLogout} credentials="loading" />
{/await}
