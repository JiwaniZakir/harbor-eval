"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useDomainStore } from "@/lib/stores/domain-store";
import { useAgentStore } from "@/lib/stores/agent-store";
import { DOMAINS } from "@/lib/domain/domains";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WeaknessCardView } from "@/components/pipeline/weakness-card";
import { SweepProgress } from "@/components/pipeline/sweep-progress";
import { ApprovalGateView } from "@/components/pipeline/approval-gate";
import { ArtifactViewer } from "@/components/pipeline/artifact-viewer";
import { ExportPanel } from "@/components/studio/export-panel";
import {
  Home,
  Bot,
  Layers,
  ClipboardList,
  Library,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { SidebarTab, DomainId } from "@/lib/types";
import { AgentChat } from "@/components/companion/agent-chat";

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: <Home size={16} /> },
  { id: "agent", label: "Agent", icon: <Bot size={16} /> },
  { id: "domains", label: "Domains", icon: <Layers size={16} /> },
  { id: "tasks", label: "Tasks", icon: <ClipboardList size={16} /> },
  { id: "library", label: "Library", icon: <Library size={16} /> },
];

function TabBar() {
  const activeTab = useUIStore((s) => s.sidebarTab);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);

  return (
    <div className="flex items-center gap-0.5 rounded-[var(--radius-md)] bg-[var(--foreground-5)] p-0.5">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSidebarTab(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-xs font-medium transition-all duration-[var(--duration-fast)]",
            activeTab === tab.id
              ? "bg-[var(--bg-card)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
              : "text-[var(--foreground-50)] hover:text-[var(--foreground-70)]",
          )}
        >
          {tab.icon}
          <span className="hidden lg:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function HomeContent() {
  const project = useProjectStore((s) => s.project);
  const domainStates = useDomainStore((s) => s.domainStates);
  const suggestedProbes = useDomainStore((s) => s.suggestedProbes);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);
  const globalProgress = useDomainStore((s) => s.getGlobalProgress());

  // Pipeline state from agent
  const weaknessReport = useAgentStore((s) => s.weaknessReport);
  const sweepSummary = useAgentStore((s) => s.sweepSummary);
  const approvalGate = useAgentStore((s) => s.approvalGate);
  const resolveGate = useAgentStore((s) => s.resolveGate);

  const handleDomainClick = (domainId: DomainId) => {
    setFocusedDomain(domainId);
    openDetailPanel({ kind: "domain", domainId });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {project
            ? `Working on ${project.name}`
            : "Create a campaign to get started"}
        </p>
      </div>

      {/* Approval gate (top priority) */}
      {approvalGate && (
        <ApprovalGateView
          gate={approvalGate}
          onApprove={() => resolveGate(true)}
          onReject={() => resolveGate(false)}
        />
      )}

      {/* Sweep results */}
      {sweepSummary && <SweepProgress sweep={sweepSummary} />}

      {/* Weakness report cards */}
      {weaknessReport &&
        weaknessReport.candidates.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Weakness Candidates
            </h3>
            <div className="flex flex-col gap-1.5">
              {weaknessReport.candidates.slice(0, 3).map((c) => (
                <WeaknessCardView
                  key={c.slug}
                  weakness={c}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        )}

      {/* Roadmap card */}
      {project && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--foreground)]">
              {project.name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {globalProgress}%
            </span>
          </div>
          <Progress value={globalProgress} className="h-1" />
        </div>
      )}

      {/* Domain tasks */}
      {project && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Domains
          </h3>
          <div className="flex flex-col gap-1">
            {DOMAINS.filter(
              (d) => domainStates[d.id]?.status !== "locked",
            ).map((domain) => {
              const state = domainStates[domain.id];
              return (
                <button
                  key={domain.id}
                  onClick={() => handleDomainClick(domain.id)}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--foreground-5)]"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: domain.accent }}
                  />
                  <span className="flex-1 text-sm text-[var(--foreground-70)]">
                    {domain.shortLabel}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={
                        state?.status === "completed"
                          ? "success"
                          : state?.status === "probing"
                            ? "primary"
                            : "default"
                      }
                    >
                      {state?.status === "completed"
                        ? "Done"
                        : state?.status === "probing"
                          ? "Active"
                          : `${state?.milestonesCompleted || 0}/${state?.milestonesTotal || 0}`}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggested probes */}
      {suggestedProbes.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <Sparkles size={12} />
            Suggested Next
          </h3>
          <div className="flex flex-col gap-1">
            {suggestedProbes.slice(0, 3).map((probe) => (
              <button
                key={probe.id}
                onClick={() => handleDomainClick(probe.domainId)}
                className="group flex items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--foreground-5)]"
              >
                <Sparkles
                  size={12}
                  className="shrink-0 text-[var(--brand-primary)]"
                />
                <span className="flex-1 truncate text-xs text-[var(--foreground-60)]">
                  {probe.label}
                </span>
                <ArrowRight
                  size={12}
                  className="shrink-0 text-[var(--foreground-20)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--foreground-40)]"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DomainsContent() {
  const domainStates = useDomainStore((s) => s.domainStates);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        All Domains
      </h3>
      {DOMAINS.map((domain) => {
        const state = domainStates[domain.id];
        const isLocked = state?.status === "locked";
        return (
          <button
            key={domain.id}
            disabled={isLocked}
            onClick={() => {
              setFocusedDomain(domain.id);
              openDetailPanel({ kind: "domain", domainId: domain.id });
            }}
            className={cn(
              "flex items-start gap-3 rounded-[var(--radius-md)] p-3 text-left transition-colors",
              isLocked
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:bg-[var(--foreground-5)]",
            )}
          >
            <div
              className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
              style={{
                backgroundColor: isLocked
                  ? "var(--status-locked)"
                  : domain.accent,
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-[var(--foreground)]">
                {domain.label}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">
                {domain.description}
              </div>
              {!isLocked && state && (
                <div className="mt-2">
                  <Progress value={state.progress} className="h-1" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TasksContent() {
  const milestones = useDomainStore((s) => s.milestones);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);

  const grouped = milestones.reduce(
    (acc, m) => {
      const key = m.status;
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {} as Record<string, typeof milestones>,
  );

  const sections = [
    {
      key: "probing",
      label: "Active",
      items: [
        ...(grouped.probing || []),
        ...(grouped.building || []),
        ...(grouped.validating || []),
        ...(grouped.in_progress || []),
      ],
    },
    {
      key: "available",
      label: "Available",
      items: grouped.available || [],
    },
    {
      key: "completed",
      label: "Completed",
      items: grouped.completed || [],
    },
    { key: "locked", label: "Locked", items: grouped.locked || [] },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        All Milestones ({milestones.length})
      </h3>
      {sections.map((section) => (
        <div key={section.key}>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-30)]">
            {section.label} ({section.items.length})
          </div>
          <div className="flex flex-col gap-0.5">
            {section.items.map((m) => {
              const domain = DOMAINS.find((d) => d.id === m.domainId);
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setFocusedDomain(m.domainId);
                    openDetailPanel({
                      kind: "domain",
                      domainId: m.domainId,
                    });
                  }}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--foreground-5)]"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: domain?.accent }}
                  />
                  <span className="flex-1 truncate text-xs text-[var(--foreground-70)]">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {domain?.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryContent() {
  const artifacts = useAgentStore((s) => s.artifacts);
  const artifactList = Object.values(artifacts);

  if (artifactList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Library
          size={24}
          className="mb-2 text-[var(--foreground-20)]"
        />
        <div className="text-sm text-[var(--text-muted)]">
          Artifact Library
        </div>
        <div className="mt-1 text-xs text-[var(--foreground-30)]">
          Artifacts will appear here as the agent creates them.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ExportPanel />
      <ArtifactViewer
        artifacts={artifactList}
        className="h-[calc(100vh-400px)]"
      />
    </div>
  );
}

export function Sidebar() {
  const activeTab = useUIStore((s) => s.sidebarTab);

  return (
    <div className="flex flex-col gap-3">
      <TabBar />
      <div className="animate-fade-blur">
        {activeTab === "home" && <HomeContent />}
        {activeTab === "agent" && <AgentChat />}
        {activeTab === "domains" && <DomainsContent />}
        {activeTab === "tasks" && <TasksContent />}
        {activeTab === "library" && <LibraryContent />}
      </div>
    </div>
  );
}
