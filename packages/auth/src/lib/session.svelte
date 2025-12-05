<script lang="ts">
  import { SESSION_STORAGE_KEY, type Session, type SessionContext, SessionSchema } from "$lib";

  import { type Snippet, setContext } from "svelte";

  import { isHttpStatusError } from "@a-novel-kit/nodelib-browser/http";
  import { retry } from "@a-novel-kit/nodelib-browser/utils";
  import {
    type AuthenticationApi,
    type Claims,
    type TokenCreateRequest,
    claimsGet,
    tokenCreate,
    tokenCreateAnon,
    tokenRefresh,
  } from "@a-novel/service-authentication-rest";
  import { StatusPage } from "@a-novel/uikit/ui/components";
  import { StatusPageInternalError } from "@a-novel/uikit/ui/components/statusPages";
  import { LoadingIcon } from "@a-novel/uikit/ui/icons";
  import { loadLocalStorage, saveLocalStorage } from "@a-novel/uikit/utils";

  import { getTranslate } from "@tolgee/svelte";

  interface Props {
    children: Snippet;
    api: AuthenticationApi;
  }

  let { children, api }: Props = $props();
  const { t } = getTranslate("auth:session");

  let claims = $state.raw<Claims>(),
    accessToken = $state<string>(""),
    refreshToken = $state<string>("");

  const anonSessionCreator = retry(tokenCreateAnon);

  /**
   * Fetch a new session using the refresh token.
   */
  async function refreshSession() {
    const refresher = retry(tokenRefresh, {
      // Do not retry if refresh token is invalid,
      condition: (err: unknown) => !isHttpStatusError(err, 403, 422),
    });

    return await refresher(api, { accessToken, refreshToken });
  }

  /**
   * Run a callback, and retry with new tokens on authentication failure.
   */
  function retrySession<R>(callback: (accessToken: string) => Promise<R>) {
    return async function wrapped(): Promise<R> {
      async function refreshOnCatch(err: unknown): Promise<R> {
        if (!isHttpStatusError(err, 401)) {
          // Rethrow.
          throw err;
        }

        // If the session is already anonymous, we can skip this step.
        if (!refreshToken) {
          throw err;
        }

        const refreshed = await refreshSession();
        // Retry with new access token.
        const result = await callback(refreshed.accessToken);

        // Wait for callback to succeed before updating tokens.
        accessToken = refreshed.accessToken;
        refreshToken = refreshed.refreshToken ?? "";
        return result;
      }

      async function logoutOnCatch(err: unknown): Promise<R> {
        if (!isHttpStatusError(err, 401, 403, 422)) {
          // Rethrow.
          throw err;
        }

        const newSession = await anonSessionCreator(api);
        // Retry with new access token.
        const result = await callback(newSession.accessToken);

        // Wait for callback to succeed before updating tokens.
        accessToken = newSession.accessToken;
        refreshToken = newSession.refreshToken ?? "";
        return result;
      }

      return (
        callback(accessToken)
          // First authentication error, try to refresh session.
          .catch(refreshOnCatch)
          // Then completely reset session on next authentication error.
          .catch(logoutOnCatch)
      );
    };
  }

  const claimsUpdater = retrySession((token) => claimsGet(api, token));

  /**
   * Authenticate with provided credentials.
   */
  async function authenticate(data: TokenCreateRequest) {
    const resp = await tokenCreate(api, data);
    accessToken = resp.accessToken;
    refreshToken = resp.refreshToken ?? "";
    claims = await claimsGet(api, accessToken);
  }

  /**
   * Init reloads the session from scratch.
   */
  async function initSession() {
    const session = loadLocalStorage(SESSION_STORAGE_KEY!, SessionSchema);

    if (!session || !session.accessToken || !session.refreshToken) {
      const newSession = await anonSessionCreator(api);
      accessToken = newSession.accessToken;
      refreshToken = newSession.refreshToken ?? "";
    } else {
      accessToken = session.accessToken;
      refreshToken = session.refreshToken;
    }

    // Refresh claims anyway on init. This also acts as a validation of the tokens.
    claims = await claimsUpdater();
  }

  setContext(SESSION_STORAGE_KEY, {
    get accessToken() {
      return accessToken;
    },
    get refreshToken() {
      return refreshToken;
    },
    get claims() {
      return claims;
    },

    async resetSession() {
      const newSession = await anonSessionCreator(api);
      accessToken = newSession.accessToken;
      refreshToken = newSession.refreshToken ?? "";
      claims = await claimsGet(api, accessToken);

      return { accessToken, refreshToken };
    },
    async refreshClaims() {
      claims = await claimsUpdater();
    },
    authenticate(data: TokenCreateRequest) {
      return authenticate(data);
    },
    retrySession,
  } satisfies SessionContext);

  // Sync session with storage.
  $effect(() => {
    if (!claims || !accessToken || !refreshToken) {
      return;
    }

    saveLocalStorage(SESSION_STORAGE_KEY, { accessToken, refreshToken, claims } satisfies Session);
  });

  const startSession = initSession();
</script>

{#await startSession}
  <StatusPage color="default">
    {#snippet icon()}
      <LoadingIcon />
    {/snippet}

    <span class="loader">{$t("page.loading.content", "Loading user session...")}</span>
  </StatusPage>
{:then _}
  {@render children()}
{:catch error}
  <StatusPageInternalError color="accent" {error} />
{/await}

<style>
  .loader {
    color: var(--color-gray-400);
    font-style: italic;
    font-size: var(--font-size-h6);
  }
</style>
