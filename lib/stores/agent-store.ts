"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AgentEvent,
  AgentLifecycle,
  AgentPhase,
  ChatMessage,
  PlanStep,
  ToolCall,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface AgentStore {
  // Chat state
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamText: string;

  // Agent lifecycle
  lifecycle: AgentLifecycle;
  currentPhase: AgentPhase;
  currentPlan: PlanStep[];
  toolCalls: ToolCall[];

  // Actions
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  appendStreamDelta: (delta: string) => void;
  finalizeStream: () => void;
  setStreaming: (streaming: boolean) => void;
  setLifecycle: (lifecycle: AgentLifecycle) => void;
  setPhase: (phase: AgentPhase) => void;
  setPlan: (plan: PlanStep[]) => void;
  addToolCall: (call: ToolCall) => void;
  updateToolCall: (id: string, updates: Partial<ToolCall>) => void;
  handleEvent: (event: AgentEvent) => void;
  clearMessages: () => void;
  reset: () => void;

  // Send message (calls API)
  sendMessage: (content: string) => Promise<void>;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isStreaming: false,
      currentStreamText: "",
      lifecycle: "idle",
      currentPhase: "intake",
      currentPlan: [],
      toolCalls: [],

      addUserMessage: (content) => {
        const msg: ChatMessage = {
          id: generateId(),
          role: "user",
          content,
          createdAt: Date.now(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },

      addAssistantMessage: (content) => {
        const msg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content,
          createdAt: Date.now(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },

      appendStreamDelta: (delta) => {
        set((s) => ({ currentStreamText: s.currentStreamText + delta }));
      },

      finalizeStream: () => {
        const { currentStreamText } = get();
        if (currentStreamText.trim()) {
          get().addAssistantMessage(currentStreamText);
        }
        set({ currentStreamText: "", isStreaming: false });
      },

      setStreaming: (streaming) => set({ isStreaming: streaming }),
      setLifecycle: (lifecycle) => set({ lifecycle }),
      setPhase: (phase) => set({ currentPhase: phase }),
      setPlan: (plan) => set({ currentPlan: plan }),

      addToolCall: (call) => {
        set((s) => ({ toolCalls: [...s.toolCalls, call] }));
      },

      updateToolCall: (id, updates) => {
        set((s) => ({
          toolCalls: s.toolCalls.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
        }));
      },

      handleEvent: (event) => {
        const store = get();
        switch (event.type) {
          case "text":
            store.appendStreamDelta(event.delta);
            break;
          case "plan":
            store.setPlan(event.plan);
            break;
          case "phase":
            store.setPhase(event.phase);
            break;
          case "tool_call_start":
            store.addToolCall(event.call);
            break;
          case "tool_call_finish":
            store.updateToolCall(event.id, {
              status: event.status || "succeeded",
              summary: event.summary,
              finishedAt: Date.now(),
            });
            break;
          case "done":
            store.finalizeStream();
            store.setLifecycle("complete");
            break;
          case "error":
            store.finalizeStream();
            store.setLifecycle("error");
            break;
          default:
            break;
        }
      },

      clearMessages: () => set({ messages: [], toolCalls: [], currentPlan: [] }),

      reset: () =>
        set({
          messages: [],
          isStreaming: false,
          currentStreamText: "",
          lifecycle: "idle",
          currentPhase: "intake",
          currentPlan: [],
          toolCalls: [],
        }),

      sendMessage: async (content) => {
        const store = get();
        store.addUserMessage(content);
        store.setStreaming(true);
        store.setLifecycle("initializing");

        try {
          const res = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              history: store.messages,
            }),
          });

          if (!res.ok) {
            const err = await res.text();
            throw new Error(err || `Agent API error: ${res.status}`);
          }

          // Read SSE stream
          const reader = res.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const event: AgentEvent = JSON.parse(data);
                  get().handleEvent(event);
                } catch {
                  // skip malformed events
                }
              }
            }
          }

          // Ensure stream finalized
          if (get().isStreaming) {
            get().finalizeStream();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          get().handleEvent({ type: "error", message });
        }
      },
    }),
    {
      name: "harbor-eval-agent",
      partialize: (state) => ({
        messages: state.messages,
        currentPhase: state.currentPhase,
      }),
    },
  ),
);
