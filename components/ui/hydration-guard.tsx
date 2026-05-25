"use client";

import { useState, useEffect, type ReactNode } from "react";

/**
 * Prevents hydration mismatches from Zustand persisted stores.
 * Renders children only after the client has mounted, showing a
 * minimal loading state during SSR/hydration.
 */
export function HydrationGuard({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--foreground-10)] border-t-[var(--brand-primary)]" />
          <span className="text-xs text-[var(--text-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
