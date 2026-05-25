"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, TargetModelConfig, ProjectStatus } from "@/lib/types";
import { generateId, slugify } from "@/lib/utils";

interface ProjectStore {
  project: Project | null;
  loading: boolean;
  error: string | null;

  initProject: (name: string, targetModel: TargetModelConfig) => void;
  updateProject: (partial: Partial<Project>) => void;
  setTargetModel: (config: TargetModelConfig) => void;
  setStatus: (status: ProjectStatus) => void;
  setGlobalProgress: (progress: number) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      project: null,
      loading: false,
      error: null,

      initProject(name, targetModel) {
        const now = Date.now();
        const project: Project = {
          id: generateId(),
          name,
          slug: slugify(name),
          targetModel,
          auditorModel:
            targetModel.provider === "google"
              ? "claude-sonnet-4-20250514"
              : targetModel.provider === "anthropic"
                ? "gpt-4o"
                : "claude-sonnet-4-20250514",
          status: "active",
          globalProgress: 0,
          createdAt: now,
          updatedAt: now,
        };
        set({ project, error: null });
      },

      updateProject(partial) {
        set((s) => ({
          project: s.project ? { ...s.project, ...partial, updatedAt: Date.now() } : null,
        }));
      },

      setTargetModel(config) {
        set((s) => ({
          project: s.project ? { ...s.project, targetModel: config, updatedAt: Date.now() } : null,
        }));
      },

      setStatus(status) {
        set((s) => ({
          project: s.project ? { ...s.project, status, updatedAt: Date.now() } : null,
        }));
      },

      setGlobalProgress(progress) {
        set((s) => ({
          project: s.project
            ? { ...s.project, globalProgress: progress, updatedAt: Date.now() }
            : null,
        }));
      },

      resetProject() {
        set({ project: null, error: null });
      },
    }),
    {
      name: "harbor-project",
    },
  ),
);
