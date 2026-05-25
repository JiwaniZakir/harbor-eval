"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SidebarTab, DetailPanelPayload, DomainId } from "@/lib/types";

interface UIStore {
  // Sidebar
  sidebarTab: SidebarTab;
  setSidebarTab: (tab: SidebarTab) => void;

  // Detail panel (domain/milestone/artifact viewer)
  detailPanelOpen: boolean;
  detailPayload: DetailPanelPayload | null;
  openDetailPanel: (payload: DetailPanelPayload) => void;
  closeDetailPanel: () => void;

  // Companion (agent chat)
  companionOpen: boolean;
  toggleCompanion: () => void;
  setCompanionOpen: (open: boolean) => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Setup wizard
  setupWizardOpen: boolean;
  setSetupWizardOpen: (open: boolean) => void;

  // Canvas focus
  focusedDomainId: DomainId | null;
  setFocusedDomain: (id: DomainId | null) => void;

  // Notifications
  notificationCount: number;
  setNotificationCount: (count: number) => void;

  // Settings panel
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  toggleSettings: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarTab: "home",
      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      // Detail panel
      detailPanelOpen: false,
      detailPayload: null,
      openDetailPanel: (payload) => set({ detailPanelOpen: true, detailPayload: payload }),
      closeDetailPanel: () =>
        set({ detailPanelOpen: false, detailPayload: null, focusedDomainId: null }),

      // Companion
      companionOpen: false,
      toggleCompanion: () => set((s) => ({ companionOpen: !s.companionOpen })),
      setCompanionOpen: (open) => set({ companionOpen: open }),

      // Command palette
      commandPaletteOpen: false,
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Setup wizard
      setupWizardOpen: false,
      setSetupWizardOpen: (open) => set({ setupWizardOpen: open }),

      // Canvas focus
      focusedDomainId: null,
      setFocusedDomain: (id) => set({ focusedDomainId: id }),

      // Notifications
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),

      // Settings panel
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
    }),
    {
      name: "harbor-ui",
      partialize: (state) => ({
        sidebarTab: state.sidebarTab,
        companionOpen: state.companionOpen,
      }),
    },
  ),
);
