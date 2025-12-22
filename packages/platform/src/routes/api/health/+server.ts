import { authenticationApi } from "$lib";

import type { RequestHandler } from "./$types";

import { error, json } from "@sveltejs/kit";

type ServiceStatusSuccess = { status: "up"; response: any };
type ServiceStatusFailure = { status: "down"; error: any };

type ServiceStatus = ServiceStatusSuccess | ServiceStatusFailure;

export interface HealthCheckResponse {
  "auth-service": ServiceStatus;
}

export async function GET({ url }: Pick<Parameters<RequestHandler>[0], "url">): Promise<Response> {
  const failOnError = Boolean(url.searchParams.get("fail"));

  const status = {
    "auth-service": await authenticationApi
      .health()
      .then((response) => ({ status: "up", response }) satisfies ServiceStatus)
      .catch((err) => ({ status: "down", error: err }) satisfies ServiceStatus),
  } satisfies HealthCheckResponse;

  if (failOnError) {
    const failedMessages = Object.entries(status)
      .filter(([_, { status }]) => status === "down")
      .map(([name, status]) => `  - ${name}: ${(status as ServiceStatusFailure).error ?? "unknown"}`);

    if (failedMessages.length > 0) {
      throw error(503, "The following dependencies reported failure:\n" + failedMessages.join("\n"));
    }
  }

  return json(status);
}
