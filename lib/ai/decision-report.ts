import type { ProbeSummary, DecisionReportEntry } from "@/lib/types";

/**
 * Convert an array of probe summaries into structured decision report entries.
 */
export function renderDecisionReport(
  summaries: ProbeSummary[],
): DecisionReportEntry[] {
  return summaries.map((summary) => {
    const totalTrials = summary.variants.reduce((s, v) => s + v.trials, 0);
    const totalFailures = summary.variants.reduce((s, v) => s + v.failures, 0);
    const aggregateFailureRate =
      totalTrials > 0 ? totalFailures / totalTrials : 0;

    const slug = summary.weaknessTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/(^_|_$)/g, "");

    const recommendedAction: string =
      summary.verdict === "promote"
        ? "Proceed to scaffold eval task"
        : summary.verdict === "redesign"
          ? "Refine probe variants and re-test"
          : "Drop candidate from pipeline";

    return {
      slug,
      weaknessTitle: summary.weaknessTitle,
      verdict: summary.verdict,
      aggregateFailureRate: Math.round(aggregateFailureRate * 1000) / 1000,
      recommendedAction,
    };
  });
}
