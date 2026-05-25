"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WeaknessCandidate } from "@/lib/types";

export interface WeaknessCardViewProps {
  weakness: WeaknessCandidate;
  selected?: boolean;
  onClick?: (slug: string) => void;
  className?: string;
}

const severityVariant = (score: number) => {
  if (score >= 0.7) return "error" as const;
  if (score >= 0.4) return "warning" as const;
  return "success" as const;
};

const severityLabel = (score: number) => {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  return "Low";
};

const statusColors: Record<WeaknessCandidate["status"], string> = {
  candidate: "bg-[var(--foreground-5)] text-[var(--foreground-60)]",
  approved: "bg-[var(--accent-muted)] text-[var(--brand-primary)]",
  promoted: "bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]",
  rejected: "bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]",
  redesign: "bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]",
};

export function WeaknessCardView({
  weakness,
  selected,
  onClick,
  className,
}: WeaknessCardViewProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-[var(--duration-fast)] hover:shadow-[var(--shadow-md)]",
        selected && "ring-2 ring-[var(--brand-primary)] shadow-[var(--shadow-glow)]",
        className,
      )}
      onClick={() => onClick?.(weakness.slug)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex-1">{weakness.weaknessTitle}</CardTitle>
          <Badge variant={severityVariant(weakness.workflowFitScore)}>
            {severityLabel(weakness.workflowFitScore)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {weakness.hypothesis}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Status pill */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-medium capitalize",
              statusColors[weakness.status],
            )}
          >
            {weakness.status}
          </span>
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {weakness.domain}
          </span>
        </div>

        {/* Fit score meter */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Fit Score
            </span>
            <span className="text-[11px] font-semibold text-[var(--foreground)]">
              {Math.round(weakness.workflowFitScore * 100)}%
            </span>
          </div>
          <Progress value={weakness.workflowFitScore * 100} />
        </div>

        {/* Taxonomy slug chip */}
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center rounded-[var(--radius-sm)] bg-[var(--foreground-5)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--foreground-50)]">
            {weakness.taxonomySlug.replace(/_/g, " ")}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <span className="text-[10px] text-[var(--text-muted)]">
          {weakness.verifierStrategy}
        </span>
      </CardFooter>
    </Card>
  );
}
