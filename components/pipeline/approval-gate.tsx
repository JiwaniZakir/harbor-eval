"use client";

import { ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { ApprovalGate } from "@/lib/types";

export interface ApprovalGateViewProps {
  gate: ApprovalGate;
  onApprove?: (gateId: string) => void;
  onReject?: (gateId: string) => void;
  loading?: boolean;
  className?: string;
}

export function ApprovalGateView({
  gate,
  onApprove,
  onReject,
  loading,
  className,
}: ApprovalGateViewProps) {
  return (
    <Card
      className={cn(
        "border border-[var(--warning-border)] bg-[var(--warning-bg)]",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle>{gate.title}</CardTitle>
            <CardDescription>{gate.description}</CardDescription>
          </div>
          <Badge variant="warning" className="shrink-0">
            {gate.stage}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          {gate.candidateCount != null && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[var(--foreground)]">
                {gate.candidateCount}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Candidates
              </span>
            </div>
          )}
          {gate.promoteCount != null && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[var(--status-success)]">
                {gate.promoteCount}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Promoted
              </span>
            </div>
          )}
          {gate.taskSlug && (
            <div className="ml-auto">
              <Badge variant="outline">{gate.taskSlug}</Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => onApprove?.(gate.gateId)}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => onReject?.(gate.gateId)}
        >
          <ShieldX className="h-3.5 w-3.5" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
}
