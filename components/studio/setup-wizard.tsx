"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useDomainStore } from "@/lib/stores/domain-store";
import { DOMAINS } from "@/lib/domain/domains";
import type { DomainId, TargetModelConfig } from "@/lib/types";
import { X, ArrowRight, ArrowLeft, Rocket, Check } from "lucide-react";

type Provider = "openai" | "anthropic" | "google";

const PROVIDERS: { id: Provider; label: string; models: string[] }[] = [
  {
    id: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-mini", "o1-preview"],
  },
  {
    id: "anthropic",
    label: "Anthropic",
    models: ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
  },
  {
    id: "google",
    label: "Google",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
];

export function SetupWizard() {
  const isOpen = useUIStore((s) => s.setupWizardOpen);
  const setOpen = useUIStore((s) => s.setSetupWizardOpen);
  const initProject = useProjectStore((s) => s.initProject);
  const initDomains = useDomainStore((s) => s.initDomains);
  const refreshSuggested = useDomainStore((s) => s.refreshSuggestedProbes);

  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState("gpt-4o");
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>([
    "instruction_following",
    "reasoning_logic",
    "safety_alignment",
  ]);

  const canProceed = [
    name.trim().length > 0,
    true, // Provider always selected
    selectedDomains.length > 0,
    true, // Review step
  ];

  const steps = ["Name", "Model", "Domains", "Launch"];

  const handleLaunch = () => {
    setLaunching(true);
    // Brief delay so user sees the launching state
    setTimeout(() => {
      const config: TargetModelConfig = { provider, model };
      initProject(name, config);
      initDomains(selectedDomains);
      refreshSuggested();
      setOpen(false);
      // Reset wizard
      setStep(0);
      setLaunching(false);
      setName("");
    }, 400);
  };

  const toggleDomain = (id: DomainId) => {
    setSelectedDomains((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal)] bg-[var(--bg-overlay)] animate-fade-blur" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
          <Dialog.Title className="sr-only">Create Evaluation Campaign</Dialog.Title>
          <Dialog.Description className="sr-only">
            Step-by-step wizard to set up a new AI evaluation campaign.
          </Dialog.Description>
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-xl)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
              <div className="flex items-center gap-3">
                {/* Step dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((s, i) => (
                    <div
                      key={s}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        i <= step ? "bg-[var(--brand-primary)]" : "bg-[var(--foreground-10)]",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  Step {step + 1} of {steps.length}
                </span>
              </div>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon-sm">
                  <X size={14} />
                </Button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Step 1: Name */}
              {step === 0 && (
                <div className="animate-fade-blur space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">What are you evaluating?</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Give your evaluation campaign a descriptive name.
                    </p>
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="GPT-4o Customer Support Agent"
                    autoFocus
                    className="h-11 text-base"
                  />
                  <p className="text-xs text-[var(--text-muted)]">
                    This becomes the center of your evaluation canvas.
                  </p>
                </div>
              )}

              {/* Step 2: Model */}
              {step === 1 && (
                <div className="animate-fade-blur space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Which model?</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Select the AI model you want to evaluate.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setProvider(p.id);
                          setModel(p.models[0]);
                        }}
                        className={cn(
                          "rounded-[var(--radius-md)] border p-3 text-center transition-all",
                          provider === p.id
                            ? "border-[var(--brand-primary)] bg-[var(--accent-muted)] shadow-[var(--shadow-sm)]"
                            : "border-[var(--border)] hover:border-[var(--border-strong)]",
                        )}
                      >
                        <div className="text-sm font-medium">{p.label}</div>
                        {provider === p.id && (
                          <Check size={12} className="mx-auto mt-1 text-[var(--brand-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm"
                    >
                      {PROVIDERS.find((p) => p.id === provider)?.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Domains */}
              {step === 2 && (
                <div className="animate-fade-blur space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Focus domains</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Which capabilities do you want to evaluate? We recommend 3-5.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {DOMAINS.map((domain) => {
                      const isSelected = selectedDomains.includes(domain.id);
                      return (
                        <button
                          key={domain.id}
                          onClick={() => toggleDomain(domain.id)}
                          className={cn(
                            "flex items-start gap-2.5 rounded-[var(--radius-md)] border p-3 text-left transition-all",
                            isSelected
                              ? "border-[var(--border-strong)] bg-[var(--bg-card-hover)] shadow-[var(--shadow-sm)]"
                              : "border-[var(--border-subtle)] hover:border-[var(--border)]",
                          )}
                        >
                          <div
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                              isSelected
                                ? "border-transparent text-white"
                                : "border-[var(--border)]",
                            )}
                            style={{
                              backgroundColor: isSelected ? domain.accent : "transparent",
                            }}
                          >
                            {isSelected && <Check size={12} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium">{domain.shortLabel}</div>
                            <div className="mt-0.5 text-[10px] text-[var(--text-muted)] line-clamp-2">
                              {domain.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs text-[var(--text-muted)]">
                    Selected: {selectedDomains.length} domains
                  </div>
                </div>
              )}

              {/* Step 4: Review & Launch */}
              {step === 3 && (
                <div className="animate-fade-blur space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Ready to launch</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Review your campaign and launch when ready.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card-secondary)] p-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Campaign</span>
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Model</span>
                      <span className="text-sm">{model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Provider</span>
                      <span className="text-sm capitalize">{provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Domains</span>
                      <span className="text-sm">{selectedDomains.length} selected</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedDomains.map((id) => {
                        const d = DOMAINS.find((d) => d.id === id);
                        return (
                          <Badge key={id} variant="default">
                            {d?.shortLabel}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={14} />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed[step]}
                >
                  Continue
                  <ArrowRight size={14} />
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={handleLaunch} disabled={launching}>
                  {launching ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Rocket size={14} />
                      Launch Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
