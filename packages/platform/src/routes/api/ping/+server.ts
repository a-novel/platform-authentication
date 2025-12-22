import { text } from "@sveltejs/kit";

export async function GET(): Promise<Response> {
  return text("pong");
}
