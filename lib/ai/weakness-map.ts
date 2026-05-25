import type { LanguageModel } from "ai";
import type {
  WeaknessCandidate,
  WeaknessCard,
  WeaknessReport,
} from "@/lib/types";
import { analyzeWorkflow } from "./workflow-intake";

/**
 * Map a workflow description to the weakness taxonomy, returning a full
 * WeaknessReport with ranked candidates.
 *
 * Currently delegates to `analyzeWorkflow` for demo data.
 * Replace internals with an LLM taxonomy-mapping call later.
 */
export async function mapWeaknesses(
  workflowDescription: string,
  model: LanguageModel,
): Promise<WeaknessReport> {
  const candidates = await analyzeWorkflow(workflowDescription, model);

  return {
    workflowDescription,
    candidates,
    createdAt: Date.now(),
  };
}

/**
 * Promote a candidate by slug, returning it as a finalized WeaknessCard.
 * Throws if the slug is not found in the candidates list.
 */
export function promoteCandidate(
  slug: string,
  candidates: WeaknessCandidate[],
): WeaknessCard {
  const found = candidates.find((c) => c.slug === slug);
  if (!found) {
    throw new Error(`Candidate with slug "${slug}" not found`);
  }

  const {
    weaknessTitle,
    domain,
    deliverable,
    hypothesis,
    badHeuristic,
    authorityInvariant,
    taxonomySlug,
    workflowFitScore,
    verifierStrategy,
  } = found;

  return {
    weaknessTitle,
    domain,
    deliverable,
    hypothesis,
    badHeuristic,
    authorityInvariant,
    taxonomySlug,
    workflowFitScore,
    verifierStrategy,
  };
}
