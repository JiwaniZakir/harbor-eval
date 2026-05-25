"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { SweepSummary, SweepTrial } from "@/lib/types";

export interface SweepProgressProps {
  sweep: SweepSummary;
  mode?: "oracle" | "nop" | "target";
  className?: string;
}

const trialColor: Record<SweepTrial["status"], string> = {
  passed: "bg-[var(--status-success)]",
  failed: "bg-[var(--status-error)]",
  queued: "bg-[var(--foreground-10)]",
  running: "bg-[var(--status-info)]",
};

const trialLabel: Record<SweepTrial["status"], string> = {
  passed: "Passed",
  failed: "Failed",
  queued: "Queued",
  running: "Running",
};

export function SweepProgress({ sweep, mode, className }: SweepProgressProps) {
  const avgReward =
    sweep.trials.length > 0
      ? sweep.trials.reduce((sum, t) => sum + t.reward, 0) / sweep.trials.length
      : 0;

  const passedCount = sweep.trials.filter((t) => t.status === "passed").length;
  const failedCount = sweep.trials.filter((t) => t.status === "failed").length;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CardTitle>{sweep.taskSlug}</CardTitle>
          {mode && (
            <Badge variant="outline" className="uppercase text-[10px]">
              {mode}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Headline metrics row */}
        <div className="flex items-end gap-6">
          {/* pass@3 hero */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              pass@3
            </span>
            <span className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {sweep.passAt3}
            </span>
          </div>

          {/* Average reward */}
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Avg Reward
            </span>
            <span className="text-lg font-semibold text-[var(--foreground)]">
              {avgReward.toFixed(2)}
            </span>
          </div>

          {/* Pass / Fail counts */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-[var(--status-success)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--status-success)]" />
              {passedCount}
            </span>
            <span className="flex items-center gap-1 text-[var(--status-error)]">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--status-error)]" />
              {failedCount}
            </span>
          </div>
        </div>

        {/* Trial grid */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            Trials
          </span>
          <div className="flex flex-wrap gap-1">
            {sweep.trials.map((trial) => (
              <div
                key={trial.idx}
                title={`Trial ${trial.idx}: ${trialLabel[trial.status]} (reward ${trial.reward})`}
                className={cn(
                  "h-5 w-5 rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)]",
                  trialColor[trial.status],
                  trial.status === "running" && "animate-pulse",
                )}
              />
            ))}
          </div>
        </div>

        {/* Average reward bar */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            Reward Distribution
          </span>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--foreground-5)]">
            <div
              className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, avgReward * 100))}%` }}
            />
          </div>
        </div>

        {/* Cascade steps */}
        {sweep.cascade && sweep.cascade.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Cascade
            </span>
            <div className="flex flex-wrap gap-1">
              {sweep.cascade.map((step) => (
                <Badge
                  key={step.id}
                  variant={
                    step.status === "passed" || step.status === "completed"
                      ? "success"
                      : step.status === "failed"
                        ? "error"
                        : "default"
                  }
                >
                  {step.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
