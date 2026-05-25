"use client";

import { useState } from "react";
import { X, Key, Cpu, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { modelRegistry, type LlmProvider } from "@/lib/ai/providers";
import { useProjectStore } from "@/lib/stores/project-store";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const project = useProjectStore((s) => s.project);
  const setTargetModel = useProjectStore((s) => s.setTargetModel);

  const [activeTab, setActiveTab] = useState<"keys" | "model">("keys");
  const [keys, setKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
  });

  if (!open) return null;

  const tabs = [
    { id: "keys" as const, label: "API Keys", icon: Key },
    { id: "model" as const, label: "Model", icon: Cpu },
  ];

  const handleSaveKeys = () => {
    // In production, these would be stored securely server-side
    // For now, just show a toast
    toast("success", "API keys saved for this session.");
  };

  const handleModelSelect = (provider: LlmProvider, model: string) => {
    setTargetModel({ provider, model });
    toast("success", `Target model set to ${model}`);
  };

  return (
    <div className="fixed inset-0 z-[var(--z-dialog,100)]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md animate-in slide-in-from-right border-l border-[var(--border-subtle)] bg-[var(--bg-app)] shadow-[var(--shadow-lg)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Settings</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-subtle)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]",
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5">
          {activeTab === "keys" && (
            <div className="flex flex-col gap-5">
              <p className="text-xs text-[var(--text-muted)]">
                API keys are stored in your browser and sent directly to providers. They are never
                stored on our servers.
              </p>

              {(["openai", "anthropic", "google"] as const).map((provider) => (
                <div key={provider} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium capitalize text-[var(--text-secondary)]">
                    {provider} API Key
                  </label>
                  <Input
                    type="password"
                    placeholder={
                      provider === "openai"
                        ? "sk-..."
                        : provider === "anthropic"
                          ? "sk-ant-..."
                          : "AI..."
                    }
                    value={keys[provider]}
                    onChange={(e) => setKeys((k) => ({ ...k, [provider]: e.target.value }))}
                  />
                </div>
              ))}

              <Button variant="primary" size="sm" className="self-end" onClick={handleSaveKeys}>
                <Save size={14} />
                Save Keys
              </Button>
            </div>
          )}

          {activeTab === "model" && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--text-muted)]">
                Select the target model to evaluate. The auditor model is automatically chosen as a
                cross-provider alternative.
              </p>

              {project && (
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
                  <span className="text-xs text-[var(--text-muted)]">Current target:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="primary">{project.targetModel.provider}</Badge>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {project.targetModel.model}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {(["openai", "anthropic", "google"] as const).map((provider) => {
                  const models = modelRegistry.filter((m) => m.provider === provider);
                  return (
                    <div key={provider}>
                      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        {provider}
                      </h4>
                      <div className="flex flex-col gap-1">
                        {models.map((m) => {
                          const isActive =
                            project?.targetModel.provider === m.provider &&
                            project?.targetModel.model === m.modelSlug;
                          return (
                            <button
                              key={m.modelSlug}
                              onClick={() => handleModelSelect(m.provider, m.modelSlug)}
                              className={cn(
                                "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors",
                                isActive
                                  ? "bg-[var(--accent-muted)] text-[var(--brand-primary)] font-medium"
                                  : "text-[var(--foreground)] hover:bg-[var(--foreground-5)]",
                              )}
                            >
                              <span className="flex-1">{m.label}</span>
                              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                {m.modelSlug}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
