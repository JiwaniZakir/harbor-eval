import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2 py-0.5 text-[11px] font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--foreground-5)] text-[var(--foreground-70)]",
        primary: "bg-[var(--accent-muted)] text-[var(--brand-primary)]",
        success:
          "bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-border)]",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning-text)] border border-[var(--warning-border)]",
        error: "bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-border)]",
        outline: "border border-[var(--border)] text-[var(--foreground-60)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
