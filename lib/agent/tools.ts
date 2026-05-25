/**
 * Agent tool definitions for the Harbor Eval orchestrator.
 *
 * Uses AI SDK v6 tool() with inputSchema (zod v4).
 * Delegates to lib/ai/ and lib/harbor/ pipeline modules.
 */

import { z } from "zod";
import { tool } from "ai";
import { analyzeWorkflow } from "@/lib/ai/workflow-intake";
import { mapWeaknesses, promoteCandidate } from "@/lib/ai/weakness-map";
import { runProbeVariants as probeVariants, batchProbe } from "@/lib/ai/probe-runner";
import { renderDecisionReport } from "@/lib/ai/decision-report";
import { scaffoldTask as scaffold } from "@/lib/ai/scaffold-generator";
import { generateFixtures as genFixtures } from "@/lib/ai/fixture-generator";
import { lintSpoilers as lint } from "@/lib/ai/spoiler-lint";
import { auditTrajectory as audit } from "@/lib/ai/trajectory-audit";
import type { LanguageModel } from "ai";

// Placeholder model for pipeline calls that ignore the model arg (mock mode)
const MOCK_MODEL = undefined as unknown as LanguageModel;

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
    return {
      path,
      content: null as string | null,
      message: `Artifact ${path} not found.`,
    };
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
    const report = await mapWeaknesses(workflowDescription, MOCK_MODEL);
    return {
      workflowDescription,
      candidates: report.candidates.map((c) => ({
        slug: c.slug,
        weaknessTitle: c.weaknessTitle,
        workflowFitScore: c.workflowFitScore,
        hypothesis: c.hypothesis,
        taxonomySlug: c.taxonomySlug,
      })),
      message: `Mapped ${report.candidates.length} weakness candidates.`,
    };
  },
});

export const intakeWorkflow = tool({
  description: "Promote a weakness candidate into the active weakness card for probing.",
  inputSchema: z.object({
    slug: z.string().describe("Weakness candidate slug to promote"),
    workflowDescription: z.string().default("").describe("Original workflow description"),
  }),
  execute: async ({ slug, workflowDescription }) => {
    const candidates = await analyzeWorkflow(workflowDescription, MOCK_MODEL);
    const card = promoteCandidate(slug, candidates);
    return {
      slug,
      weaknessTitle: card.weaknessTitle,
      promoted: true,
      message: `Promoted "${card.weaknessTitle}" to active weakness card.`,
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
    // Create minimal weakness cards for each slug
    const cards = slugs.map((slug: string) => ({
      weaknessTitle: slug.replace(/-/g, " "),
      domain: "instruction_following",
      deliverable: "Test deliverable",
      hypothesis: `Hypothesis for ${slug}`,
      badHeuristic: "Pattern match",
      authorityInvariant: "Ground truth",
      taxonomySlug: slug as never,
      workflowFitScore: 0.8,
      verifierStrategy: "deterministic",
    }));
    const summaries = await batchProbe(cards, MOCK_MODEL, trialsPerVariant);
    return {
      slugs,
      trialsPerVariant,
      summaries: summaries.map((s) => ({
        weaknessTitle: s.weaknessTitle,
        variants: s.variants,
        verdict: s.verdict,
      })),
      message: `Probed ${slugs.length} candidates.`,
    };
  },
});

export const runProbeVariantsT = tool({
  description: "Execute 5 pressure variants for the active weakness card against the target model.",
  inputSchema: z.object({
    weaknessSlug: z.string().describe("Active weakness slug"),
  }),
  execute: async ({ weaknessSlug }) => {
    const card = {
      weaknessTitle: weaknessSlug.replace(/-/g, " "),
      domain: "instruction_following",
      deliverable: "Test deliverable",
      hypothesis: `Hypothesis for ${weaknessSlug}`,
      badHeuristic: "Pattern match",
      authorityInvariant: "Ground truth",
      taxonomySlug: weaknessSlug as never,
      workflowFitScore: 0.8,
      verifierStrategy: "deterministic",
    };
    const summary = await probeVariants(card, MOCK_MODEL);
    return {
      weaknessSlug,
      variants: summary.variants,
      verdict: summary.verdict,
      message: `Probed variants for "${weaknessSlug}". Verdict: ${summary.verdict}.`,
    };
  },
});

export const renderProbeDecisionReportT = tool({
  description: "Summarize probe verdicts into a structured decision report.",
  inputSchema: z.object({}),
  execute: async () => {
    const entries = renderDecisionReport([]);
    return {
      entries,
      message: entries.length
        ? `Generated decision report with ${entries.length} entries.`
        : "No probe results to summarize yet.",
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
    const card = {
      weaknessTitle: taskTitle,
      domain: "instruction_following",
      deliverable: "Test deliverable",
      hypothesis: `Hypothesis for ${weaknessSlug}`,
      badHeuristic: "Pattern match",
      authorityInvariant: "Ground truth",
      taxonomySlug: weaknessSlug as never,
      workflowFitScore: 0.8,
      verifierStrategy: "deterministic",
    };
    const files = await scaffold(card, taskTitle);
    return {
      weaknessSlug,
      taskTitle,
      files: Array.from(files.keys()),
      message: `Scaffolded ${files.size} files for "${taskTitle}".`,
    };
  },
});

export const generateFixtures = tool({
  description: "Generate multimodal fixture files under environment/data for the active task.",
  inputSchema: z.object({
    count: z.number().default(5).describe("Number of fixtures to generate"),
  }),
  execute: async ({ count }) => {
    const card = {
      weaknessTitle: "Current weakness",
      domain: "instruction_following",
      deliverable: "Test deliverable",
      hypothesis: "Hypothesis",
      badHeuristic: "Pattern match",
      authorityInvariant: "Ground truth",
      taxonomySlug: "current-weakness" as never,
      workflowFitScore: 0.8,
      verifierStrategy: "deterministic",
    };
    const artifacts = await genFixtures(card, count);
    return {
      count,
      files: artifacts.map((a) => a.path),
      message: `Generated ${artifacts.length} fixtures.`,
    };
  },
});

// ─── Validation Tools ────────────────────────────────────────────────────────

export const lintSpoilers = tool({
  description: "Run line-anchored regex + heuristic spoiler scan over an artifact.",
  inputSchema: z.object({
    path: z.string().describe("Artifact path to lint"),
    content: z.string().default("").describe("Content to lint (if not reading from workspace)"),
  }),
  execute: async ({ path, content }) => {
    const findings = lint(content, path);
    return {
      path,
      findings: findings.map((f) => ({
        line: f.line,
        severity: f.severity,
        ruleId: f.ruleId,
        message: f.message,
      })),
      message: findings.length
        ? `Found ${findings.length} spoiler(s) in ${path}.`
        : `No spoilers found in ${path}.`,
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
    const trial = {
      idx: 0,
      reward: 0,
      status: "failed" as const,
      summary: `Trial ${trialId} failed`,
    };
    const result = await audit(trial, MOCK_MODEL);
    return {
      trialId,
      classification: result.classification,
      rationale: result.rationale,
      message: `Audited trial ${trialId}: ${result.classification}.`,
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
  run_probe_variants: runProbeVariantsT,
  render_probe_decision_report: renderProbeDecisionReportT,
  scaffold_task: scaffoldTask,
  generate_fixtures: generateFixtures,
  lint_spoilers: lintSpoilers,
  run_harbor_sweep: runHarborSweep,
  audit_trajectory: auditTrajectory,
  set_phase: setPhase,
  propose_iteration: proposeIteration,
};
