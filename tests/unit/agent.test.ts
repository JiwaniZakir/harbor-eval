import { describe, it, expect } from "vitest";
import { systemPrompt } from "@/lib/agent/system-prompt";
import { stageForPhase, stageContexts, productStages } from "@/lib/agent/stages";
import { buildEmptyWorkspace } from "@/lib/agent/seed-workspace";
import { agentTools } from "@/lib/agent/tools";

describe("system-prompt", () => {
  it("returns base prompt without workspace", () => {
    const prompt = systemPrompt();
    expect(prompt).toContain("Harbor Eval Orchestrator");
    expect(prompt).toContain("Operating rules:");
    expect(prompt).not.toContain("Current workspace state:");
  });

  it("injects workspace context when provided", () => {
    const ws = buildEmptyWorkspace();
    ws.projectName = "Test Project";
    ws.targetModel = "gpt-4o";
    const prompt = systemPrompt(ws);
    expect(prompt).toContain("Current workspace state:");
    expect(prompt).toContain("Test Project");
    expect(prompt).toContain("gpt-4o");
  });

  it("includes probe verdict when available", () => {
    const ws = buildEmptyWorkspace();
    ws.probeSummary = {
      weaknessTitle: "test",
      variants: [],
      verdict: "promote",
    };
    const prompt = systemPrompt(ws);
    expect(prompt).toContain("Probe verdict: promote");
  });
});

describe("stages", () => {
  it("has 5 product stages", () => {
    expect(productStages).toHaveLength(5);
  });

  it("maps all agent phases to stages", () => {
    const phases = [
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
    ] as const;
    for (const phase of phases) {
      const stage = stageForPhase(phase);
      expect(stage).toBeDefined();
    }
  });

  it("maps intake phase to intake stage", () => {
    expect(stageForPhase("intake")).toBe("intake");
  });

  it("maps probe phase to probe stage", () => {
    expect(stageForPhase("probe")).toBe("probe");
  });

  it("maps scaffold phase to build stage", () => {
    expect(stageForPhase("scaffold")).toBe("build");
  });

  it("maps sweep phase to validate stage", () => {
    expect(stageForPhase("sweep")).toBe("validate");
  });

  it("maps publish phase to publish stage", () => {
    expect(stageForPhase("publish")).toBe("publish");
  });

  it("each stage has chips", () => {
    for (const stage of productStages) {
      const ctx = stageContexts[stage.id];
      expect(ctx).toBeDefined();
      expect(ctx.chips.length).toBeGreaterThan(0);
    }
  });
});

describe("seed-workspace", () => {
  it("creates a valid workspace", () => {
    const ws = buildEmptyWorkspace();
    expect(ws.projectId).toBeTruthy();
    expect(ws.phase).toBe("intake");
    expect(ws.artifacts).toEqual({});
  });
});

describe("agent tools", () => {
  it("exports all 15 tools", () => {
    expect(Object.keys(agentTools)).toHaveLength(15);
  });

  it("each tool has description and execute", () => {
    for (const [name, t] of Object.entries(agentTools)) {
      expect(t.description, `${name} should have description`).toBeTruthy();
      expect(t.execute, `${name} should have execute`).toBeDefined();
    }
  });

  it("list_workspace returns empty artifacts", async () => {
    const result = (await agentTools.list_workspace.execute!(
      {},
      {
        toolCallId: "test",
        messages: [],
      },
    )) as { artifacts: string[] };
    expect(result.artifacts).toEqual([]);
  });

  it("write_artifact returns byte count", async () => {
    const result = (await agentTools.write_artifact.execute!(
      { path: "test.md", content: "hello" },
      { toolCallId: "test", messages: [] },
    )) as { bytes: number };
    expect(result.bytes).toBe(5);
  });

  it("map_workflow_weaknesses returns candidates", async () => {
    const result = (await agentTools.map_workflow_weaknesses.execute!(
      { workflowDescription: "A compliance workflow" },
      { toolCallId: "test", messages: [] },
    )) as { candidates: unknown[] };
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("run_harbor_sweep returns pass@3", async () => {
    const result = (await agentTools.run_harbor_sweep.execute!(
      { mode: "target", trials: 3 },
      { toolCallId: "test", messages: [] },
    )) as { passAt3: string };
    expect(result.passAt3).toBe("0.27");
  });

  it("set_phase returns the phase", async () => {
    const result = (await agentTools.set_phase.execute!(
      { phase: "probe" },
      { toolCallId: "test", messages: [] },
    )) as { phase: string };
    expect(result.phase).toBe("probe");
  });
});
