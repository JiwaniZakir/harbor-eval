"use client";

import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";

export function EmptyCanvas() {
  const setSetupWizardOpen = useUIStore((s) => s.setSetupWizardOpen);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg)]">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, var(--foreground-10) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Center card */}
      <div className="animate-scale-in relative z-10 flex flex-col items-center gap-6 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-12 py-10 shadow-[var(--shadow-lg)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-muted)]">
          <Compass size={24} className="text-[var(--brand-primary)]" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Harbor Eval
          </h1>
          <p className="mt-1.5 max-w-[280px] text-sm text-[var(--text-secondary)]">
            Design evals that find where AI models fail. Start by creating a campaign.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => setSetupWizardOpen(true)}
          className="w-full"
        >
          Create Campaign
        </Button>

        <p className="text-xs text-[var(--text-muted)]">or import from existing suite</p>
      </div>
    </div>
  );
}
