// Re-export all types from the canonical location
// This file exists for backward compatibility with ported backend code
export type {
  AgentPhase,
  ChatRole,
  ToolName,
  ToolCallStatus,
  ToolCall,
  PlanStep,
  ChatMessage,
  ArtifactKind,
  Artifact,
  WeaknessCandidate,
  WeaknessReport,
  ProbeSummary,
  SweepSummary,
  SpoilerFinding,
  AuditSummary,
  DecisionReportEntry,
  ApprovalGate,
  AgentEvent,
  FailureModeSlug,
  DomainId,
} from "@/lib/types";

// WorkspaceState: the agent's working context during a task pipeline run
import type {
  AgentPhase,
  Artifact,
  ProbeSummary,
  SweepSummary,
  SpoilerFinding,
  AuditSummary,
} from "@/lib/types";

export interface WorkspaceState {
  projectId: string;
  projectName: string;
  targetModel: string;
  auditorModel: string;
  runner: string;
  runConfigHash: string;
  phase: AgentPhase;
  artifacts: Record<string, Artifact>;
  probeSummary?: ProbeSummary;
  sweepSummary?: SweepSummary;
  spoilerFindings?: SpoilerFinding[];
  audit?: AuditSummary;
}
