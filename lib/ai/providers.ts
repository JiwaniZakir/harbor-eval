import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

export type LlmProvider = "google" | "anthropic" | "openai";

export const modelRegistry = [
  { provider: "openai" as const, label: "GPT-4o", modelSlug: "gpt-4o" },
  { provider: "openai" as const, label: "GPT-4o Mini", modelSlug: "gpt-4o-mini" },
  { provider: "openai" as const, label: "o1-mini", modelSlug: "o1-mini" },
  {
    provider: "anthropic" as const,
    label: "Claude Sonnet 4",
    modelSlug: "claude-sonnet-4-20250514",
  },
  {
    provider: "anthropic" as const,
    label: "Claude Haiku 3.5",
    modelSlug: "claude-3-5-haiku-20241022",
  },
  {
    provider: "google" as const,
    label: "Gemini 2.0 Flash",
    modelSlug: "gemini-2.0-flash",
  },
  {
    provider: "google" as const,
    label: "Gemini 1.5 Pro",
    modelSlug: "gemini-1.5-pro",
  },
];

/** Get AI SDK model instance by provider + slug */
export function getAiModel(provider: LlmProvider, modelSlug: string) {
  switch (provider) {
    case "openai":
      return openai(modelSlug);
    case "anthropic":
      return anthropic(modelSlug);
    case "google":
      return google(modelSlug);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/** Resolve provider models for a project's target + auditor */
export function resolveAgentProviders(
  targetProvider: LlmProvider,
  targetModel: string,
  auditorModel?: string,
) {
  const target = getAiModel(targetProvider, targetModel);

  // Auditor defaults to cross-provider
  const auditorSlug =
    auditorModel || (targetProvider === "anthropic" ? "gpt-4o" : "claude-sonnet-4-20250514");
  const auditorProvider: LlmProvider =
    auditorSlug.includes("claude") || auditorSlug.includes("anthropic")
      ? "anthropic"
      : auditorSlug.includes("gemini")
        ? "google"
        : "openai";
  const auditor = getAiModel(auditorProvider, auditorSlug);

  return { target, auditor, targetProvider, auditorProvider };
}
