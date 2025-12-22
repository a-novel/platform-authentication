export * from "./init";

const AGORA_TITLE = "Agora Storyverse";

export function pageTitle(...titles: string[]): string {
  return [...titles, AGORA_TITLE].join(" | ");
}
