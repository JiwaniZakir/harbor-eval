import type { WeaknessCard } from "@/lib/types";

/**
 * Generate a Harbor task pack scaffold for a given weakness.
 *
 * Returns a map of filename -> file content representing the task directory.
 * Currently produces static templates. Replace with LLM-generated content later.
 */
export async function scaffoldTask(
  weakness: WeaknessCard,
  projectName: string,
): Promise<Map<string, string>> {
  const slug = weakness.taxonomySlug;
  const files = new Map<string, string>();

  files.set(
    "instruction.md",
    [
      `# ${weakness.weaknessTitle}`,
      "",
      `**Domain:** ${weakness.domain}`,
      `**Hypothesis:** ${weakness.hypothesis}`,
      "",
      "## Task",
      "",
      weakness.deliverable,
      "",
      "## Constraints",
      "",
      `- The bad heuristic to expose: ${weakness.badHeuristic}`,
      `- Authority invariant: ${weakness.authorityInvariant}`,
    ].join("\n"),
  );

  files.set(
    "task.toml",
    [
      `[task]`,
      `slug = "${slug}"`,
      `title = "${weakness.weaknessTitle}"`,
      `project = "${projectName}"`,
      `domain = "${weakness.domain}"`,
      `version = "1.0.0"`,
      "",
      `[scoring]`,
      `strategy = "${weakness.verifierStrategy}"`,
      `pass_threshold = 0.8`,
      "",
      `[resources]`,
      `timeout_seconds = 300`,
      `max_tokens = 4096`,
    ].join("\n"),
  );

  files.set(
    "Dockerfile",
    [
      "FROM python:3.11-slim",
      "",
      "WORKDIR /app",
      "COPY . /app",
      "",
      "RUN pip install --no-cache-dir pytest",
      "",
      'CMD ["python", "-m", "pytest", "tests/", "-v"]',
    ].join("\n"),
  );

  files.set(
    "solve.sh",
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "",
      `# Solve script for ${slug}`,
      `echo "Running solver for ${weakness.weaknessTitle}..."`,
      "",
      "# The agent under evaluation should replace this with real logic",
      'python -c "print(\'SOLUTION_PLACEHOLDER\')"',
    ].join("\n"),
  );

  files.set(
    "tests/test_verifier.py",
    [
      `"""Verifier tests for ${weakness.weaknessTitle}."""`,
      "",
      "import subprocess",
      "",
      "",
      `def test_solver_runs():`,
      `    result = subprocess.run(["bash", "solve.sh"], capture_output=True, text=True)`,
      `    assert result.returncode == 0, f"Solver failed: {result.stderr}"`,
      "",
      "",
      `def test_output_not_placeholder():`,
      `    result = subprocess.run(["bash", "solve.sh"], capture_output=True, text=True)`,
      `    assert "SOLUTION_PLACEHOLDER" not in result.stdout, "Solver still has placeholder output"`,
      "",
      "",
      `def test_output_nonempty():`,
      `    result = subprocess.run(["bash", "solve.sh"], capture_output=True, text=True)`,
      `    assert result.stdout.strip(), "Solver produced empty output"`,
    ].join("\n"),
  );

  return files;
}
