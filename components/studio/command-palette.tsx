"use client";

import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { DOMAINS } from "@/lib/domain/domains";
import { Search, Settings, Plus, Bot, Home } from "lucide-react";
import type { DomainId } from "@/lib/types";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const isOpen = useUIStore((s) => s.commandPaletteOpen);
  const setOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setSidebarTab = useUIStore((s) => s.setSidebarTab);
  const setFocusedDomain = useUIStore((s) => s.setFocusedDomain);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const setSetupWizardOpen = useUIStore((s) => s.setSetupWizardOpen);

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: "home",
      label: "Go to Home",
      icon: <Home size={16} />,
      action: () => {
        setSidebarTab("home");
        setOpen(false);
      },
      category: "Navigation",
    },
    {
      id: "agent",
      label: "Open Agent Chat",
      icon: <Bot size={16} />,
      action: () => {
        setSidebarTab("agent");
        setOpen(false);
      },
      category: "Navigation",
    },
    {
      id: "new-campaign",
      label: "New Campaign",
      description: "Create a new evaluation campaign",
      icon: <Plus size={16} />,
      action: () => {
        setSetupWizardOpen(true);
        setOpen(false);
      },
      category: "Actions",
    },
    ...DOMAINS.map((domain) => ({
      id: `domain-${domain.id}`,
      label: domain.label,
      description: domain.description,
      icon: <div className="h-3 w-3 rounded-full" style={{ backgroundColor: domain.accent }} />,
      action: () => {
        setFocusedDomain(domain.id as DomainId);
        openDetailPanel({ kind: "domain" as const, domainId: domain.id as DomainId });
        setOpen(false);
      },
      category: "Domains",
    })),
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={16} />,
      action: () => setOpen(false),
      category: "Actions",
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    },
    [filtered, selectedIndex],
  );

  // Group by category
  const grouped = filtered.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, CommandItem[]>,
  );

  let flatIndex = -1;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-command)] bg-black/40 animate-fade-blur" />
        <Dialog.Content className="fixed left-1/2 top-[20%] z-[var(--z-command)] w-full max-w-[520px] -translate-x-1/2 animate-slide-down">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-xl)]">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
              <Search size={16} className="shrink-0 text-[var(--foreground-40)]" />
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands, domains..."
                className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-muted)]"
                autoFocus
              />
              <kbd className="rounded-[4px] border border-[var(--border)] bg-[var(--bg-raised)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto p-1.5">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {category}
                  </div>
                  {items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left transition-colors",
                          idx === selectedIndex
                            ? "bg-[var(--foreground-5)]"
                            : "hover:bg-[var(--foreground-5)]",
                        )}
                      >
                        <span className="shrink-0 text-[var(--foreground-40)]">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-[var(--foreground)]">{item.label}</div>
                          {item.description && (
                            <div className="truncate text-xs text-[var(--text-muted)]">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No results found
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
