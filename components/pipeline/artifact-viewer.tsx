"use client";

import { useState } from "react";
import { FileCode, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Artifact, ArtifactKind } from "@/lib/types";

export interface ArtifactViewerProps {
  artifacts: Artifact[];
  initialPath?: string;
  className?: string;
}

const kindIcon: Record<ArtifactKind, typeof FileCode> = {
  markdown: FileText,
  toml: FileCode,
  yaml: FileCode,
  json: FileCode,
  python: FileCode,
  shell: FileCode,
  csv: FileText,
  diff: FileCode,
};

function fileName(path: string): string {
  return path.split("/").pop() || path;
}

export function ArtifactViewer({ artifacts, initialPath, className }: ArtifactViewerProps) {
  const [openPaths, setOpenPaths] = useState<string[]>(() => {
    if (initialPath && artifacts.some((a) => a.path === initialPath)) {
      return [initialPath];
    }
    return artifacts.length > 0 ? [artifacts[0].path] : [];
  });
  const [activePath, setActivePath] = useState<string | null>(openPaths[0] ?? null);

  const activeArtifact = artifacts.find((a) => a.path === activePath) ?? null;

  function openTab(path: string) {
    if (!openPaths.includes(path)) {
      setOpenPaths((prev) => [...prev, path]);
    }
    setActivePath(path);
  }

  function closeTab(path: string) {
    const next = openPaths.filter((p) => p !== path);
    setOpenPaths(next);
    if (activePath === path) {
      setActivePath(next[next.length - 1] ?? null);
    }
  }

  const lines = activeArtifact?.content?.split("\n") ?? [];

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-card)]",
        className,
      )}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-px overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]">
        {openPaths.map((path) => {
          const artifact = artifacts.find((a) => a.path === path);
          if (!artifact) return null;
          const Icon = kindIcon[artifact.kind] ?? FileText;
          const isActive = path === activePath;

          return (
            <button
              key={path}
              onClick={() => setActivePath(path)}
              className={cn(
                "group flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors duration-[var(--duration-fast)]",
                isActive
                  ? "border-b-2 border-[var(--brand-primary)] bg-[var(--bg-card)] text-[var(--foreground)]"
                  : "text-[var(--foreground-50)] hover:text-[var(--foreground-70)] hover:bg-[var(--bg-card-hover)]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[120px] truncate">{fileName(path)}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(path);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    closeTab(path);
                  }
                }}
                className="ml-1 hidden rounded-[var(--radius-sm)] p-0.5 hover:bg-[var(--foreground-10)] group-hover:inline-flex"
              >
                <X className="h-3 w-3" />
              </span>
            </button>
          );
        })}

        {/* File list dropdown trigger for unopened files */}
        {artifacts.length > openPaths.length && (
          <div className="relative ml-auto px-2">
            <select
              className="appearance-none bg-transparent text-[11px] text-[var(--foreground-40)] outline-none cursor-pointer"
              value=""
              onChange={(e) => {
                if (e.target.value) openTab(e.target.value);
              }}
            >
              <option value="" disabled>
                + Open file...
              </option>
              {artifacts
                .filter((a) => !openPaths.includes(a.path))
                .map((a) => (
                  <option key={a.path} value={a.path}>
                    {fileName(a.path)}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Content area */}
      {activeArtifact ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Metadata bar */}
          <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-1.5">
            <span className="text-[11px] text-[var(--text-tertiary)] truncate">
              {activeArtifact.path}
            </span>
            <Badge variant="outline" className="shrink-0">
              {activeArtifact.kind}
            </Badge>
            <span className="ml-auto text-[10px] text-[var(--text-muted)]">
              {formatRelativeTime(activeArtifact.updatedAt)}
            </span>
          </div>

          {/* Code area with line numbers */}
          <div className="flex-1 overflow-auto">
            <div className="flex min-w-0">
              {/* Line numbers gutter */}
              <div
                className="sticky left-0 shrink-0 select-none border-r border-[var(--border-subtle)] bg-[var(--bg-card-secondary)] px-3 py-3 text-right font-mono text-[11px] leading-5 text-[var(--foreground-20)]"
                aria-hidden
              >
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code content */}
              <pre className="flex-1 overflow-x-auto whitespace-pre px-4 py-3 font-mono text-[12px] leading-5 text-[var(--foreground)]">
                <code>{activeArtifact.content}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-[var(--text-muted)]">
          No artifacts open
        </div>
      )}
    </div>
  );
}
