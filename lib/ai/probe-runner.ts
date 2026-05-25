import type { LanguageModel } from "ai";
import type { WeaknessCard, ProbeSummary } from "@/lib/types";

/**
 * Run probe variants against a target model for a single weakness.
 *
 * Currently returns simulated data with realistic failure rates.
 * Replace with actual LLM probing calls later.
 */
export async function runProbeVariants(
  weakness: WeaknessCard,
  _targetModel: LanguageModel,
  trials: number = 10,
): Promise<ProbeSummary> {
  void _targetModel;

  const variantLabels = [
    "baseline",
    "paraphrased",
    "adversarial_prefix",
    "reversed_order",
    "distractor_injected",
  ];

  const variants = variantLabels.map((variant) => {
    const baseRate = 0.15 + Math.random() * 0.45;
    const failures = Math.round(baseRate * trials);
    return {
      variant,
      failureRate: failures / trials,
      trials,
      failures,
    };
  });

  const avgFailureRate =
    variants.reduce((sum, v) => sum + v.failureRate, 0) / variants.length;

  const verdict: ProbeSummary["verdict"] =
    avgFailureRate >= 0.4
      ? "promote"
      : avgFailureRate >= 0.2
        ? "redesign"
        : "reject";

  return {
    weaknessTitle: weakness.weaknessTitle,
    variants,
    verdict,
  };
}

/**
 * Batch-probe multiple weaknesses in parallel.
 */
export async function batchProbe(
  weaknesses: WeaknessCard[],
  targetModel: LanguageModel,
  trials: number = 10,
): Promise<ProbeSummary[]> {
  return Promise.all(
    weaknesses.map((w) => runProbeVariants(w, targetModel, trials)),
  );
}
