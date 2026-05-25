"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import type { ChatMessage, ToolCall, PlanStep } from "@/lib/types";
import { generateId, formatRelativeTime } from "@/lib/utils";

// Demo messages for initial state
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content:
      'I\'ve set up your evaluation canvas. I can see your domains are ready for probing. Click "Start Probing" on any milestone, or ask me to suggest where to begin.',
    createdAt: Date.now() - 60000,
    phase: "intake",
  },
];

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    queued: <Clock size={12} className="text-[var(--foreground-40)]" />,
    running: <Loader2 size={12} className="animate-spin text-[var(--brand-primary)]" />,
    succeeded: <CheckCircle2 size={12} className="text-[var(--status-success)]" />,
    failed: <XCircle size={12} className="text-[var(--status-error)]" />,
  }[toolCall.status];

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card-secondary)] text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-[var(--foreground-5)] transition-colors rounded-[var(--radius-md)]"
      >
        {statusIcon}
        <span className="flex-1 font-mono text-[var(--text-secondary)]">{toolCall.name}</span>
        {toolCall.finishedAt && toolCall.startedAt && (
          <span className="text-[var(--text-muted)]">
            {((toolCall.finishedAt - toolCall.startedAt) / 1000).toFixed(1)}s
          </span>
        )}
        {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] px-2.5 py-2">
          <pre className="max-h-[120px] overflow-auto text-[10px] text-[var(--text-muted)] font-mono whitespace-pre-wrap">
            {toolCall.summary || JSON.stringify(toolCall.args, null, 2)}
          </pre>
          {toolCall.result != null && (
            <div className="mt-1.5 border-t border-[var(--border-subtle)] pt-1.5">
              <pre className="max-h-[80px] overflow-auto text-[10px] text-[var(--text-muted)] font-mono whitespace-pre-wrap">
                {typeof toolCall.result === "string"
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanDisplay({ steps }: { steps: PlanStep[] }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div
            className={cn(
              "flex h-4 items-center rounded-full px-2 text-[9px] font-medium whitespace-nowrap",
              step.status === "done"
                ? "bg-[var(--success-bg)] text-[var(--success-text)]"
                : step.status === "active"
                  ? "bg-[var(--accent-muted)] text-[var(--brand-primary)]"
                  : "bg-[var(--foreground-5)] text-[var(--text-muted)]",
            )}
          >
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={8} className="shrink-0 text-[var(--foreground-20)]" />
          )}
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
          isUser
            ? "bg-[var(--foreground)] text-[var(--foreground-inverse)]"
            : "bg-[var(--accent-muted)] text-[var(--brand-primary)]",
        )}
      >
        {isUser ? <User size={12} /> : <Bot size={12} />}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[85%] flex-col gap-1.5", isUser && "items-end")}>
        {/* Phase badge */}
        {message.phase && !isUser && (
          <Badge variant="default" className="text-[9px]">
            {message.phase}
          </Badge>
        )}

        {/* Plan steps */}
        {message.plan && message.plan.length > 0 && <PlanDisplay steps={message.plan} />}

        {/* Message text */}
        <div
          className={cn(
            "rounded-[var(--radius-lg)] px-3 py-2 text-sm leading-relaxed",
            isUser
              ? "bg-[var(--foreground)] text-[var(--foreground-inverse)]"
              : "bg-[var(--bg-card)] text-[var(--foreground)] shadow-[var(--shadow-sm)] border border-[var(--border-subtle)]",
          )}
        >
          {message.content}
        </div>

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex w-full flex-col gap-1">
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-[var(--foreground-30)]">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate agent response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "I'll analyze that domain and suggest the best probing strategy. Let me examine the milestones and identify potential failure modes...",
        createdAt: Date.now(),
        phase: "weakness",
        toolCalls: [
          {
            id: generateId(),
            name: "map_workflow_weaknesses",
            args: { domain: "instruction_following" },
            status: "succeeded",
            startedAt: Date.now() - 2300,
            finishedAt: Date.now(),
            summary: "Found 3 weakness candidates with fit scores 8.2, 6.1, 5.4",
          },
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)]">
              <Bot size={12} className="text-[var(--brand-primary)]" />
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--bg-card)] px-3 py-2 shadow-[var(--shadow-sm)] border border-[var(--border-subtle)]">
              <Spinner size={14} />
              <span className="text-xs text-[var(--text-muted)]">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your evaluation..."
            rows={1}
            className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
          />
          <Button
            variant="primary"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
