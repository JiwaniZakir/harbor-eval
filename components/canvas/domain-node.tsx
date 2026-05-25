"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProbingDomain, DomainState } from "@/lib/types";

interface DomainNodeData {
  domain: ProbingDomain;
  state: DomainState;
  isFocused: boolean;
  isOtherFocused: boolean;
}

function DomainNodeComponent({ data }: NodeProps) {
  const { domain, state, isFocused, isOtherFocused } = data as unknown as DomainNodeData;

  const statusLabel =
    state?.status === "completed"
      ? "Done"
      : state?.status === "probing"
        ? "Probing..."
        : state?.status === "paused"
          ? "Paused"
          : `${state?.milestonesCompleted || 0}/${state?.milestonesTotal || 0}`;

  const statusVariant =
    state?.status === "completed"
      ? "success"
      : state?.status === "probing"
        ? "primary"
        : ("default" as const);

  return (
    <div
      className={cn(
        "animate-scale-in group cursor-pointer transition-all duration-[var(--duration-normal)]",
        isOtherFocused && "opacity-50",
      )}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} className="!opacity-0" />
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="target" position={Position.Right} className="!opacity-0" />

      <div
        className={cn(
          "relative flex w-[160px] flex-col items-center gap-2 rounded-[var(--radius-lg)] border bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)] transition-all duration-[var(--duration-normal)]",
          isFocused
            ? "border-2 shadow-[var(--shadow-lg)]"
            : "border-[var(--border-subtle)] hover:shadow-[var(--shadow-md)]",
          state?.status === "probing" && "animate-pulse-glow",
        )}
        style={{
          borderColor: isFocused ? domain.accent : undefined,
          boxShadow: isFocused
            ? `0 0 0 1px ${domain.accent}22, var(--shadow-lg)`
            : undefined,
        }}
      >
        {/* Domain color dot */}
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ backgroundColor: domain.accent }}
        >
          {domain.shortLabel.charAt(0)}
        </div>

        {/* Name */}
        <div className="text-center">
          <div className="text-sm font-semibold leading-tight text-[var(--foreground)]">
            {domain.shortLabel}
          </div>
        </div>

        {/* Status badge */}
        <Badge variant={statusVariant}>{statusLabel}</Badge>

        {/* Progress bar */}
        {state && state.progress > 0 && state.progress < 100 && (
          <div className="w-full">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--foreground-5)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${state.progress}%`,
                  backgroundColor: domain.accent,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const DomainNode = memo(DomainNodeComponent);
