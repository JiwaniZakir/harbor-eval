"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

function CenterModelNodeComponent({ data }: NodeProps) {
  const label = (data as { label?: string }).label || "Harbor Eval";

  return (
    <div className="animate-scale-in group">
      <Handle type="source" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      <Handle type="source" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />

      <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-lg)] transition-all duration-[var(--duration-normal)] group-hover:shadow-[var(--shadow-xl)]">
        <div className="text-center">
          <div className="text-lg font-bold leading-tight text-[var(--foreground)]">
            ◇
          </div>
          <div className="mt-0.5 max-w-[70px] truncate text-[10px] font-medium text-[var(--text-secondary)]">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export const CenterModelNode = memo(CenterModelNodeComponent);
