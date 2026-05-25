import type { HarborTaskPack } from "./adapter";

export interface ValidationIssue {
  level: "error" | "warning";
  file: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const REQUIRED_FILES = [
  "instruction.md",
  "task.toml",
  "Dockerfile",
  "solve.sh",
];

/**
 * Validate a Harbor task pack for completeness and basic correctness.
 */
export function validateTaskPack(pack: HarborTaskPack): ValidationResult {
  const issues: ValidationIssue[] = [];
  const filenames = new Set(pack.files.keys());

  // Check required files exist
  for (const required of REQUIRED_FILES) {
    if (!filenames.has(required)) {
      issues.push({
        level: "error",
        file: required,
        message: `Required file "${required}" is missing from the task pack.`,
      });
    }
  }

  // Check instruction.md is non-empty
  const instruction = pack.files.get("instruction.md");
  if (instruction !== undefined && instruction.trim().length === 0) {
    issues.push({
      level: "error",
      file: "instruction.md",
      message: "instruction.md is empty.",
    });
  }

  // Check task.toml is parseable (basic validation)
  const toml = pack.files.get("task.toml");
  if (toml !== undefined) {
    if (toml.trim().length === 0) {
      issues.push({
        level: "error",
        file: "task.toml",
        message: "task.toml is empty.",
      });
    } else {
      // Basic TOML structure checks
      if (!toml.includes("[task]")) {
        issues.push({
          level: "error",
          file: "task.toml",
          message: 'task.toml is missing required [task] section.',
        });
      }
      if (!/slug\s*=/.test(toml)) {
        issues.push({
          level: "warning",
          file: "task.toml",
          message: 'task.toml is missing "slug" field in [task] section.',
        });
      }
    }
  }

  // Check for at least one test file
  const hasTests = [...filenames].some(
    (f) => f.startsWith("tests/") || f.endsWith("_test.py") || f.endsWith(".test.ts"),
  );
  if (!hasTests) {
    issues.push({
      level: "warning",
      file: "tests/",
      message: "No test files found. Consider adding verifier tests.",
    });
  }

  // Check solve.sh has shebang
  const solve = pack.files.get("solve.sh");
  if (solve !== undefined && !solve.startsWith("#!")) {
    issues.push({
      level: "warning",
      file: "solve.sh",
      message: "solve.sh is missing a shebang line (#!/usr/bin/env bash).",
    });
  }

  return {
    valid: issues.every((i) => i.level !== "error"),
    issues,
  };
}
