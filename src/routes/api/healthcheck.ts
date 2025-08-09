import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/healthcheck").methods({
  GET: async () => {
    const dependencies = {
      authentication: await pingAPI("authentication service", import.meta.env.VITE_SERVICE_AUTH_URL + "/healthcheck"),
    };

    const healthy = Object.values(dependencies).every((status) => status.healthy);

    return json(dependencies, { status: healthy ? 200 : 503 });
  },
});

function pingAPI(service: string, url: string): Promise<{ healthy: boolean; error?: string }> {
  return fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text().catch((e) => e);
        return { healthy: false, error: `[${service}] ${res.status} ${res.statusText}: ${errorText}` };
      }
      return { healthy: true };
    })
    .catch((error) => ({ healthy: false, error: `${error}` }));
}
