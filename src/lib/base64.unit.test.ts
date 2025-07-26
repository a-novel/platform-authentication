import { decodeBase64URL } from "~/lib/base64";

import { describe, expect, it } from "vitest";

describe("base64 url value", () => {
  const message = "hello world";

  it("decodes url encoding with padding", () => {
    const encoded = "aGVsbG8gd29ybGQ=";
    expect(decodeBase64URL(encoded)).toBe(message);
  });

  it("decodes url encoding without padding", () => {
    const encoded = "aGVsbG8gd29ybGQ";
    expect(decodeBase64URL(encoded)).toBe(message);
  });
});
