import { generateObject } from "ai";
import { z } from "zod";
import type { LanguageModel } from "ai";
import type { WeaknessCandidate, FailureModeSlug } from "@/lib/types";

const TAXONOMY_SLUGS: FailureModeSlug[] = [
  "authority_ambiguity",
  "false_recency",
  "wrong_source",
  "phantom_join",
  "tie_breaking",
  "null_cascade",
  "provenance",
  "lifecycle",
];

const candidateSchema = z.object({
  candidates: z.array(
    z.object({
      slug: z.string().describe("Snake_case identifier for this weakness"),
      weaknessTitle: z.string().describe("Human-readable title"),
      domain: z.string().describe("Evaluation domain, e.g. instruction_following"),
      deliverable: z.string().describe("What the eval task should produce"),
      hypothesis: z.string().describe("Why the model might fail here"),
      badHeuristic: z.string().describe("Shallow heuristic the model might use"),
      authorityInvariant: z.string().describe("Ground truth invariant"),
      workflowFitScore: z.number().min(0).max(1).describe("How well this fits the workflow (0-1)"),
      verifierStrategy: z.string().describe("How to verify correctness"),
    }),
  ),
});

/**
 * Analyze a workflow description and return ranked weakness candidates.
 *
 * Uses generateObject when a real model is provided, falls back to
 * hardcoded demo data when the model is unavailable.
 */
export async function analyzeWorkflow(
  description: string,
  model: LanguageModel,
): Promise<WeaknessCandidate[]> {
  // If model is the MOCK_MODEL sentinel, return demo data
  if (!model) {
    return mockCandidates();
  }

  try {
    const { object } = await generateObject({
      model,
      schema: candidateSchema,
      prompt: `You are an AI evaluation expert. Analyze this workflow and identify 5-8 weakness candidates where an LLM agent might fail due to shallow heuristics.

For each weakness:
- slug: use one of these taxonomy slugs if applicable: ${TAXONOMY_SLUGS.join(", ")}. Otherwise create a new snake_case slug.
- weaknessTitle: a clear, specific title
- domain: the evaluation domain (e.g. "instruction_following", "reasoning", "coding")
- deliverable: what the eval task should produce to test this
- hypothesis: why the model might fail
- badHeuristic: the shortcut the model might take
- authorityInvariant: the ground truth that must hold
- workflowFitScore: 0-1 how relevant this weakness is to the workflow
- verifierStrategy: how to check correctness (e.g. "exact_match", "semantic_similarity", "code_execution")

Sort by workflowFitScore descending.

Workflow description:
${description}`,
    });

    return object.candidates.map((c) => ({
      ...c,
      slug: c.slug as FailureModeSlug,
      status: "candidate" as const,
      taxonomySlug: (TAXONOMY_SLUGS.includes(c.slug as FailureModeSlug)
        ? c.slug
        : "authority_ambiguity") as FailureModeSlug,
    }));
  } catch (error) {
    console.warn("[workflow-intake] LLM call failed, using mock data:", error);
    return mockCandidates();
  }
}

function mockCandidates(): WeaknessCandidate[] {
  return [
    candidate("authority_ambiguity", "Authority Ambiguity in Source Ranking", 0.85),
    candidate("false_recency", "False Recency Bias", 0.78),
    candidate("wrong_source", "Wrong Source Attribution", 0.72),
    candidate("phantom_join", "Phantom Join Between Datasets", 0.68),
    candidate("tie_breaking", "Arbitrary Tie-Breaking Under Ambiguity", 0.62),
    candidate("null_cascade", "Null Cascade in Multi-Step Reasoning", 0.55),
    candidate("provenance", "Lost Provenance in Summarization", 0.48),
  ];
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
