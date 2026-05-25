/**
 * Agent tool definitions for the Harbor Eval orchestrator.
 *
 * Uses AI SDK v6 tool() with inputSchema (zod v4).
 * Phase 2 will replace stub implementations with real AI pipeline calls.
 */

import { z } from "zod";
import { tool } from "ai";

// ─── Workspace Tools ─────────────────────────────────────────────────────────

export const listWorkspace = tool({
  description: "List all artifacts currently in the workspace.",
  inputSchema: z.object({}),
  execute: async () => {
    return { artifacts: [] as string[], message: "Workspace is empty." };
  },
});

export const readArtifact = tool({
  description: "Read the content of a workspace artifact by path.",
  inputSchema: z.object({
    path: z.string().describe("Artifact file path"),
  }),
  execute: async ({ path }) => {
    return { path, content: null as string | null, message: `Artifact ${path} not found.` };
  },
});

export const writeArtifact = tool({
  description: "Write or update an artifact in the workspace.",
  inputSchema: z.object({
    path: z.string().describe("Artifact file path"),
    content: z.string().describe("File content"),
  }),
  execute: async ({ path, content }) => {
    return { path, bytes: content.length, message: `Wrote ${path}` };
  },
});

// ─── Weakness Mapping Tools ──────────────────────────────────────────────────

export const mapWorkflowWeaknesses = tool({
  description: "Analyze a workflow description and produce 5-10 ranked weakness candidates.",
  inputSchema: z.object({
    workflowDescription: z
      .string()
      .describe("Natural language description of the workflow to evaluate"),
  }),
  execute: async ({ workflowDescription }) => {
    return {
      workflowDescription,
      candidates: [
        {
          slug: "temporal-ordering",
          title: "Temporal ordering under constraint propagation",
          severity: 0.85,
          reasoning: "Models frequently mis-order dependent steps when constraints cascade.",
        },
        {
          slug: "quantity-tracking",
          title: "Multi-unit quantity tracking across transforms",
          severity: 0.78,
          reasoning:
            "Numerical precision degrades across chained operations with unit conversions.",
        },
        {
          slug: "cross-reference-integrity",
          title: "Cross-reference integrity in multi-document workflows",
          severity: 0.72,
          reasoning: "Reference resolution fails when IDs span multiple artifact boundaries.",
        },
      ],
      message: `Mapped 3 weakness candidates for the workflow.`,
    };
  },
});

export const intakeWorkflow = tool({
  description: "Promote a weakness candidate into the active weakness card for probing.",
  inputSchema: z.object({
    slug: z.string().describe("Weakness candidate slug to promote"),
  }),
  execute: async ({ slug }) => {
    return {
      slug,
      promoted: true,
      message: `Promoted "${slug}" to active weakness card.`,
    };
  },
});

// ─── Probing Tools ───────────────────────────────────────────────────────────

export const batchProbeCandidates = tool({
  description: "Probe multiple approved weakness candidates against the target model.",
  inputSchema: z.object({
    slugs: z.array(z.string()).describe("Array of weakness slugs to probe"),
    trialsPerVariant: z.number().default(15).describe("Number of trials per variant"),
  }),
  execute: async ({ slugs, trialsPerVariant }) => {
    return {
      slugs,
      trialsPerVariant,
      summaries: slugs.map((slug: string) => ({
        weaknessTitle: slug,
        variants: [
          {
            variant: "direct",
            failureRate: 0.87,
            trials: trialsPerVariant,
            failures: Math.round(trialsPerVariant * 0.87),
          },
          {
            variant: "adversarial",
            failureRate: 0.93,
            trials: trialsPerVariant,
            failures: Math.round(trialsPerVariant * 0.93),
          },
        ],
        verdict: "promote" as const,
      })),
      message: `Probed ${slugs.length} candidates.`,
    };
  },
});

export const runProbeVariants = tool({
  description: "Execute 5 pressure variants for the active weakness card against the target model.",
  inputSchema: z.object({
    weaknessSlug: z.string().describe("Active weakness slug"),
  }),
  execute: async ({ weaknessSlug }) => {
    return {
      weaknessSlug,
      variants: [
        { variant: "baseline", failureRate: 0.6, trials: 15, failures: 9 },
        { variant: "adversarial", failureRate: 0.87, trials: 15, failures: 13 },
        { variant: "edge-case", failureRate: 0.73, trials: 15, failures: 11 },
        { variant: "multi-step", failureRate: 0.93, trials: 15, failures: 14 },
        { variant: "distraction", failureRate: 0.8, trials: 15, failures: 12 },
      ],
      verdict: "promote",
      message: `Probed 5 variants for "${weaknessSlug}". Verdict: promote.`,
    };
  },
});

