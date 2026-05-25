// ─── Agent Types ─────────────────────────────────────────────────────────────

export type AgentPhase =
  | "intake"
  | "weakness"
  | "probe"
  | "decision"
  | "scaffold"
  | "fixtures"
  | "verifier"
  | "sweep"
  | "audit"
  | "iteration"
  | "publish";

export type ChatRole = "user" | "assistant" | "system";

export type ToolName =
  | "list_workspace"
  | "read_artifact"
  | "write_artifact"
  | "intake_workflow"
  | "map_workflow_weaknesses"
  | "batch_probe_candidates"
  | "render_probe_decision_report"
  | "run_probe_variants"
  | "lint_spoilers"
  | "generate_fixtures"
  | "scaffold_task"
  | "run_harbor_sweep"
  | "audit_trajectory"
  | "propose_iteration"
  | "set_phase";

export type ToolCallStatus = "queued" | "running" | "succeeded" | "failed";

export interface ToolCall {
  id: string;
  name: ToolName;
  args: Record<string, unknown>;
  status: ToolCallStatus;
  result?: unknown;
  startedAt: number;
  finishedAt?: number;
  summary?: string;
}

export interface PlanStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  toolCalls?: ToolCall[];
  plan?: PlanStep[];
  phase?: AgentPhase;
  pending?: boolean;
}

// ─── Artifact Types ──────────────────────────────────────────────────────────

export type ArtifactKind =
  | "markdown"
  | "toml"
  | "python"
  | "json"
  | "shell"
  | "csv"
  | "yaml"
  | "diff";

export interface Artifact {
  path: string;
  kind: ArtifactKind;
  content: string;
  badge?: string;
  updatedAt: number;
  dirty?: boolean;
  taskSlug?: string;
}

// ─── Domain Types ────────────────────────────────────────────────────────────

export type DomainId =
  | "instruction_following"
  | "reasoning_logic"
  | "safety_alignment"
  | "knowledge_factuality"
  | "calibration_uncertainty"
  | "multilinguality"
  | "long_context"
  | "tool_use_agency";

export interface ProbingDomain {
  id: DomainId;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  icon: string;
  order: number;
}

export type DomainStatus =
  | "locked"
  | "available"
  | "probing"
  | "paused"
  | "reviewing"
  | "completed";

export interface DomainState {
  domainId: DomainId;
  status: DomainStatus;
  progress: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  activeMilestoneId: string | null;
  agentId: string | null;
}

// ─── Milestone Types ─────────────────────────────────────────────────────────

export type MilestoneSource = "preset" | "ai_discovered" | "user_created";

export type MilestoneStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "probing"
  | "building"
  | "validating"
  | "completed"
  | "failed"
  | "skipped";

export interface Milestone {
  id: string;
  domainId: DomainId;
  label: string;
  description: string;
  source: MilestoneSource;
  status: MilestoneStatus;
  order: number;
  prerequisites: string[];
  crossDomainRefs: string[];
  probeStrategy: string;
  evalTaskId: string | null;
  discoveredBy: string | null;
  createdAt: number;
  updatedAt: number;
}

// ─── Task Types ──────────────────────────────────────────────────────────────

export type TaskPhase =
  | "intake"
  | "weakness_mapping"
  | "probing"
  | "decision"
  | "scaffolding"
  | "fixtures"
  | "verifier"
  | "sweep"
  | "audit"
  | "iteration"
  | "published";

export type FailureModeSlug =
  | "authority_ambiguity"
  | "false_recency"
  | "wrong_source"
  | "phantom_join"
  | "tie_breaking"
  | "null_cascade"
  | "provenance"
  | "lifecycle";

export interface WeaknessCard {
  weaknessTitle: string;
  domain: string;
  deliverable: string;
  hypothesis: string;
  badHeuristic: string;
  authorityInvariant: string;
  taxonomySlug: FailureModeSlug;
  workflowFitScore: number;
  verifierStrategy: string;
}

export interface WeaknessCandidate extends WeaknessCard {
  slug: string;
  status: "candidate" | "approved" | "rejected" | "promoted" | "redesign";
}

// ─── Project Types ───────────────────────────────────────────────────────────

export type ProjectStatus = "setup" | "active" | "paused" | "reviewing" | "completed";

