import { afterEach, vi } from "vitest";

afterEach(() => {
  if (global.window) {
    localStorage.clear(); // Clear if available.
  }

  vi.clearAllMocks();
});
