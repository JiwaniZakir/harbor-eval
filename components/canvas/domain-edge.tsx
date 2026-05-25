"use client";

import { memo } from "react";
import { BaseEdge, getStraightPath, type EdgeProps } from "@xyflow/react";

function DomainEdgeComponent({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const edgeData = data as { accent?: string; isActive?: boolean } | undefined;
  const accent = edgeData?.accent || "var(--foreground-10)";
  const isActive = edgeData?.isActive || false;

  return (
    <BaseEdge
      path={edgePath}
      style={{
        stroke: accent,
        strokeWidth: 1.5,
        opacity: isActive ? 0.4 : 0.12,
        transition: "opacity 300ms ease",
      }}
    />
  );
}

export const DomainEdge = memo(DomainEdgeComponent);
