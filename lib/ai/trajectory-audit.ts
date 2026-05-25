import type { LanguageModel } from "ai";
import type { SweepTrial, AuditSummary } from "@/lib/types";

/**
 * Audit a single sweep trial trajectory using an auditor model.
 *
 * Currently returns realistic mock audit data. Replace with an LLM call
 * (e.g. `generateObject`) to produce real classifications later.
 */
export async function auditTrajectory(
  trialData: SweepTrial,
  _auditorModel: LanguageModel,
): Promise<AuditSummary> {
  void _auditorModel;

  const passed = trialData.status === "passed";
  const reward = trialData.reward;

  const classification = passed
    ? reward >= 0.9
      ? "clean_pass"
      : "partial_pass"
    : reward <= 0.1
      ? "complete_failure"
      : "partial_failure";

  const rationaleMap: Record<string, string> = {
    clean_pass:
      "The agent followed the intended reasoning path and produced the correct output without exploiting any shortcuts.",
    partial_pass:
      "The agent reached a roughly correct answer but used an unexpected approach. Review for potential heuristic exploitation.",
    partial_failure:
      "The agent made progress but failed at a critical reasoning step. The failure mode aligns with the targeted weakness.",
    complete_failure:
      "The agent did not produce meaningful output. May indicate the task is too difficult or the instructions are unclear.",
  };

  return {
    auditorModel: "mock-auditor-v1",
    classification,
    rationale: rationaleMap[classification] ?? "Unknown classification.",
    steps: [
      {
        id: `step_read_${trialData.idx}`,
        label: "Read instructions",
        kind: "model",
        excerpt: "Agent parsed the task instruction file.",
      },
      {
        id: `step_reason_${trialData.idx}`,
        label: "Reasoning attempt",
        kind: "model",
        excerpt: trialData.summary || "Agent attempted to solve the task.",
        reward: reward * 0.5,
      },
      {
        id: `step_verify_${trialData.idx}`,
        label: "Verifier check",
        kind: "verifier",
        reward,
        failed: !passed,
      },
    ],
  };
}
