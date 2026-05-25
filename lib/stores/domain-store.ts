"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DomainId,
  DomainState,
  DomainStatus,
  Milestone,
  MilestoneStatus,
  SuggestedProbe,
} from "@/lib/types";
import { DOMAINS } from "@/lib/domain/domains";
import { buildDefaultMilestones, resolveDependencies } from "@/lib/domain/milestones";

interface DomainStore {
  domainStates: Record<DomainId, DomainState>;
  milestones: Milestone[];
  suggestedProbes: SuggestedProbe[];

  // Actions
  initDomains: (selectedDomainIds?: DomainId[]) => void;
  setDomainStatus: (id: DomainId, status: DomainStatus) => void;
  updateMilestone: (id: string, partial: Partial<Milestone>) => void;
  setMilestoneStatus: (id: string, status: MilestoneStatus) => void;
  addMilestone: (milestone: Milestone) => void;
  removeMilestone: (id: string) => void;
  resolveDeps: () => void;
  refreshSuggestedProbes: () => void;
  getGlobalProgress: () => number;
  getMilestonesForDomain: (domainId: DomainId) => Milestone[];
}

function buildInitialDomainStates(): Record<DomainId, DomainState> {
  const states: Partial<Record<DomainId, DomainState>> = {};
  for (const domain of DOMAINS) {
    states[domain.id] = {
      domainId: domain.id,
      status: "available",
      progress: 0,
      milestonesTotal: 0,
      milestonesCompleted: 0,
      activeMilestoneId: null,
      agentId: null,
    };
  }
  return states as Record<DomainId, DomainState>;
}

function recomputeDomainProgress(
  domainStates: Record<DomainId, DomainState>,
  milestones: Milestone[],
): Record<DomainId, DomainState> {
  const updated = { ...domainStates };
  for (const domain of DOMAINS) {
    const domainMilestones = milestones.filter((m) => m.domainId === domain.id);
    const completed = domainMilestones.filter(
      (m) => m.status === "completed",
    ).length;
    const total = domainMilestones.length;
    const hasProbing = domainMilestones.some((m) =>
      ["probing", "building", "validating", "in_progress"].includes(m.status),
    );
    const allDone = total > 0 && completed === total;

    updated[domain.id] = {
      ...updated[domain.id],
      milestonesTotal: total,
      milestonesCompleted: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      status: allDone
        ? "completed"
        : hasProbing
          ? "probing"
          : updated[domain.id].status === "locked"
            ? "locked"
            : "available",
    };
  }
  return updated;
}

export const useDomainStore = create<DomainStore>()(
  persist(
    (set, get) => ({
      domainStates: buildInitialDomainStates(),
      milestones: [],
      suggestedProbes: [],

      initDomains(selectedDomainIds) {
        const allMilestones = buildDefaultMilestones();
        // Filter milestones to only selected domains
        const milestones = selectedDomainIds
          ? allMilestones.filter((m) => selectedDomainIds.includes(m.domainId))
          : allMilestones;
        const states = buildInitialDomainStates();

        // Lock domains that weren't selected
        if (selectedDomainIds) {
          for (const domain of DOMAINS) {
            if (!selectedDomainIds.includes(domain.id)) {
              states[domain.id].status = "locked";
            }
          }
        }

        const resolved = resolveDependencies(milestones);
        const updated = recomputeDomainProgress(states, resolved);
        set({ domainStates: updated, milestones: resolved });
      },

      setDomainStatus(id, status) {
        set((s) => ({
          domainStates: {
            ...s.domainStates,
            [id]: { ...s.domainStates[id], status },
          },
        }));
      },

      updateMilestone(id, partial) {
        set((s) => {
          const milestones = s.milestones.map((m) =>
            m.id === id ? { ...m, ...partial, updatedAt: Date.now() } : m,
          );
          return {
            milestones,
            domainStates: recomputeDomainProgress(s.domainStates, milestones),
          };
        });
      },

      setMilestoneStatus(id, status) {
        get().updateMilestone(id, { status });
      },

      addMilestone(milestone) {
        set((s) => {
          const milestones = [...s.milestones, milestone];
          return {
            milestones,
            domainStates: recomputeDomainProgress(s.domainStates, milestones),
          };
        });
      },

      removeMilestone(id) {
        set((s) => {
          const milestones = s.milestones.filter((m) => m.id !== id);
          return {
            milestones,
            domainStates: recomputeDomainProgress(s.domainStates, milestones),
          };
        });
      },

      resolveDeps() {
        set((s) => ({
          milestones: resolveDependencies(s.milestones),
        }));
      },

      refreshSuggestedProbes() {
        const { milestones, domainStates } = get();
        const probes: SuggestedProbe[] = milestones
          .filter(
            (m) =>
              m.status === "available" &&
              domainStates[m.domainId]?.status !== "locked",
          )
          .slice(0, 5)
          .map((m) => ({
            id: `probe-${m.id}`,
            domainId: m.domainId,
            milestoneId: m.id,
            label: m.label,
            description: m.probeStrategy,
            priority: m.order,
          }));
        set({ suggestedProbes: probes });
      },

      getGlobalProgress() {
        const { milestones } = get();
        if (milestones.length === 0) return 0;
        const completed = milestones.filter(
          (m) => m.status === "completed",
        ).length;
        return Math.round((completed / milestones.length) * 100);
      },

      getMilestonesForDomain(domainId) {
        return get().milestones.filter((m) => m.domainId === domainId);
      },
    }),
    {
      name: "harbor-domains",
    },
  ),
);
