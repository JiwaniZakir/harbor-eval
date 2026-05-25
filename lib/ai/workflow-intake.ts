import type { LanguageModel } from "ai";
import type { WeaknessCandidate, FailureModeSlug } from "@/lib/types";

/**
 * Analyze a workflow description and return ranked weakness candidates.
 *
 * Currently returns hardcoded demo data. When ready, replace the body
 * with an LLM call using `generateObject` from the AI SDK.
 */
export async function analyzeWorkflow(
  description: string,
  _model: LanguageModel,
): Promise<WeaknessCandidate[]> {
  // TODO: call _model via `generateObject` with a structured schema
  void description;

  const now = Date.now();
  void now;

  const candidates: WeaknessCandidate[] = [
    candidate("authority_ambiguity", "Authority Ambiguity in Source Ranking", 0.85),
    candidate("false_recency", "False Recency Bias", 0.78),
    candidate("wrong_source", "Wrong Source Attribution", 0.72),
    candidate("phantom_join", "Phantom Join Between Datasets", 0.68),
    candidate("tie_breaking", "Arbitrary Tie-Breaking Under Ambiguity", 0.62),
    candidate("null_cascade", "Null Cascade in Multi-Step Reasoning", 0.55),
    candidate("provenance", "Lost Provenance in Summarization", 0.48),
  ];

  return candidates;
}

function candidate(
  slug: FailureModeSlug,
  title: string,
  fitScore: number,
): WeaknessCandidate {
  return {
    slug,
    status: "candidate",
    weaknessTitle: title,
    domain: "instruction_following",
    deliverable: `Eval task targeting ${slug.replace(/_/g, " ")}`,
    hypothesis: `The model relies on a shallow heuristic when handling ${slug.replace(/_/g, " ")} scenarios.`,
    badHeuristic: `Defaults to the first/most-prominent source instead of evaluating ${slug.replace(/_/g, " ")} correctly.`,
    authorityInvariant: `Output must remain correct regardless of ${slug.replace(/_/g, " ")} variations.`,
    taxonomySlug: slug,
    workflowFitScore: fitScore,
    verifierStrategy: "exact_match_with_tolerance",
  };
}
