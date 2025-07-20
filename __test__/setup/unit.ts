import { init as initAuthAPI } from "@a-novel/connector-authentication";

import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

export const server = setupServer();

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  server.resetHandlers();
});

beforeAll(() => {
  initAuthAPI({ baseURL: "http://localhost:4011" });
  server.listen({
    onUnhandledRequest: "error",
  });

  // Hide network errors in the console.
  vi.spyOn(console, "error").mockImplementation(vi.fn());
});

afterAll(() => server.close());
