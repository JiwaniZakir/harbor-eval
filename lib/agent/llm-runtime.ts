import { streamText, stepCountIs } from "ai";
import { getAiModel, type LlmProvider } from "@/lib/ai/providers";
import { createAgentTools } from "./tools";
import { systemPrompt } from "./system-prompt";
import { stageForPhase, stageContexts } from "./stages";
import type { AgentEvent, ChatMessage, PlanStep, ToolCall, WorkspaceState, Artifact } from "./types";
import { generateId } from "@/lib/utils";

export const DEFAULT_TRIALS_PER_VARIANT = 15;

export type LlmAgentOptions = {
  input: string;
  history: ChatMessage[];
  workspace: WorkspaceState;
  auditorProvider: LlmProvider;
  auditorModel: string;
  targetProvider: LlmProvider;
  targetModel: string;
  onEvent: (event: AgentEvent) => void;
};

/**
 * Run one turn of the LLM agent.
 * Streams a response with tool calls and emits events via callback.
 */
export async function runLlmAgent(opts: LlmAgentOptions): Promise<string> {
  const { input, history, workspace, auditorProvider, auditorModel, onEvent } = opts;

  const model = getAiModel(auditorProvider, auditorModel);

  // In-memory artifact store for this agent run
  const artifactMap = new Map<string, Artifact>();

  // Create tools with workspace context
  const tools = createAgentTools({
    workspace: artifactMap,
    onEvent,
  });

  // Determine current stage context
  const stage = stageForPhase(workspace.phase);
  const stageCtx = stageContexts[stage] || stageContexts.intake;

  // Build plan from stage chips
  const plan: PlanStep[] = stageCtx.chips.map((chip, i) => ({
    id: `step-${i}`,
    label: chip.label,
    status: i === 0 ? "active" : ("pending" as const),
  }));
  onEvent({ type: "plan", plan });

  // Build messages for the LLM
  const messages = [
    ...history
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    { role: "user" as const, content: input },
  ];

  try {
    const result = streamText({
      model,
      system: systemPrompt(workspace),
      messages,
      tools,
      stopWhen: stepCountIs(5),
      onStepFinish({ text, toolCalls }) {
        if (toolCalls && toolCalls.length > 0) {
          for (const tc of toolCalls) {
            const toolCall: ToolCall = {
              id: generateId(),
              name: tc.toolName as ToolCall["name"],
              args: (tc as unknown as Record<string, unknown>).args as Record<string, unknown>,
              status: "succeeded",
              startedAt: Date.now() - 1000,
              finishedAt: Date.now(),
              summary: `Completed ${tc.toolName}`,
            };
            onEvent({ type: "tool_call_start", call: toolCall });
            onEvent({
              type: "tool_call_finish",
              id: toolCall.id,
              result: toolCall.args,
              summary: toolCall.summary,
              status: "succeeded",
            });
          }
        }
        if (text) {
          // text from completed step -- already streamed via textStream
        }
      },
    });

    // Stream text deltas to the client
    for await (const delta of result.textStream) {
      onEvent({ type: "text", delta });
    }

    // Wait for full completion
    const fullText = await result.text;

    // Mark plan steps as done
    const donePlan = plan.map((s) => ({ ...s, status: "done" as const }));
    onEvent({ type: "plan", plan: donePlan });
    onEvent({ type: "done", summary: "Agent turn complete" });

    return fullText;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown agent error";
    onEvent({ type: "error", message });
    throw error;
  }
}
