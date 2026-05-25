import { describe, it, expect } from "vitest";
import { lintSpoilers } from "@/lib/ai/spoiler-lint";
import { renderDecisionReport } from "@/lib/ai/decision-report";
import { scaffoldTask } from "@/lib/ai/scaffold-generator";
import { generateFixtures } from "@/lib/ai/fixture-generator";
import { analyzeWorkflow } from "@/lib/ai/workflow-intake";
import { mapWeaknesses, promoteCandidate } from "@/lib/ai/weakness-map";
import { runProbeVariants, batchProbe } from "@/lib/ai/probe-runner";
import { auditTrajectory } from "@/lib/ai/trajectory-audit";
import { generateTaskToml, parseTaskToml } from "@/lib/harbor/task-toml";
import { validateTaskPack } from "@/lib/harbor/validate-task";
import { toHarborFormat } from "@/lib/harbor/adapter";
import { materializeTaskPack } from "@/lib/harbor/materialize";
import type { LanguageModel } from "ai";
import type { WeaknessCard, ProbeSummary } from "@/lib/types";

const MOCK = undefined as unknown as LanguageModel;

const MOCK_CARD: WeaknessCard = {
  weaknessTitle: "Temporal ordering under constraints",
  domain: "instruction_following",
  deliverable: "Compliance workbook",
  hypothesis: "Models mis-order dependent steps",
  badHeuristic: "Pattern match on step order",
  authorityInvariant: "Ground truth ordering",
  taxonomySlug: "temporal-ordering" as never,
  workflowFitScore: 0.85,
  verifierStrategy: "deterministic",
};

describe("spoiler-lint (real logic)", () => {
  it("detects answer assignment patterns", () => {
    const findings = lintSpoilers('answer = 42\nexpected_output = "hello"\n', "instruction.md");
    expect(findings.length).toBeGreaterThan(0);
  });

  it("detects oracle hint patterns", () => {
    const findings = lintSpoilers('oracle = "the correct value"\nhint: look at row 3\n', "test.md");
    expect(findings.length).toBeGreaterThan(0);
  });

  it("returns empty for clean content", () => {
    const findings = lintSpoilers(
      "Follow these steps to process the quarterly report.\n1. Open the template.\n2. Fill in the data.",
      "instruction.md",
    );
    expect(findings).toHaveLength(0);
  });
});

describe("workflow-intake", () => {
  it("returns weakness candidates", async () => {
    const candidates = await analyzeWorkflow("A compliance audit workflow", MOCK);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].slug).toBeTruthy();
    expect(candidates[0].weaknessTitle).toBeTruthy();
  });
});

describe("weakness-map", () => {
  it("maps weaknesses from workflow description", async () => {
    const report = await mapWeaknesses("A compliance workflow", MOCK);
    expect(report.candidates.length).toBeGreaterThan(0);
    expect(report.workflowDescription).toBe("A compliance workflow");
  });

  it("promotes a candidate to card", async () => {
    const candidates = await analyzeWorkflow("test", MOCK);
    const card = promoteCandidate(candidates[0].slug, candidates);
    expect(card.weaknessTitle).toBeTruthy();
    expect(card.domain).toBeTruthy();
  });
});

describe("probe-runner", () => {
  it("runs probe variants", async () => {
    const summary = await runProbeVariants(MOCK_CARD, MOCK);
    expect(summary.variants.length).toBeGreaterThan(0);
    expect(["promote", "redesign", "reject"]).toContain(summary.verdict);
  });

  it("batch probes multiple cards", async () => {
    const summaries = await batchProbe([MOCK_CARD, MOCK_CARD], MOCK);
    expect(summaries).toHaveLength(2);
  });
});

describe("decision-report", () => {
  it("generates entries from probe summaries", () => {
    const summaries: ProbeSummary[] = [
      {
        weaknessTitle: "test",
        variants: [{ variant: "base", failureRate: 0.8, trials: 10, failures: 8 }],
        verdict: "promote",
      },
    ];
    const entries = renderDecisionReport(summaries);
    expect(entries).toHaveLength(1);
    expect(entries[0].verdict).toBe("promote");
  });

  it("returns empty for no summaries", () => {
    expect(renderDecisionReport([])).toHaveLength(0);
  });
});

describe("scaffold-generator", () => {
  it("generates task pack files", async () => {
    const files = await scaffoldTask(MOCK_CARD, "Test Task");
    expect(files.size).toBeGreaterThan(0);
    expect(files.has("instruction.md")).toBe(true);
    expect(files.has("task.toml")).toBe(true);
  });
});

describe("fixture-generator", () => {
  it("generates fixture artifacts", async () => {
    const artifacts = await generateFixtures(MOCK_CARD, 3);
    expect(artifacts).toHaveLength(3);
    expect(artifacts[0].path).toBeTruthy();
    expect(artifacts[0].kind).toBeTruthy();
  });
});

describe("trajectory-audit", () => {
  it("audits a trial", async () => {
    const result = await auditTrajectory(
      { idx: 0, reward: 0, status: "failed", summary: "Failed" },
      MOCK,
    );
    expect(result.classification).toBeTruthy();
    expect(result.rationale).toBeTruthy();
  });
});

describe("harbor/task-toml", () => {
  it("generates and parses toml", () => {
    const toml = generateTaskToml({
      slug: "test-task",
      title: "Test Task",
      project: "test-project",
      domain: "instruction_following",
      version: "1.0.0",
      scoringStrategy: "deterministic",
      passThreshold: 0.8,
      timeoutSeconds: 300,
      maxTokens: 4096,
    });
    expect(toml).toContain("test-task");
    const parsed = parseTaskToml(toml);
    expect(parsed.slug).toBe("test-task");
    expect(parsed.title).toBe("Test Task");
  });
});

describe("harbor/validate-task", () => {
  it("validates a complete task pack", () => {
    const pack = toHarborFormat(
      new Map([
        ["instruction.md", "# Instructions\nProcess the compliance report."],
        ["task.toml", '[task]\nslug = "test"\ntitle = "Test"'],
        ["Dockerfile", "FROM python:3.12"],
        ["solve.sh", "#!/bin/bash\necho done"],
        ["tests/test_verifier.py", "def test(): pass"],
      ]),
      {
        projectName: "test",
        taskSlug: "test-task",
        version: "1.0.0",
        timeoutSeconds: 300,
        maxTokens: 4096,
      },
    );
    const result = validateTaskPack(pack);
    expect(result.valid).toBe(true);
    expect(result.issues.filter((i) => i.level === "error")).toHaveLength(0);
  });
});

describe("harbor/materialize", () => {
  it("materializes a task pack to files", () => {
    const pack = toHarborFormat(new Map([["instruction.md", "# Test"]]), {
      projectName: "test",
      taskSlug: "test-task",
      version: "1.0.0",
      timeoutSeconds: 300,
      maxTokens: 4096,
    });
    const files = materializeTaskPack(pack);
    expect(files.size).toBeGreaterThan(0);
  });
});
