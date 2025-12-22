import { describe, expect, it } from "vitest";

describe("/api/ping", () => {
  it("returns status ok with timestamp", async () => {
    const { GET } = await import("./+server");
    const response = await GET();
    const data = await response.text();

    expect(data).toBe("pong");
  });

  it("returns status 200", async () => {
    const { GET } = await import("./+server");
    const response = await GET();

    expect(response.status).toBe(200);
  });
});
