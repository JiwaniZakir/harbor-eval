import type { SpoilerFinding } from "@/lib/types";

interface SpoilerRule {
  id: string;
  severity: SpoilerFinding["severity"];
  pattern: RegExp;
  message: string;
}

/**
 * Regex-based spoiler detection rules.
 * These catch common patterns where answers, expected outputs, or oracle
 * hints leak into task artifacts that the evaluated model should not see.
 */
const SPOILER_RULES: SpoilerRule[] = [
  {
    id: "answer_literal",
    severity: "high",
    pattern: /\b(?:answer|correct_answer|expected_answer)\s*[:=]\s*.+/gi,
    message: "Literal answer assignment found — may leak the expected output.",
  },
  {
    id: "expected_output",
    severity: "high",
    pattern: /\b(?:expected[_\s]?output|gold[_\s]?label|ground[_\s]?truth)\s*[:=]\s*.+/gi,
    message: "Expected output or gold label visible in artifact.",
  },
  {
    id: "assert_equals_literal",
    severity: "medium",
    pattern: /assert\w*\s*\(\s*(?:result|output|response)\s*[=!]=\s*["'].+["']\s*\)/gi,
    message: "Assertion with hardcoded expected value — may reveal the answer.",
  },
  {
    id: "oracle_hint",
    severity: "high",
    pattern: /\b(?:hint|oracle|cheat|solution)\s*[:=]\s*.+/gi,
    message: "Oracle hint or solution label detected.",
  },
  {
    id: "todo_answer",
    severity: "low",
    pattern: /(?:#|\/\/)\s*(?:TODO|FIXME|HACK).*(?:answer|solution|expected)/gi,
    message: "Comment references an answer or solution — review for leakage.",
  },
  {
    id: "json_answer_key",
    severity: "high",
    pattern: /"(?:answer|solution|expected_result|correct_output)"\s*:\s*"[^"]+"/g,
    message: "JSON key contains answer data that may be visible to the agent.",
  },
  {
    id: "inline_expected",
    severity: "medium",
    pattern: /(?:should\s+(?:be|return|output|equal))\s+["'`].+["'`]/gi,
    message: "Inline expectation phrase with quoted value.",
  },
  {
    id: "pass_fail_mapping",
    severity: "medium",
    pattern: /\bif\b.*(?:output|result|response)\s*==\s*["'].+["'].*(?:pass|correct|success)/gi,
    message: "Pass/fail conditional with hardcoded comparison value.",
  },
  {
    id: "reward_shortcut",
    severity: "medium",
    pattern: /\breward\s*=\s*1(?:\.0)?\b/g,
    message: "Unconditional reward assignment — verifier may be trivially exploitable.",
  },
  {
    id: "eval_leakage_comment",
    severity: "low",
    pattern: /(?:#|\/\/|<!--)\s*(?:the\s+(?:correct|right|expected)\s+(?:answer|output|result)\s+is)/gi,
    message: "Comment explicitly states the correct answer.",
  },
];

/**
 * Lint a file's content for spoiler patterns that could leak answers
 * to the model under evaluation.
 */
export function lintSpoilers(
  content: string,
  filename: string,
): SpoilerFinding[] {
  const findings: SpoilerFinding[] = [];
  const lines = content.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]!;

    for (const rule of SPOILER_RULES) {
      // Reset lastIndex for global regexes
      rule.pattern.lastIndex = 0;

      if (rule.pattern.test(line)) {
        findings.push({
          artifactPath: filename,
          line: lineIdx + 1,
          severity: rule.severity,
          ruleId: rule.id,
          message: rule.message,
        });
      }
    }
  }

  return findings;
}