export interface TargetModelConfig {
  provider: "openai" | "anthropic" | "google";
  model: string;
  apiKey?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  targetModel: TargetModelConfig;
  auditorModel: string;
  status: ProjectStatus;
  globalProgress: number;
  createdAt: number;
  updatedAt: number;
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export type SidebarTab = "home" | "agent" | "domains" | "tasks" | "library";

export interface DetailPanelPayload {
  kind: "domain" | "milestone" | "task" | "artifact";
  domainId?: DomainId;
  milestoneId?: string;
  taskId?: string;
  artifactPath?: string;
}

export interface SuggestedProbe {
  id: string;
  domainId: DomainId;
  milestoneId: string;
  label: string;
  description: string;
  priority: number;
}

// ─── Canvas Types ────────────────────────────────────────────────────────────

export type CanvasNodeType = "center" | "domain" | "milestone" | "activity";

export interface CanvasConfig {
  zoom: number;
  center: { x: number; y: number };
  selectedNodeId: string | null;
}

// ─── Agent Run Types ─────────────────────────────────────────────────────────

export type AgentLifecycle =
  | "idle"
  | "initializing"
  | "probing"
  | "analyzing"
  | "building"
  | "validating"
  | "awaiting_approval"
  | "complete"
  | "error";

export interface AgentRun {
  id: string;
  projectId: string;
  domainId: DomainId;
  milestoneId: string;
  lifecycle: AgentLifecycle;
  messages: ChatMessage[];
  currentPlan: PlanStep[];
  toolCalls: ToolCall[];
  startedAt: number;
  finishedAt?: number;
  error?: string;
}

// ─── Approval Gate ───────────────────────────────────────────────────────────

export interface ApprovalGate {
  gateId: string;
  title: string;
  description: string;
  stage: string;
  candidateCount?: number;
  promoteCount?: number;
  taskSlug?: string;
}

// ─── Agent Events ────────────────────────────────────────────────────────────

export type AgentEvent =
  | { type: "phase"; phase: AgentPhase }
  | { type: "plan"; plan: PlanStep[] }
  | { type: "text"; delta: string }
  | { type: "tool_call_start"; call: ToolCall }
  | {
      type: "tool_call_finish";
      id: string;
      result: unknown;
      summary?: string;
      status?: ToolCallStatus;
    }
  | { type: "artifact"; artifact: Artifact }
  | { type: "probe_summary"; summary: ProbeSummary }
  | { type: "probe_batch_summary"; summaries: ProbeSummary[] }
  | { type: "weakness_report"; report: WeaknessReport }
  | { type: "sweep_update"; summary: SweepSummary }
  | { type: "approval_gate"; gate: ApprovalGate }
  | { type: "notice"; notice: Notice }
  | { type: "done"; summary: string }
  | { type: "error"; message: string };

// ─── Weakness & Probe Types ─────────────────────────────────────────────────

export interface WeaknessReport {
  workflowDescription: string;
  candidates: WeaknessCandidate[];
  createdAt: number;
}

export interface ProbeSummary {
  weaknessTitle: string;
  variants: Array<{
    variant: string;
    failureRate: number;
    trials: number;
    failures: number;
  }>;
  verdict: "promote" | "redesign" | "reject";
}

// ─── Sweep & Audit Types ────────────────────────────────────────────────────

export interface SweepTrial {
  idx: number;
  reward: number;
  status: "queued" | "running" | "passed" | "failed";
  summary: string;
}

export interface SweepSummary {
  taskSlug: string;
  passAt3: string;
  trials: SweepTrial[];
  cascade?: Array<{ id: string; label: string; status: string }>;
}

export interface SpoilerFinding {
  artifactPath: string;
  line: number;
  severity: "low" | "medium" | "high";
  ruleId: string;
  message: string;
}

export interface AuditSummary {
  auditorModel: string;
  classification: string;
  rationale: string;
  steps?: Array<{
    id: string;
    label: string;
    kind: "model" | "tool" | "verifier" | "notice";
    excerpt?: string;
    reward?: number;
    failed?: boolean;
  }>;
}

export interface DecisionReportEntry {
  slug: string;
  weaknessTitle: string;
  verdict: ProbeSummary["verdict"];
  aggregateFailureRate: number;
  recommendedAction: string;
}

// ─── Eval Task ───────────────────────────────────────────────────────────────

export interface EvalTask {
  id: string;
  projectId: string;
  domainId: DomainId;
  milestoneId: string;
  slug: string;
  title: string;
  phase: TaskPhase;
  weaknessCard: WeaknessCard | null;
  probeSummary: ProbeSummary | null;
  sweepSummary: SweepSummary | null;
  artifacts: Artifact[];
  createdAt: number;
  updatedAt: number;
}

// ─── Notice ──────────────────────────────────────────────────────────────────

export interface Notice {
  id: string;
  level: "info" | "warning" | "error" | "success";
  message: string;
  createdAt: number;
}
