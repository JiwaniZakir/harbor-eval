import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--foreground)] text-[var(--foreground-inverse)] hover:bg-[var(--foreground-90)] shadow-[var(--shadow-sm)]",
        primary:
          "bg-[var(--brand-primary)] text-white hover:bg-[var(--accent-hover)] shadow-[var(--shadow-sm)]",
        secondary:
          "bg-[var(--bg-card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] shadow-[var(--shadow-sm)]",
        ghost:
          "text-[var(--foreground-70)] hover:text-[var(--foreground)] hover:bg-[var(--foreground-5)]",
        outline:
          "border border-[var(--border)] text-[var(--foreground-70)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--foreground-5)]",
        destructive:
          "bg-[var(--status-error)] text-white hover:bg-[var(--status-error)]/90",
        link: "text-[var(--brand-primary)] underline-offset-4 hover:underline p-0 h-auto",
        glass:
          "glass text-[var(--foreground-70)] hover:text-[var(--foreground)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-sm",
        xl: "h-11 px-8 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
