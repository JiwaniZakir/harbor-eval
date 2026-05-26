"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg)] p-8 text-center font-sans">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground-5)]">
        <span className="text-3xl">◇</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--foreground-5)]"
      >
        Try again
      </button>
    </div>
  );
}
