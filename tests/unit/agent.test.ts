import { describe, it, expect } from "vitest";
import { systemPrompt } from "@/lib/agent/system-prompt";
import { stageForPhase, stageContexts, productStages } from "@/lib/agent/stages";
import { buildEmptyWorkspace } from "@/lib/agent/seed-workspace";
import { createAgentTools, type ToolContext } from "@/lib/agent/tools";
import type { AgentEvent, Artifact } from "@/lib/types";

/** Create a test tool context with an empty workspace and a no-op event handler. */
function testContext(): ToolContext & { events: AgentEvent[] } {
  const events: AgentEvent[] = [];
  return {
    workspace: new Map<string, Artifact>(),
    onEvent: (e: AgentEvent) => events.push(e),
    events,
  };
}

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
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    expect(Object.keys(tools)).toHaveLength(15);
  });

  it("each tool has description and execute", () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    for (const [name, t] of Object.entries(tools)) {
      expect(t.description, `${name} should have description`).toBeTruthy();
      expect(t.execute, `${name} should have execute`).toBeDefined();
    }
  });

  it("list_workspace returns empty artifacts initially", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.list_workspace.execute!(
      {},
      { toolCallId: "test", messages: [] },
    )) as { artifacts: string[] };
    expect(result.artifacts).toEqual([]);
  });

  it("write_artifact stores in workspace and emits event", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.write_artifact.execute!(
      { path: "test.md", content: "hello" },
      { toolCallId: "test", messages: [] },
    )) as { bytes: number };
    expect(result.bytes).toBe(5);
    expect(ctx.workspace.has("test.md")).toBe(true);
    expect(ctx.workspace.get("test.md")!.content).toBe("hello");
    expect(ctx.events.some((e) => e.type === "artifact")).toBe(true);
  });

  it("read_artifact reads from workspace", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    // Write first
    await tools.write_artifact.execute!(
      { path: "data.json", content: '{"a":1}' },
      { toolCallId: "w", messages: [] },
    );
    // Read back
    const result = (await tools.read_artifact.execute!(
      { path: "data.json" },
      { toolCallId: "r", messages: [] },
    )) as { content: string };
    expect(result.content).toBe('{"a":1}');
  });

  it("read_artifact returns null for missing path", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.read_artifact.execute!(
      { path: "nope.txt" },
      { toolCallId: "r", messages: [] },
    )) as { content: string | null };
    expect(result.content).toBeNull();
  });

  it("list_workspace shows written artifacts", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    await tools.write_artifact.execute!(
      { path: "a.md", content: "aaa" },
      { toolCallId: "w1", messages: [] },
    );
    await tools.write_artifact.execute!(
      { path: "b.py", content: "bbb" },
      { toolCallId: "w2", messages: [] },
    );
    const result = (await tools.list_workspace.execute!(
      {},
      { toolCallId: "l", messages: [] },
    )) as { artifacts: string[] };
    expect(result.artifacts).toContain("a.md");
    expect(result.artifacts).toContain("b.py");
  });

  it("map_workflow_weaknesses returns candidates and emits event", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.map_workflow_weaknesses.execute!(
      { workflowDescription: "A compliance workflow" },
      { toolCallId: "test", messages: [] },
    )) as { candidates: unknown[] };
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(ctx.events.some((e) => e.type === "weakness_report")).toBe(true);
  });

  it("run_harbor_sweep returns pass@3 and emits event", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.run_harbor_sweep.execute!(
      { mode: "target", trials: 3 },
      { toolCallId: "test", messages: [] },
    )) as { passAt3: string };
    expect(result.passAt3).toBe("0.27");
    expect(ctx.events.some((e) => e.type === "sweep_update")).toBe(true);
  });

  it("set_phase returns the phase and emits events", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.set_phase.execute!(
      { phase: "probe" },
      { toolCallId: "test", messages: [] },
    )) as { phase: string };
    expect(result.phase).toBe("probe");
    expect(ctx.events.some((e) => e.type === "phase")).toBe(true);
    expect(ctx.events.some((e) => e.type === "notice")).toBe(true);
  });

  it("scaffold_task emits artifact events for generated files", async () => {
    const ctx = testContext();
    const tools = createAgentTools(ctx);
    const result = (await tools.scaffold_task.execute!(
      { weaknessSlug: "test-weakness", taskTitle: "Test Task" },
      { toolCallId: "test", messages: [] },
    )) as { files: string[] };
    expect(result.files.length).toBeGreaterThan(0);
    const artifactEvents = ctx.events.filter((e) => e.type === "artifact");
    expect(artifactEvents.length).toBe(result.files.length);
    // Artifacts should be in workspace
    for (const f of result.files) {
      expect(ctx.workspace.has(f)).toBe(true);
    }
  });
});
