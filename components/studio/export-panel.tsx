"use client";

import { useState } from "react";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/stores/agent-store";
import { useProjectStore } from "@/lib/stores/project-store";
import {
  toHarborFormat,
  materializeTaskPack,
  validateTaskPack,
  type ValidationResult,
} from "@/lib/harbor";

export function ExportPanel({ className }: { className?: string }) {
  const project = useProjectStore((s) => s.project);
  const artifacts = useAgentStore((s) => s.artifacts);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [exporting, setExporting] = useState(false);

  const artifactList = Object.values(artifacts);
  const hasArtifacts = artifactList.length > 0;

  const handleValidate = () => {
    if (!project || !hasArtifacts) return;

    const contentMap = new Map<string, string>();
    for (const a of artifactList) {
      contentMap.set(a.path, a.content);
    }

    const pack = toHarborFormat(contentMap, {
      projectName: project.name,
      taskSlug: project.slug,
      version: "1.0.0",
      timeoutSeconds: 300,
      maxTokens: 4096,
    });

    const result = validateTaskPack(pack);
    setValidation(result);

    if (result.valid) {
      toast("success", "Task pack validation passed.");
    } else {
      const errorCount = result.issues.filter(
        (i) => i.level === "error",
      ).length;
      toast("warning", `Validation found ${errorCount} error(s).`);
    }
  };

  const handleExport = async () => {
    if (!project || !hasArtifacts) return;
    setExporting(true);

    try {
      const contentMap = new Map<string, string>();
      for (const a of artifactList) {
        contentMap.set(a.path, a.content);
      }

      const pack = toHarborFormat(contentMap, {
        projectName: project.name,
        taskSlug: project.slug,
        version: "1.0.0",
        timeoutSeconds: 300,
        maxTokens: 4096,
      });

      const materialized = materializeTaskPack(pack);

      // Build a JSON bundle for download
      const bundle: Record<string, string> = {};
      for (const [path, content] of materialized) {
        bundle[path] = content;
      }

      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.slug}-harbor-task-pack.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast("success", "Task pack exported successfully.");
    } catch (error) {
      toast(
        "error",
        error instanceof Error ? error.message : "Export failed.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Harbor Export
        </h3>
        <Badge variant={hasArtifacts ? "success" : "default"}>
          {artifactList.length} artifact{artifactList.length !== 1 && "s"}
        </Badge>
      </div>

      {!hasArtifacts && (
        <p className="text-xs text-[var(--text-muted)]">
          Run the agent to generate task artifacts before exporting.
        </p>
      )}

      {hasArtifacts && (
        <>
          {/* File list preview */}
          <div className="flex flex-col gap-0.5">
            {artifactList.slice(0, 6).map((a) => (
              <div
                key={a.path}
                className="flex items-center gap-2 text-xs text-[var(--foreground-60)]"
              >
                <FileText size={10} className="shrink-0" />
                <span className="truncate font-mono">{a.path}</span>
              </div>
            ))}
            {artifactList.length > 6 && (
              <span className="text-[10px] text-[var(--text-muted)]">
                +{artifactList.length - 6} more
              </span>
            )}
          </div>

          {/* Validation results */}
          {validation && (
            <div className="flex flex-col gap-1 rounded-[var(--radius-sm)] bg-[var(--foreground-5)] p-2">
              <div className="flex items-center gap-1.5">
                {validation.valid ? (
                  <CheckCircle2
                    size={12}
                    className="text-[var(--status-success)]"
                  />
                ) : (
                  <XCircle
                    size={12}
                    className="text-[var(--status-error)]"
                  />
                )}
                <span className="text-xs font-medium">
                  {validation.valid ? "Valid" : "Issues found"}
                </span>
              </div>
              {validation.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-1.5 text-[10px]"
                >
                  {issue.level === "error" ? (
                    <XCircle
                      size={10}
                      className="mt-0.5 shrink-0 text-[var(--status-error)]"
                    />
                  ) : (
                    <AlertTriangle
                      size={10}
                      className="mt-0.5 shrink-0 text-[var(--status-warning)]"
                    />
                  )}
                  <span className="text-[var(--text-muted)]">
                    <span className="font-mono">{issue.file}</span>:{" "}
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidate}
              className="flex-1"
            >
              <CheckCircle2 size={12} />
              Validate
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="flex-1"
            >
              {exporting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              Export
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
