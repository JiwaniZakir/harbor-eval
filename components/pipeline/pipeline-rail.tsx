"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { productStages, stageForPhase, type ProductStage } from "@/lib/agent/stages";
import type { AgentPhase } from "@/lib/types";

export interface PipelineRailProps {
  currentPhase: AgentPhase;
  className?: string;
}

type StageStatus = "completed" | "current" | "upcoming";

function stageStatus(
  stageId: ProductStage,
  currentStageId: ProductStage,
): StageStatus {
  const stageIdx = productStages.findIndex((s) => s.id === stageId);
  const currentIdx = productStages.findIndex((s) => s.id === currentStageId);
  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) return "current";
  return "upcoming";
}

export function PipelineRail({ currentPhase, className }: PipelineRailProps) {
  const currentStage = stageForPhase(currentPhase);

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      aria-label="Pipeline progress"
    >
      {productStages.map((stage, idx) => {
        const status = stageStatus(stage.id, currentStage);
        const isLast = idx === productStages.length - 1;

        return (
          <div key={stage.id} className="flex items-center gap-1">
            {/* Stage pill */}
            <div className="flex items-center gap-2">
              {/* Circle indicator */}
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-[var(--duration-normal)]",
                  status === "completed" &&
                    "bg-[var(--brand-primary)] text-white",
                  status === "current" &&
                    "bg-[var(--brand-primary)] text-white shadow-[var(--shadow-glow)]",
                  status === "upcoming" &&
                    "bg-[var(--foreground-5)] text-[var(--foreground-30)]",
                )}
              >
                {status === "completed" ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Label + phase */}
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-xs font-medium leading-tight transition-colors duration-[var(--duration-fast)]",
                    status === "current" && "text-[var(--foreground)]",
                    status === "completed" && "text-[var(--foreground-70)]",
                    status === "upcoming" && "text-[var(--foreground-30)]",
                  )}
                >
                  {stage.label}
                </span>
                {status === "current" && (
                  <span className="text-[10px] leading-tight text-[var(--brand-primary)]">
                    {currentPhase}
                  </span>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "mx-1 h-px w-6 transition-colors duration-[var(--duration-normal)]",
                  status === "completed"
                    ? "bg-[var(--brand-primary)]"
                    : "bg-[var(--foreground-10)]",
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
