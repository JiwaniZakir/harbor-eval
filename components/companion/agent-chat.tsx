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
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import type { ChatMessage, ToolCall, PlanStep } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { useAgentStore } from "@/lib/stores/agent-store";

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
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-1.5 text-left transition-colors hover:bg-[var(--foreground-5)]"
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
          <pre className="max-h-[120px] overflow-auto whitespace-pre-wrap font-mono text-[10px] text-[var(--text-muted)]">
            {toolCall.summary || JSON.stringify(toolCall.args, null, 2)}
          </pre>
          {toolCall.result != null && (
            <div className="mt-1.5 border-t border-[var(--border-subtle)] pt-1.5">
              <pre className="max-h-[80px] overflow-auto whitespace-pre-wrap font-mono text-[10px] text-[var(--text-muted)]">
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
              "flex h-4 items-center whitespace-nowrap rounded-full px-2 text-[9px] font-medium",
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
              : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--foreground)] shadow-[var(--shadow-sm)]",
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

/** Streaming text bubble -- shows text as it arrives */
function StreamingBubble({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="flex gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)]">
        <Bot size={12} className="text-[var(--brand-primary)]" />
      </div>
      <div className="flex max-w-[85%] flex-col gap-1.5">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-sm leading-relaxed text-[var(--foreground)] shadow-[var(--shadow-sm)]">
          {text}
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[var(--brand-primary)]" />
        </div>
      </div>
    </div>
  );
}

export function AgentChat() {
  const {
    messages,
    isStreaming,
    currentStreamText,
    currentPlan,
    lifecycle,
    sendMessage,
    reset,
  } = useAgentStore();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or stream updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStreamText]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const msg = input.trim();
    setInput("");
    sendMessage(msg);
  };

  const handleRetry = () => {
    // Re-send the last user message
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  const hasMessages = messages.length > 0;
  const isError = lifecycle === "error";
  const lastMessage = messages[messages.length - 1];
  const errorMessage =
    isError && lastMessage?.role === "assistant"
      ? lastMessage.content
      : null;

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
        {!hasMessages && !isStreaming && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-muted)]">
              <Bot size={20} className="text-[var(--brand-primary)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Ask me anything about your evaluation campaign.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              I can map weaknesses, run probes, scaffold tasks, and more.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Active plan display */}
        {currentPlan.length > 0 && isStreaming && <PlanDisplay steps={currentPlan} />}

        {/* Streaming text */}
        {isStreaming && currentStreamText && <StreamingBubble text={currentStreamText} />}

        {/* Typing indicator */}
        {isStreaming && !currentStreamText && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)]">
              <Bot size={12} className="text-[var(--brand-primary)]" />
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 shadow-[var(--shadow-sm)]">
              <Spinner size={14} />
              <span className="text-xs text-[var(--text-muted)]">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--status-error)]/20 bg-[var(--status-error)]/5 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={14}
                className="text-[var(--status-error)]"
              />
              <span className="text-xs font-medium text-[var(--status-error)]">
                Something went wrong
              </span>
            </div>
            {errorMessage && (
              <p className="text-xs text-[var(--text-muted)]">
                {errorMessage}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px]"
                onClick={handleRetry}
              >
                <RotateCcw size={10} />
                Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px]"
                onClick={reset}
              >
                Clear
              </Button>
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
            disabled={!input.trim() || isStreaming}
          >
            <Send size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
