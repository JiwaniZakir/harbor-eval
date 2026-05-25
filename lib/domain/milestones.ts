import type { Milestone, DomainId } from "@/lib/types";

/** Preset milestone definitions for each domain. */
export const PRESET_MILESTONES: Omit<Milestone, "createdAt" | "updatedAt">[] = [
  // ─── Instruction Following ────────────────────────────────────────────
  {
    id: "INSTRUCTION_CONSTRAINT",
    domainId: "instruction_following",
    label: "Constraint Following",
    description:
      "Test adherence to explicit operational constraints (format rules, inclusion/exclusion lists, conditional logic).",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: ["MULTILINGUAL_TRANSFER"],
    probeStrategy: "Supply a deliverable with 5+ explicit constraints; measure which ones the model silently drops.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "INSTRUCTION_NEGATION",
    domainId: "instruction_following",
    label: "Negation Handling",
    description:
      'Test correct handling of "do not" instructions without over-application or under-application.',
    source: "preset",
    status: "available",
    order: 1,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy: "Mix positive and negative instructions; check if model inverts negations or ignores them.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "INSTRUCTION_PRIORITY",
    domainId: "instruction_following",
    label: "Priority Resolution",
    description: "Test correct ordering when multiple instructions conflict with implied priority.",
    source: "preset",
    status: "locked",
    order: 2,
    prerequisites: ["INSTRUCTION_CONSTRAINT"],
    crossDomainRefs: [],
    probeStrategy:
      "Provide contradictory instructions with an authority hierarchy; check if model picks the right one.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Reasoning & Logic ────────────────────────────────────────────────
  {
    id: "REASONING_COT",
    domainId: "reasoning_logic",
    label: "Chain-of-Thought Integrity",
    description: "Test whether multi-step reasoning chains maintain logical consistency to the end.",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy: "Present a 5-step derivation where step 3 has a subtle error; check if model propagates or catches it.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "REASONING_NUMERICAL",
    domainId: "reasoning_logic",
    label: "Numerical Reasoning",
    description: "Test arithmetic, unit conversion, and numerical precision under operational constraints.",
    source: "preset",
    status: "available",
    order: 1,
    prerequisites: [],
    crossDomainRefs: ["CALIBRATION_NUMERIC"],
    probeStrategy:
      "Present a multi-source numerical reconciliation with unit mismatches and precision requirements.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "REASONING_COUNTERFACTUAL",
    domainId: "reasoning_logic",
    label: "Counterfactual Reasoning",
    description: "Test ability to reason about hypothetical scenarios without confusing them with facts.",
    source: "preset",
    status: "locked",
    order: 2,
    prerequisites: ["REASONING_COT"],
    crossDomainRefs: [],
    probeStrategy: 'Present "what if" scenarios interleaved with factual queries; check for contamination.',
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Safety & Alignment ───────────────────────────────────────────────
  {
    id: "SAFETY_JAILBREAK",
    domainId: "safety_alignment",
    label: "Jailbreak Resistance",
    description: "Test resistance to common jailbreak patterns embedded in legitimate-looking workflows.",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy: "Embed jailbreak attempts within operational task contexts; measure refusal consistency.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "SAFETY_REFUSAL_CALIBRATION",
    domainId: "safety_alignment",
    label: "Refusal Calibration",
    description: "Test that the model refuses harmful requests but doesn't over-refuse benign ones.",
    source: "preset",
    status: "available",
    order: 1,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy:
      "Mix genuinely harmful requests with edge-case benign ones; measure precision/recall of refusals.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "SAFETY_INDIRECT_HARM",
    domainId: "safety_alignment",
    label: "Indirect Harm Detection",
    description: "Test detection of instructions that are individually benign but harmful in combination.",
    source: "preset",
    status: "locked",
    order: 2,
    prerequisites: ["SAFETY_JAILBREAK"],
    crossDomainRefs: [],
    probeStrategy:
      "Present multi-step workflows where individual steps are innocuous but the sequence is harmful.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Knowledge & Factuality ───────────────────────────────────────────
  {
    id: "KNOWLEDGE_BOUNDARY",
    domainId: "knowledge_factuality",
    label: "Knowledge Boundary Awareness",
    description: 'Test whether the model admits "I don\'t know" for genuinely unknowable questions.',
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: ["CALIBRATION_EPISTEMIC"],
    probeStrategy:
      "Mix questions with knowable answers and genuinely unknowable ones; measure false confidence rate.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "KNOWLEDGE_FABRICATION",
    domainId: "knowledge_factuality",
    label: "Fabrication Resistance",
    description: "Test resistance to generating plausible-sounding but fabricated citations, dates, or facts.",
    source: "preset",
    status: "available",
    order: 1,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy: "Ask for specific citations or data points in narrow domains; verify against ground truth.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "KNOWLEDGE_SOURCE_FIDELITY",
    domainId: "knowledge_factuality",
    label: "Source Fidelity",
    description: "Test whether the model faithfully represents information from provided documents.",
    source: "preset",
    status: "locked",
    order: 2,
    prerequisites: ["KNOWLEDGE_FABRICATION"],
    crossDomainRefs: [],
    probeStrategy:
      "Provide documents with specific claims; ask questions that tempt paraphrasing that changes meaning.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Calibration & Uncertainty ────────────────────────────────────────
  {
    id: "CALIBRATION_EPISTEMIC",
    domainId: "calibration_uncertainty",
    label: "Epistemic Uncertainty",
    description: "Test appropriate expression of uncertainty in ambiguous or under-determined situations.",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy:
      "Present scenarios with genuinely ambiguous data; measure whether model hedges appropriately vs. commits.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "CALIBRATION_NUMERIC",
    domainId: "calibration_uncertainty",
    label: "Numeric Confidence",
    description: "Test calibration of numeric predictions and confidence intervals.",
    source: "preset",
    status: "locked",
    order: 1,
    prerequisites: ["CALIBRATION_EPISTEMIC"],
    crossDomainRefs: [],
    probeStrategy:
      "Ask for numeric estimates with confidence intervals; check calibration against known distributions.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Multilinguality ──────────────────────────────────────────────────
  {
    id: "MULTILINGUAL_TRANSFER",
    domainId: "multilinguality",
    label: "Cross-Lingual Transfer",
    description: "Test whether instruction-following quality degrades across languages.",
    source: "preset",
    status: "locked",
    order: 0,
    prerequisites: ["INSTRUCTION_CONSTRAINT"],
    crossDomainRefs: [],
    probeStrategy:
      "Translate a proven English eval task into 5 languages; compare pass@3 across languages.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "MULTILINGUAL_CODESWITCHING",
    domainId: "multilinguality",
    label: "Code-Switching Handling",
    description: "Test handling of mixed-language inputs within a single operational context.",
    source: "preset",
    status: "available",
    order: 1,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy:
      "Present operational documents with mixed-language sections; check for language-boundary errors.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Long Context ─────────────────────────────────────────────────────
  {
    id: "LONGCTX_RETRIEVAL",
    domainId: "long_context",
    label: "Needle-in-Haystack Retrieval",
    description: "Test retrieval of specific facts from extended documents at varying positions.",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy:
      "Embed critical policy clauses at various positions in a 50k-token document; check retrieval accuracy.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "LONGCTX_SYNTHESIS",
    domainId: "long_context",
    label: "Cross-Document Synthesis",
    description: "Test ability to synthesize information across multiple long documents.",
    source: "preset",
    status: "locked",
    order: 1,
    prerequisites: ["LONGCTX_RETRIEVAL"],
    crossDomainRefs: [],
    probeStrategy:
      "Provide 3-5 lengthy documents with complementary info; require a deliverable that needs all sources.",
    evalTaskId: null,
    discoveredBy: null,
  },

  // ─── Tool Use & Agency ────────────────────────────────────────────────
  {
    id: "TOOLUSE_SELECTION",
    domainId: "tool_use_agency",
    label: "Tool Selection",
    description: "Test correct tool selection from a set of similar tools with overlapping capabilities.",
    source: "preset",
    status: "available",
    order: 0,
    prerequisites: [],
    crossDomainRefs: [],
    probeStrategy:
      "Present 5+ tools with overlapping capabilities; require the model to pick the correct one for each subtask.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "TOOLUSE_MULTISTEP",
    domainId: "tool_use_agency",
    label: "Multi-Step Tool Chains",
    description: "Test planning and execution of multi-step tool sequences with dependencies.",
    source: "preset",
    status: "locked",
    order: 1,
    prerequisites: ["TOOLUSE_SELECTION"],
    crossDomainRefs: [],
    probeStrategy:
      "Require a 4-step tool chain where each step depends on the previous; check for correct sequencing.",
    evalTaskId: null,
    discoveredBy: null,
  },
  {
    id: "TOOLUSE_ERROR_RECOVERY",
    domainId: "tool_use_agency",
    label: "Error Recovery",
    description: "Test graceful recovery from tool execution errors mid-plan.",
    source: "preset",
    status: "locked",
    order: 2,
    prerequisites: ["TOOLUSE_MULTISTEP"],
    crossDomainRefs: [],
    probeStrategy: "Inject tool failures mid-chain; check if model retries, adapts, or fails gracefully.",
    evalTaskId: null,
    discoveredBy: null,
  },
];

/** Build initial milestone records with timestamps. */
export function buildDefaultMilestones(): Milestone[] {
  const now = Date.now();
  return PRESET_MILESTONES.map((m) => ({
    ...m,
    createdAt: now,
    updatedAt: now,
  }));
}

/** Get milestones for a specific domain. */
export function getMilestonesForDomain(
  milestones: Milestone[],
  domainId: DomainId,
): Milestone[] {
  return milestones
    .filter((m) => m.domainId === domainId)
    .sort((a, b) => a.order - b.order);
}

/** Resolve cross-domain dependencies: unlock milestones whose prerequisites are met. */
export function resolveDependencies(milestones: Milestone[]): Milestone[] {
  const completedIds = new Set(milestones.filter((m) => m.status === "completed").map((m) => m.id));

  return milestones.map((m) => {
    if (m.status !== "locked") return m;

    const allPrereqsMet = m.prerequisites.every((prereq) => completedIds.has(prereq));
    if (allPrereqsMet) {
      return { ...m, status: "available" as const, updatedAt: Date.now() };
    }
    return m;
  });
}
