import { isHttpStatusError } from "@a-novel/nodelib-browser/http";
import { retry } from "@a-novel/nodelib-browser/utils";
import {
  AuthenticationApi,
  ClaimsSchema,
  type Claims,
  tokenCreateAnon,
  claimsGet,
  tokenRefresh,
} from "@a-novel/service-authentication-rest";
import { loadLocalStorage, saveLocalStorage } from "@a-novel/uikit/utils";

import { getContext, setContext } from "svelte";
import { z } from "zod";

// =====================================================================================================================
// CONSTANTS
// =====================================================================================================================

export const SESSION_STORAGE_KEY = "a-novel-getSession";

// =====================================================================================================================
// TYPES
// =====================================================================================================================

export const SessionSchema = z.object({
  claims: ClaimsSchema.optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

// =====================================================================================================================
// CONTEXT
// =====================================================================================================================

export class SessionStore {
  private readonly _storageKey: string;
  private _session: Session | null;

  private readonly _claims: Claims | undefined;
  private readonly _accessToken: string;
  private readonly _refreshToken: string;

  private readonly _api: AuthenticationApi;

  constructor(
    api: AuthenticationApi,
    storageKey: string = SESSION_STORAGE_KEY,
    initial: Session | null = loadLocalStorage(storageKey, SessionSchema)
  ) {
    this._storageKey = storageKey;
    this._session = $state.raw(initial);

    this._claims = $derived(this._session?.claims);
    this._accessToken = $derived(this._session?.accessToken ?? "");
    this._refreshToken = $derived(this._session?.refreshToken ?? "");

    this._api = api;

    this.merge = this.merge.bind(this);
    this.clear = this.clear.bind(this);
    this.catchLogoutOnSessionError = this.catchLogoutOnSessionError.bind(this);
    this.catchRefreshSessionOnSessionError = this.catchRefreshSessionOnSessionError.bind(this);
    this.newAnonymous = this.newAnonymous.bind(this);
    this.syncClaims = this.syncClaims.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  /**
   * Create a new session, and save it to the current context. If a session store is already present, it is returned
   * instead.
   */
  static Init(
    api: AuthenticationApi,
    contextKey: string = SESSION_STORAGE_KEY,
    storageKey: string = contextKey,
    initial?: Session | null
  ): SessionStore {
    const existingSession = (getContext(contextKey) as () => SessionStore | null)?.();
    if (existingSession) {
      return existingSession;
    }

    // Attempt to retrieve last getSession from local storage.
    const store = new SessionStore(api, storageKey, initial);
    setContext(contextKey, () => store);
    return store;
  }

  /**
   * Retrieve the current session store from context.
   */
  static Get(contextKey: string = SESSION_STORAGE_KEY): SessionStore {
    const closure = getContext(contextKey) as () => SessionStore;
    if (!closure) {
      throw new Error(`No session found in 'context.${contextKey}'`);
    }
    return closure();
  }

  get current() {
    return this._session;
  }
  set current(value) {
    this._session = value;
    saveLocalStorage(this._storageKey, value);
  }

  get claims() {
    return this._claims;
  }
  set claims(value) {
    this.merge({ claims: value });
  }

  get accessToken() {
    return this._accessToken;
  }
  set accessToken(value) {
    this.merge({ accessToken: value });
  }

  get refreshToken() {
    return this._refreshToken;
  }
  set refreshToken(value) {
    this.merge({ refreshToken: value });
  }

  /**
   * Perform a partial update of the getSession.
   */
  merge(value: Partial<Session>) {
    this.current = {
      ...this.current,
      ...value,
    };
  }

  /**
   * Clears the current session.
   */
  clear() {
    this.current = null;
  }

  // ===================================================================================================================
  // HANDLERS
  // ===================================================================================================================

  /**
   * Invalidate the current getSession on unauthorized errors (401).
   */
  catchLogoutOnSessionError(error: unknown, rethrow?: boolean) {
    const shouldLogout = isHttpStatusError(error, 401);

    if (shouldLogout) {
      this.clear();
    }

    if (rethrow || !shouldLogout) {
      throw error;
    }
  }

  /**
   * Attempt a getSession refresh on 401. If the refresh fails, the user is logged out.
   */
  async catchRefreshSessionOnSessionError(error: unknown, rethrow?: boolean) {
    const shouldRefresh = isHttpStatusError(error, 401);

    if (shouldRefresh) {
      await retry(this.refresh)().catch(this.clear);
    }

    if (rethrow || !shouldRefresh) {
      throw error;
    }
  }

  // ===================================================================================================================
  // APIS
  // ===================================================================================================================

  /**
   * Generate a new anonymous session.
   */
  async newAnonymous() {
    await tokenCreateAnon(this._api).then((data) => {
      // Reset session state.
      this.current = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    });
  }

  /**
   * Refresh the session claims.
   */
  async syncClaims() {
    await claimsGet(this._api, this.current?.accessToken ?? "").then((data) => {
      // Update session claims.
      this.merge({ claims: data });
    });
  }

  /**
   * Refresh the session token.
   */
  async refresh() {
    await tokenRefresh(this._api, {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    }).then((data) => {
      // Update session tokens.
      this.current = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    });
  }
}

export const initSession = SessionStore.Init;

export const getSession = SessionStore.Get;