export const renderProbeDecisionReport = tool({
  description: "Summarize probe verdicts into a structured decision report.",
  inputSchema: z.object({}),
  execute: async () => {
    return {
      entries: [] as Array<{ slug: string; verdict: string }>,
      message: "No probe results to summarize yet.",
    };
  },
});

// ─── Build Tools ─────────────────────────────────────────────────────────────

export const scaffoldTask = tool({
  description:
    "Generate the Harbor task pack skeleton: instruction.md, task.toml, Dockerfile, solve.sh, tests.",
  inputSchema: z.object({
    weaknessSlug: z.string().describe("Weakness to scaffold a task for"),
    taskTitle: z.string().describe("Human-readable task title"),
  }),
  execute: async ({ weaknessSlug, taskTitle }) => {
    return {
      weaknessSlug,
      taskTitle,
      files: ["instruction.md", "task.toml", "Dockerfile", "solve.sh", "tests/test_verifier.py"],
      message: `Scaffolded task pack for "${taskTitle}".`,
    };
  },
});

export const generateFixtures = tool({
  description: "Generate multimodal fixture files under environment/data for the active task.",
  inputSchema: z.object({
    count: z.number().default(5).describe("Number of fixtures to generate"),
  }),
  execute: async ({ count }) => {
    return {
      count,
      files: Array.from({ length: count }, (_, i) => `fixture_${i + 1}.json`),
      message: `Generated ${count} fixtures.`,
    };
  },
});

// ─── Validation Tools ────────────────────────────────────────────────────────

export const lintSpoilers = tool({
  description: "Run line-anchored regex + heuristic spoiler scan over an artifact.",
  inputSchema: z.object({
    path: z.string().describe("Artifact path to lint"),
  }),
  execute: async ({ path }) => {
    return {
      path,
      findings: [] as Array<{ line: number; message: string }>,
      message: `No spoilers found in ${path}.`,
    };
  },
});

export const runHarborSweep = tool({
  description: "Run oracle, nop, or target sweep trials. Target uses pass@3.",
  inputSchema: z.object({
    mode: z.enum(["oracle", "nop", "target"]).describe("Sweep mode"),
    trials: z.number().default(3).describe("Number of trials"),
  }),
  execute: async ({ mode, trials }) => {
    const results = {
      oracle: { passAt3: "1.00", avgReward: 1.0 },
      nop: { passAt3: "0.00", avgReward: 0.0 },
      target: { passAt3: "0.27", avgReward: 0.23 },
    };
    const r = results[mode];
    return {
      mode,
      trials,
      passAt3: r.passAt3,
      avgReward: r.avgReward,
      message: `${mode} sweep: pass@3 = ${r.passAt3}`,
    };
  },
});

export const auditTrajectory = tool({
  description: "Classify a failing trajectory with a non-target auditor model.",
  inputSchema: z.object({
    trialId: z.string().describe("Trial ID to audit"),
  }),
  execute: async ({ trialId }) => {
    return {
      trialId,
      classification: "genuine_failure",
      rationale:
        "The model failed to maintain cross-reference integrity across document boundaries.",
      message: `Audited trial ${trialId}: genuine_failure.`,
    };
  },
});

// ─── Phase Management ────────────────────────────────────────────────────────

export const setPhase = tool({
  description: "Declare the active pipeline phase.",
  inputSchema: z.object({
    phase: z
      .enum([
        "intake",
        "weakness",
        "probe",
        "decision",
        "scaffold",
        "fixtures",
        "verifier",
        "sweep",
        "audit",
        "iteration",
        "publish",
      ])
      .describe("Pipeline phase to transition to"),
  }),
  execute: async ({ phase }) => {
    return { phase, message: `Phase set to "${phase}".` };
  },
});

export const proposeIteration = tool({
  description: "Produce an iteration diff with summary and rationale for improving the task.",
  inputSchema: z.object({
    summary: z.string().describe("What changed"),
    rationale: z.string().describe("Why this iteration helps"),
  }),
  execute: async ({ summary, rationale }) => {
    return {
      summary,
      rationale,
      accepted: false,
      message: "Iteration proposed. Awaiting approval.",
    };
  },
});

// ─── All tools bundled ───────────────────────────────────────────────────────

export const agentTools = {
  list_workspace: listWorkspace,
  read_artifact: readArtifact,
  write_artifact: writeArtifact,
  map_workflow_weaknesses: mapWorkflowWeaknesses,
  intake_workflow: intakeWorkflow,
  batch_probe_candidates: batchProbeCandidates,
  run_probe_variants: runProbeVariants,
  render_probe_decision_report: renderProbeDecisionReport,
  scaffold_task: scaffoldTask,
  generate_fixtures: generateFixtures,
  lint_spoilers: lintSpoilers,
  run_harbor_sweep: runHarborSweep,
  audit_trajectory: auditTrajectory,
  set_phase: setPhase,
  propose_iteration: proposeIteration,
};
