"use client";

import { X, Play, Pause, Sparkles, Lock, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { useDomainStore } from "@/lib/stores/domain-store";
import { DOMAINS } from "@/lib/domain/domains";
import type { Milestone, MilestoneStatus } from "@/lib/types";

function MilestoneStatusIcon({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "completed":
      return <Check size={14} className="text-[var(--status-success)]" />;
    case "probing":
    case "building":
    case "validating":
    case "in_progress":
      return <Play size={12} className="text-[var(--brand-primary)]" />;
    case "failed":
      return <AlertCircle size={14} className="text-[var(--status-error)]" />;
    case "locked":
      return <Lock size={12} className="text-[var(--status-locked)]" />;
    case "skipped":
      return <X size={12} className="text-[var(--foreground-30)]" />;
    default:
      return <div className="h-2.5 w-2.5 rounded-full border-2 border-[var(--foreground-20)]" />;
  }
}

function MilestoneCard({ milestone, accent }: { milestone: Milestone; accent: string }) {
  const setMilestoneStatus = useDomainStore((s) => s.setMilestoneStatus);
  const isLocked = milestone.status === "locked";
  const isActive = ["probing", "building", "validating", "in_progress"].includes(milestone.status);
  const isCompleted = milestone.status === "completed";

  return (
    <div
      className={cn(
        "group rounded-[var(--radius-md)] border p-3 transition-all duration-[var(--duration-fast)]",
        isLocked
          ? "border-dashed border-[var(--border-subtle)] opacity-50"
          : isActive
            ? "border-l-2 border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]"
            : isCompleted
              ? "border-[var(--success-border)] bg-[var(--success-bg)]"
              : "border-[var(--border-subtle)] hover:bg-[var(--bg-card)] hover:shadow-[var(--shadow-sm)]",
      )}
      style={{
        borderLeftColor: isActive ? accent : undefined,
      }}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">
          <MilestoneStatusIcon status={milestone.status} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              isLocked ? "text-[var(--foreground-40)]" : "text-[var(--foreground)]",
            )}>
              {milestone.label}
            </span>
            {milestone.source === "ai_discovered" && (
              <Sparkles size={10} className="text-[var(--brand-primary)]" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-2">
            {milestone.description}
          </p>

          {/* Active milestone: show agent status */}
          {isActive && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="primary">
                {milestone.status === "probing" ? "Probing" : milestone.status === "building" ? "Building" : "Validating"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setMilestoneStatus(milestone.id, "available")}
              >
                <Pause size={10} />
                Pause
              </Button>
            </div>
          )}

          {/* Available milestone: show start button */}
          {milestone.status === "available" && (
            <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setMilestoneStatus(milestone.id, "probing")}
              >
                <Play size={10} />
                Start Probing
              </Button>
            </div>
          )}

          {/* Locked milestone: show prereq */}
          {isLocked && milestone.prerequisites.length > 0 && (
            <p className="mt-1 text-[10px] text-[var(--foreground-30)]">
              Requires: {milestone.prerequisites.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function DomainDetailPanel() {
  const focusedDomainId = useUIStore((s) => s.focusedDomainId);
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel);
  const domainStates = useDomainStore((s) => s.domainStates);
  const getMilestonesForDomain = useDomainStore((s) => s.getMilestonesForDomain);

  if (!focusedDomainId) return null;

  const domain = DOMAINS.find((d) => d.id === focusedDomainId);
  if (!domain) return null;

  const state = domainStates[focusedDomainId];
  const milestones = getMilestonesForDomain(focusedDomainId);

  // Sort: active first, then available, then completed, then locked
  const sortedMilestones = [...milestones].sort((a, b) => {
    const priority: Record<string, number> = {
      probing: 0,
      building: 0,
      validating: 0,
      in_progress: 0,
      available: 1,
      completed: 2,
      locked: 3,
      failed: 4,
      skipped: 5,
    };
    return (priority[a.status] ?? 6) - (priority[b.status] ?? 6);
  });

  const presetMilestones = sortedMilestones.filter((m) => m.source === "preset");
  const discoveredMilestones = sortedMilestones.filter((m) => m.source === "ai_discovered");

  return (
    <div className="animate-fade-blur flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: domain.accent }}
          />
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            {domain.label}
          </h2>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={closeDetailPanel}>
          <X size={14} />
        </Button>
      </div>

      {/* Progress */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {state?.milestonesCompleted || 0} of {state?.milestonesTotal || 0} milestones
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {state?.progress || 0}%
          </span>
        </div>
        <Progress
          value={state?.progress || 0}
          indicatorClassName="transition-all duration-700"
          style={{ ["--tw-progress-color" as string]: domain.accent }}
        />
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          {domain.description}
        </p>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Milestones
        </h3>
        <div className="flex flex-col gap-1.5">
          {presetMilestones.map((m) => (
            <MilestoneCard key={m.id} milestone={m} accent={domain.accent} />
          ))}
        </div>
      </div>

      {/* AI Discovered */}
      {discoveredMilestones.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Sparkles size={10} />
            AI Discovered
          </h3>
          <div className="flex flex-col gap-1.5">
            {discoveredMilestones.map((m) => (
              <MilestoneCard key={m.id} milestone={m} accent={domain.accent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
