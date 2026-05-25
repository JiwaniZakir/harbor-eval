"use client";

import { Search, Plus, Bell, Settings, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStore } from "@/lib/stores/project-store";

export function ChromeBar() {
  const project = useProjectStore((s) => s.project);
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const setSetupWizardOpen = useUIStore((s) => s.setSetupWizardOpen);
  const notificationCount = useUIStore((s) => s.notificationCount);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-chrome)] flex items-center justify-between px-4 py-3">
      {/* Left group */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="glass"
                size="icon-sm"
                className="rounded-full text-xs font-semibold"
              >
                <Compass size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Harbor Eval</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {project && (
          <div className="glass flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-success)]" />
            {project.name}
          </div>
        )}
      </div>

      {/* Right group */}
      <div className="pointer-events-auto flex items-center gap-1.5">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="glass"
                size="icon-sm"
                className="rounded-full"
                onClick={toggleCommandPalette}
              >
                <Search size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search (Cmd+K)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="glass"
                size="icon-sm"
                className="rounded-full"
                onClick={() => setSetupWizardOpen(true)}
              >
                <Plus size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Campaign</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="glass"
                size="icon-sm"
                className="relative rounded-full"
              >
                <Bell size={14} />
                {notificationCount > 0 && (
                  <Badge
                    variant="primary"
                    className="absolute -right-1 -top-1 h-3.5 min-w-[14px] px-1 text-[9px]"
                  >
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="glass"
                size="icon-sm"
                className="rounded-full"
              >
                <Settings size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
