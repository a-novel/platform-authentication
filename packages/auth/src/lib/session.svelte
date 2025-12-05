<script lang="ts">
  import { isHttpStatusError } from "@a-novel/nodelib-browser/http";
  import { retry } from "@a-novel/nodelib-browser/utils";
  import type { AuthenticationApi } from "@a-novel/service-authentication-rest";

  import { initSession } from "$lib/session.svelte.js";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    api: AuthenticationApi;
    sessionStorageKey?: string;
    sessionContextKey?: string;
  }
  let { children, ...props }: Props = $props();

  let session = initSession(props.api, props.sessionContextKey, props.sessionStorageKey);

  // If there is no access token available, retrieve one.
  $effect(() => {
    if (!session.accessToken) {
      retry(session.newAnonymous)();
    }
  });

  // If claims are missing, retrieve them. Not anonymous getSession do have claims.
  $effect(() => {
    if (session.accessToken && !session.claims) {
      const refresher = retry(session.syncClaims, { condition: (err: unknown) => !isHttpStatusError(err, 401) });
      refresher().catch(session.catchRefreshSessionOnSessionError);
    }
  });
</script>

<!-- Only render children if an access token is available. -->
{@render children()}
