"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ChromeBar } from "@/components/layout/chrome-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { CanvasShell } from "@/components/canvas/canvas-shell";
import { EmptyCanvas } from "@/components/canvas/empty-canvas";
import { SetupWizard } from "@/components/studio/setup-wizard";
import { CommandPalette } from "@/components/studio/command-palette";
import { SettingsPanel } from "@/components/studio/settings-panel";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { HydrationGuard } from "@/components/ui/hydration-guard";
import { DomainDetailPanel } from "@/components/domain/domain-detail-panel";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStore } from "@/lib/stores/project-store";
import type { DomainId } from "@/lib/types";

export default function WorkspacePage() {
  const toggleCompanion = useUIStore((s) => s.toggleCompanion);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const project = useProjectStore((s) => s.project);
  const focusedDomainId = useUIStore((s) => s.focusedDomainId);
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen);
  const settingsOpen = useUIStore((s) => s.settingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (mod && key === "/") {
        e.preventDefault();
        toggleCompanion();
      }
      if (key === "escape") {
        const ui = useUIStore.getState();
        if (ui.commandPaletteOpen) {
          ui.setCommandPaletteOpen(false);
          return;
        }
        if (ui.setupWizardOpen) {
          ui.setSetupWizardOpen(false);
          return;
        }
        if (ui.settingsOpen) {
          ui.setSettingsOpen(false);
          return;
        }
        if (ui.detailPanelOpen) {
          ui.closeDetailPanel();
          return;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleCompanion, toggleCommandPalette]);

  // Sync focused domain to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (focusedDomainId) {
      params.set("domain", focusedDomainId);
    } else {
      params.delete("domain");
    }
    const qs = params.toString();
    window.history.replaceState({}, "", qs ? `?${qs}` : window.location.pathname);
  }, [focusedDomainId]);

  // Restore domain from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domain = params.get("domain");
    if (domain) {
      useUIStore.getState().setFocusedDomain(domain as DomainId);
      useUIStore.getState().openDetailPanel({ kind: "domain", domainId: domain as DomainId });
    }
  }, []);

  return (
    <HydrationGuard>
      <ErrorBoundary>
        <ReactFlowProvider>
          <div className="flex h-screen flex-col bg-[var(--bg)]">
            {/* Floating chrome bar */}
            <ChromeBar />

            {/* Main content area */}
            <div className="flex min-h-0 flex-1">
              {/* Canvas (full viewport) */}
              <div className="relative flex-1">{project ? <CanvasShell /> : <EmptyCanvas />}</div>

              {/* Floating sidebar */}
              {project && (
                <div className="z-[var(--z-sidebar)] flex h-full w-[var(--sidebar-width)] shrink-0 flex-col my-2 mr-2">
                  <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-sidebar)] shadow-[var(--shadow-md)]">
                    {/* Inner content */}
                    <div className="flex-1 overflow-y-auto rounded-[10px] bg-[var(--bg-sidebar-inner)] m-1.5 p-3">
                      {detailPanelOpen && focusedDomainId ? <DomainDetailPanel /> : <SidebarContent />}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overlays */}
            <SetupWizard />
            <CommandPalette />
            <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <ToastContainer />
          </div>
        </ReactFlowProvider>
      </ErrorBoundary>
    </HydrationGuard>
  );
}

function SidebarContent() {
  return <Sidebar />;
}
