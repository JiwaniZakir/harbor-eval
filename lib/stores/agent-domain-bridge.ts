"use client";

import { useAgentStore } from "./agent-store";
import { useDomainStore } from "./domain-store";
import type { AgentPhase } from "@/lib/types";

let initialized = false;

/**
 * Subscribe to agent store changes and propagate meaningful updates
 * to the domain store (milestone status, progress, etc.).
 *
 * Call once from the root page component. Idempotent.
 */
export function initAgentDomainBridge() {
  if (initialized) return;
  initialized = true;

  let prevPhase: AgentPhase = "intake";
  let prevLifecycle = "idle";

  useAgentStore.subscribe((state) => {
    const domainStore = useDomainStore.getState();

    // Phase transitions drive milestone status
    if (state.currentPhase !== prevPhase) {
      const phase = state.currentPhase;
      prevPhase = phase;

      // When entering probe phase, mark available milestones as probing
      if (phase === "probe") {
        const milestones = domainStore.milestones.filter(
          (m) => m.status === "available",
        );
        for (const m of milestones.slice(0, 1)) {
          domainStore.setMilestoneStatus(m.id, "probing");
        }
      }

      // When entering scaffold phase, mark probing milestones as building
      if (phase === "scaffold") {
        const milestones = domainStore.milestones.filter(
          (m) => m.status === "probing",
        );
        for (const m of milestones) {
          domainStore.setMilestoneStatus(m.id, "building");
        }
      }

      // When entering sweep or verifier, mark as validating
      if (phase === "sweep" || phase === "verifier") {
        const milestones = domainStore.milestones.filter(
          (m) => m.status === "building",
        );
        for (const m of milestones) {
          domainStore.setMilestoneStatus(m.id, "validating");
        }
      }
    }

    // Sweep results can complete milestones
    if (state.sweepSummary) {
      const passAt3 = parseFloat(state.sweepSummary.passAt3);
      if (passAt3 >= 0.5) {
        const milestones = domainStore.milestones.filter(
          (m) =>
            m.status === "validating" ||
            m.status === "building" ||
            m.status === "probing",
        );
        for (const m of milestones.slice(0, 1)) {
          domainStore.setMilestoneStatus(m.id, "completed");
        }
      }
    }

    // Agent completion updates domain progress (already recomputed via setMilestoneStatus)
    if (state.lifecycle !== prevLifecycle) {
      prevLifecycle = state.lifecycle;
    }
  });
}
