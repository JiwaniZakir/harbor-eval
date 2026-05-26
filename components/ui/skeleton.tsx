"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Animated loading skeleton placeholder. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[var(--foreground-10)]",
        className,
      )}
    />
  );
}

/** Skeleton layout matching a domain detail panel. */
export function DomainDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Progress card */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-1 w-full" />
        <Skeleton className="mt-2 h-3 w-full" />
      </div>

      {/* Milestones header */}
      <Skeleton className="h-3 w-20" />

      {/* Milestone cards */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-3"
        >
          <div className="flex items-start gap-2.5">
            <Skeleton className="mt-0.5 h-3.5 w-3.5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton layout for sidebar home content. */
export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-1 h-3 w-44" />
      </div>
      <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3">
        <Skeleton className="mb-2 h-3 w-32" />
        <Skeleton className="h-1 w-full" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-2.5 py-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}
