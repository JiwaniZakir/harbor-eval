import type { ProbingDomain, DomainId, FailureModeSlug } from "@/lib/types";

// ─── 8 Probing Domains ──────────────────────────────────────────────────────

export const DOMAINS: ProbingDomain[] = [
  {
    id: "instruction_following",
    label: "Instruction Following",
    shortLabel: "Instructions",
    description:
      "Tests whether the model follows explicit constraints, formatting rules, and operational instructions without inventing shortcuts.",
    accent: "#4087F2",
    icon: "list-checks",
    order: 0,
  },
  {
    id: "reasoning_logic",
    label: "Reasoning & Logic",
    shortLabel: "Reasoning",
    description:
      "Tests multi-step reasoning, chain-of-thought integrity, and logical consistency under pressure.",
    accent: "#8A72E5",
    icon: "brain",
    order: 1,
  },
  {
    id: "safety_alignment",
    label: "Safety & Alignment",
    shortLabel: "Safety",
    description:
      "Tests refusal calibration, jailbreak resistance, and alignment under adversarial pressure.",
    accent: "#F46746",
    icon: "shield-alert",
    order: 2,
  },
  {
    id: "knowledge_factuality",
    label: "Knowledge & Factuality",
    shortLabel: "Knowledge",
    description:
      "Tests factual accuracy, knowledge boundary awareness, and resistance to plausible-sounding fabrications.",
    accent: "#80A740",
    icon: "book-open",
    order: 3,
  },
  {
    id: "calibration_uncertainty",
    label: "Calibration & Uncertainty",
    shortLabel: "Calibration",
    description:
      "Tests confidence calibration, appropriate hedging, and uncertainty expression under ambiguous inputs.",
    accent: "#B16A27",
    icon: "gauge",
    order: 4,
  },
  {
    id: "multilinguality",
    label: "Multilinguality",
    shortLabel: "Multilingual",
    description:
      "Tests cross-lingual transfer, code-switching handling, and language-specific constraint following.",
    accent: "#3AAFA9",
    icon: "languages",
    order: 5,
  },
  {
    id: "long_context",
    label: "Long Context",
    shortLabel: "Long Context",
    description:
      "Tests information retrieval, synthesis, and constraint adherence across extended input windows.",
    accent: "#E8596C",
    icon: "scroll-text",
    order: 6,
  },
  {
    id: "tool_use_agency",
    label: "Tool Use & Agency",
    shortLabel: "Tool Use",
    description:
      "Tests tool selection, argument construction, multi-step tool chains, and agentic planning.",
    accent: "#6C63FF",
    icon: "wrench",
    order: 7,
  },
];

export const DOMAIN_MAP: Record<DomainId, ProbingDomain> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
) as Record<DomainId, ProbingDomain>;

export function getDomain(id: DomainId): ProbingDomain {
  return DOMAIN_MAP[id];
}

/** Maps domain IDs to their Higgsfield-generated illustration paths */
export const DOMAIN_ILLUSTRATIONS: Record<DomainId, string> = {
  instruction_following: "/domains/instruction.png",
  reasoning_logic: "/domains/reasoning.png",
  safety_alignment: "/domains/safety.png",
  knowledge_factuality: "/domains/knowledge.png",
  calibration_uncertainty: "/domains/calibration.png",
  multilinguality: "/domains/multilingual.png",
  long_context: "/domains/longcontext.png",
  tool_use_agency: "/domains/tooluse.png",
};

// ─── Failure Mode Taxonomy ───────────────────────────────────────────────────

export interface FailureMode {
  slug: FailureModeSlug;
  name: string;
  shortName: string;
  description: string;
  badHeuristic: string;
  authorityInvariant: string;
}

export const FAILURE_MODES: FailureMode[] = [
  {
    slug: "authority_ambiguity",
    name: "Authority Ambiguity",
    shortName: "Authority",
    description:
      "The authority chain covers most conflicts but leaves a sanctioned subset unresolved.",
    badHeuristic: "Invent precedence to publish a confident release decision.",
    authorityInvariant: "Uncovered conflicts route to manual review with source labels.",
  },
  {
    slug: "false_recency",
    name: "False Recency",
    shortName: "Recency",
    description:
      "Fresh-looking artifacts are plausible, visible, and wrong for the decision.",
    badHeuristic: "Use the most recent source or max-of-recent rule.",
    authorityInvariant: "Planning policy names the authorized forecast source.",
  },
  {
    slug: "wrong_source",
    name: "Wrong / Stale Source",
    shortName: "Source",
    description:
      "Similar values exist across broker workpapers, supplier estimates, and policy sources.",
    badHeuristic: "Pick the complete or convenient source.",
    authorityInvariant: "Score value and source attribution independently.",
  },
  {
    slug: "phantom_join",
    name: "Phantom Joins",
    shortName: "Joins",
    description:
      "Near-matching identifiers invite normalization that no bridge policy authorizes.",
    badHeuristic: "Strip suffixes, pad zeroes, and substitute delimiters.",
    authorityInvariant: "Only sanctioned bridge rows can create matches.",
  },
  {
    slug: "tie_breaking",
    name: "Silent Tie-Breaking",
    shortName: "Ties",
    description:
      "The hierarchy resolves most rows but exhausts itself on active ties.",
    badHeuristic: "Pick the first eligible row to complete the workbook.",
    authorityInvariant: "Unresolved ties route to a price desk queue.",
  },
  {
    slug: "null_cascade",
    name: "Null / Invalid Cascade",
    shortName: "Cascade",
    description:
      "Invalid measurements tempt imputation that looks plausible downstream.",
    badHeuristic: "Impute, clamp, or default and keep rolling up.",
    authorityInvariant: "Invalid records must be excluded and traced.",
  },
  {
    slug: "provenance",
    name: "Provenance Confabulation",
    shortName: "Provenance",
    description:
      "The value is correct, but the cited source is a mirror or convenient artifact.",
    badHeuristic: "Cite any corroborating source.",
    authorityInvariant: "Field-level authoritative source maps are scored separately.",
  },
  {
    slug: "lifecycle",
    name: "Lifecycle / Revocation",
    shortName: "Lifecycle",
    description:
      "Direct revocation is easy; transitive revocation through dependency graphs is hard.",
    badHeuristic: "Trust portal active states and miss 2-hop revocation.",
    authorityInvariant: "Dependency traces determine release eligibility.",
  },
];
