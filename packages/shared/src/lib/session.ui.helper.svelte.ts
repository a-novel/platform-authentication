import { getContext } from "svelte";

export const SESSION_SCREEN_CONTEXT_KEY = "a-novel-session-screen";

export type SessionScreen = "login" | "register" | "passwordReset";

export type SessionScreenContext = {
  setScreen: (screen?: SessionScreen) => void;
};

export function getSessionScreen(): SessionScreenContext {
  return getContext<SessionScreenContext>(SESSION_SCREEN_CONTEXT_KEY);
}
