import { load } from "./+page.server";

import { describe, expect, it } from "vitest";

describe("/+page.server", () => {
  it("redirects to /manage-account with 307 status", () => {
    expect(() => load()).toThrowError(
      expect.objectContaining({
        status: 307,
        location: "/manage-account",
      })
    );
  });
});
