import { generateObject } from "ai";
import { z } from "zod";
import type { LanguageModel } from "ai";
import type { SweepTrial, AuditSummary } from "@/lib/types";

const auditSchema = z.object({
  classification: z
    .enum(["clean_pass", "partial_pass", "partial_failure", "complete_failure"])
    .describe("How to classify this trial result"),
  rationale: z
    .string()
    .describe("Detailed explanation of why this classification was chosen"),
  steps: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      kind: z.enum(["model", "tool", "verifier", "notice"]),
      excerpt: z.string().optional(),
      reward: z.number().optional(),
      failed: z.boolean().optional(),
    }),
  ).describe("Reconstructed trajectory steps"),
});

/**
 * Audit a single sweep trial trajectory using an auditor model.
 *
 * Uses generateObject when a real model is provided, falls back to
 * mock audit data otherwise.
 */
export async function auditTrajectory(
  trialData: SweepTrial,
  auditorModel: LanguageModel,
): Promise<AuditSummary> {
  if (!auditorModel) {
    return mockAudit(trialData);
  }

  try {
    const { object } = await generateObject({
      model: auditorModel,
      schema: auditSchema,
      prompt: `You are an AI evaluation auditor. Analyze this trial trajectory and classify the result.

Trial data:
- Index: ${trialData.idx}
- Status: ${trialData.status}
- Reward: ${trialData.reward}
- Summary: ${trialData.summary}

Classifications:
- clean_pass: Correct output via intended reasoning
- partial_pass: Roughly correct but used unexpected approach
- partial_failure: Made progress but failed at a critical step
- complete_failure: No meaningful output produced

Provide a detailed rationale and reconstruct the likely trajectory steps.`,
    });

    return {
      auditorModel: "live-auditor",
      classification: object.classification,
      rationale: object.rationale,
      steps: object.steps,
    };
  } catch (error) {
    console.warn("[trajectory-audit] LLM audit failed, using mock data:", error);
    return mockAudit(trialData);
  }
}

function mockAudit(trialData: SweepTrial): AuditSummary {
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
