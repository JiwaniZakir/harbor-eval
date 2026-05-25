import { NextRequest, NextResponse } from "next/server";
import { runLlmAgent } from "@/lib/agent/llm-runtime";
import { buildEmptyWorkspace } from "@/lib/agent/seed-workspace";
import type { AgentEvent, ChatMessage } from "@/lib/types";
import type { LlmProvider } from "@/lib/ai/providers";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/agent
 *
 * Accepts a user message + history, streams agent events as SSE.
 * Each event is a JSON-serialized AgentEvent on a `data:` line.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      targetProvider = "openai",
      targetModel = "gpt-4o",
      auditorProvider = "anthropic",
      auditorModel = "claude-sonnet-4-20250514",
      workspace,
    } = body as {
      message: string;
      history?: ChatMessage[];
      targetProvider?: LlmProvider;
      targetModel?: string;
      auditorProvider?: LlmProvider;
      auditorModel?: string;
      workspace?: ReturnType<typeof buildEmptyWorkspace>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    // Use provided workspace or create a fresh one
    const ws = workspace || buildEmptyWorkspace();

    // Create a readable stream to push SSE events
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: AgentEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          await runLlmAgent({
            input: message,
            history,
            workspace: ws,
            auditorProvider,
            auditorModel,
            targetProvider,
            targetModel,
            onEvent: sendEvent,
          });

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          const errMessage = error instanceof Error ? error.message : "Agent runtime error";
          sendEvent({ type: "error", message: errMessage });
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
