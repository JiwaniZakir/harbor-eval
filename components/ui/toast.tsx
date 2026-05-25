"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastLevel = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  level: ToastLevel;
  message: string;
  duration?: number;
}

let toastId = 0;
const listeners = new Set<(toast: Toast) => void>();

/** Fire a toast from anywhere (no hook required) */
export function toast(level: ToastLevel, message: string, duration = 4000) {
  const t: Toast = { id: `toast-${++toastId}`, level, message, duration };
  listeners.forEach((fn) => fn(t));
}

const icons: Record<ToastLevel, React.ReactNode> = {
  info: <Info size={14} />,
  success: <CheckCircle2 size={14} />,
  warning: <AlertTriangle size={14} />,
  error: <AlertCircle size={14} />,
};

const styles: Record<ToastLevel, string> = {
  info: "border-[var(--brand-primary)]/30 bg-[var(--accent-muted)] text-[var(--brand-primary)]",
  success: "border-[var(--status-success)]/30 bg-[var(--success-bg)] text-[var(--success-text)]",
  warning: "border-[var(--status-warning)]/30 bg-[var(--warning-bg)] text-[var(--warning-text)]",
  error: "border-[var(--status-error)]/30 bg-[var(--error-bg)] text-[var(--error-text)]",
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (t.duration && t.duration > 0) {
      const timer = setTimeout(() => onDismiss(t.id), t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, t.duration, onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3.5 py-2.5 text-sm shadow-[var(--shadow-md)] backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-right-full",
        styles[t.level],
      )}
    >
      <span className="shrink-0">{icons[t.level]}</span>
      <span className="flex-1 text-[13px] font-medium">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded-full p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => setToasts((prev) => [...prev.slice(-4), t]);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const dismiss = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[var(--z-toast,9999)] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
