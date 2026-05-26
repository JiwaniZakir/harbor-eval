"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface CenterNodeData {
  label?: string;
  agentPhase?: string;
}

const phaseLabels: Record<string, string> = {
  intake: "Intake",
  weakness: "Mapping",
  probe: "Probing",
  decision: "Deciding",
  scaffold: "Building",
  fixtures: "Fixtures",
  verifier: "Verifying",
  sweep: "Sweeping",
  audit: "Auditing",
  iteration: "Iterating",
  publish: "Publishing",
};

function CenterModelNodeComponent({ data }: NodeProps) {
  const { label = "Harbor Eval", agentPhase } =
    data as unknown as CenterNodeData;
  const phaseLabel = agentPhase ? phaseLabels[agentPhase] : null;
  const isActive =
    agentPhase && agentPhase !== "intake" && agentPhase !== "publish";

  return (
    <div className="animate-scale-in group">
      <Handle type="source" position={Position.Top} className="!opacity-0" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!opacity-0"
      />

      <div
        className={cn(
          "flex h-[100px] w-[100px] items-center justify-center rounded-full border bg-[var(--bg-card)] shadow-[var(--shadow-lg)] transition-all duration-[var(--duration-normal)] group-hover:shadow-[var(--shadow-xl)]",
          isActive
            ? "border-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary-20)]"
            : "border-[var(--border-subtle)]",
        )}
      >
        <div className="text-center">
          <div className="text-lg font-bold leading-tight text-[var(--foreground)]">
            ◇
          </div>
          <div className="mt-0.5 max-w-[70px] truncate text-[10px] font-medium text-[var(--text-secondary)]">
            {label}
          </div>
          {phaseLabel && (
            <div
              className={cn(
                "mt-0.5 text-[8px] font-semibold uppercase tracking-wider",
                isActive
                  ? "text-[var(--brand-primary)]"
                  : "text-[var(--text-muted)]",
              )}
            >
              {phaseLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const CenterModelNode = memo(CenterModelNodeComponent);
