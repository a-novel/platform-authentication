import { describe, expect, it, vi } from "vitest";

import { AuthenticationApi } from "@a-novel/service-authentication-rest";

vi.mock("$lib", async () => {
  const { AuthenticationApi } = await import("@a-novel/service-authentication-rest");
  return {
    authenticationApi: new AuthenticationApi("http://auth-api.local"),
  };
});

function createMockUrl(params?: Record<string, string>) {
  const url = new URL("http://localhost/api/health");
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return url;
}

describe("/api/health", () => {
  it("returns auth-service status up when health check succeeds", async () => {
    const mockHealthResponse = {
      database: { status: "up" as const },
      cache: { status: "up" as const },
    };

    const healthSpy = vi.spyOn(AuthenticationApi.prototype, "health").mockResolvedValueOnce(mockHealthResponse);

    const { GET } = await import("./+server");
    const response = await GET({ url: createMockUrl() });
    const data = await response.json();

    expect(data).toEqual({
      "auth-service": {
        status: "up",
        response: mockHealthResponse,
      },
    });

    healthSpy.mockRestore();
  });

  it("returns auth-service status down when health check fails with Error", async () => {
    const healthSpy = vi
      .spyOn(AuthenticationApi.prototype, "health")
      .mockRejectedValueOnce(new Error("Connection refused"));

    const { GET } = await import("./+server");
    const response = await GET({ url: createMockUrl() });
    const data = await response.json();

    // Error objects serialize to {} in JSON
    expect(data).toEqual({
      "auth-service": {
        status: "down",
        error: {},
      },
    });

    healthSpy.mockRestore();
  });

  it("returns auth-service status down when health check fails with non-Error", async () => {
    const healthSpy = vi.spyOn(AuthenticationApi.prototype, "health").mockRejectedValueOnce("Network error");

    const { GET } = await import("./+server");
    const response = await GET({ url: createMockUrl() });
    const data = await response.json();

    expect(data).toEqual({
      "auth-service": {
        status: "down",
        error: "Network error",
      },
    });

    healthSpy.mockRestore();
  });

  it("returns auth-service with partial dependency failures", async () => {
    const mockHealthResponse = {
      database: { status: "up" as const },
      cache: { status: "down" as const, err: "Cache unavailable" },
    };

    const healthSpy = vi.spyOn(AuthenticationApi.prototype, "health").mockResolvedValueOnce(mockHealthResponse);

    const { GET } = await import("./+server");
    const response = await GET({ url: createMockUrl() });
    const data = await response.json();

    expect(data).toEqual({
      "auth-service": {
        status: "up",
        response: mockHealthResponse,
      },
    });

    healthSpy.mockRestore();
  });

  describe("with fail param", () => {
    it("returns 200 when all dependencies are up and fail param is set", async () => {
      const mockHealthResponse = {
        database: { status: "up" as const },
        cache: { status: "up" as const },
      };

      const healthSpy = vi.spyOn(AuthenticationApi.prototype, "health").mockResolvedValueOnce(mockHealthResponse);

      const { GET } = await import("./+server");
      const response = await GET({ url: createMockUrl({ fail: "true" }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        "auth-service": {
          status: "up",
          response: mockHealthResponse,
        },
      });

      healthSpy.mockRestore();
    });

    it("throws 503 when a dependency is down and fail param is set", async () => {
      const healthSpy = vi
        .spyOn(AuthenticationApi.prototype, "health")
        .mockRejectedValueOnce(new Error("Connection refused"));

      const { GET } = await import("./+server");

      expect(GET({ url: createMockUrl({ fail: "true" }) })).rejects.toMatchObject({
        status: 503,
      });

      healthSpy.mockRestore();
    });
  });
});
