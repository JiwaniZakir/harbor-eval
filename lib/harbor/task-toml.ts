/** Options for generating a task.toml configuration. */
export interface TaskTomlOptions {
  slug: string;
  title: string;
  project: string;
  domain: string;
  version: string;
  scoringStrategy: string;
  passThreshold: number;
  timeoutSeconds: number;
  maxTokens: number;
}

/**
 * Generate a task.toml string from structured options.
 */
export function generateTaskToml(options: TaskTomlOptions): string {
  return [
    "[task]",
    `slug = "${escapeToml(options.slug)}"`,
    `title = "${escapeToml(options.title)}"`,
    `project = "${escapeToml(options.project)}"`,
    `domain = "${escapeToml(options.domain)}"`,
    `version = "${escapeToml(options.version)}"`,
    "",
    "[scoring]",
    `strategy = "${escapeToml(options.scoringStrategy)}"`,
    `pass_threshold = ${options.passThreshold}`,
    "",
    "[resources]",
    `timeout_seconds = ${options.timeoutSeconds}`,
    `max_tokens = ${options.maxTokens}`,
  ].join("\n");
}

/**
 * Parse a task.toml string back into TaskTomlOptions.
 *
 * Uses simple regex extraction (not a full TOML parser) since our
 * generated format is well-known and consistent.
 */
export function parseTaskToml(content: string): TaskTomlOptions {
  return {
    slug: extractString(content, "slug"),
    title: extractString(content, "title"),
    project: extractString(content, "project"),
    domain: extractString(content, "domain"),
    version: extractString(content, "version"),
    scoringStrategy: extractString(content, "strategy"),
    passThreshold: extractNumber(content, "pass_threshold", 0.8),
    timeoutSeconds: extractNumber(content, "timeout_seconds", 300),
    maxTokens: extractNumber(content, "max_tokens", 4096),
  };
}

function extractString(content: string, key: string): string {
  const match = content.match(new RegExp(`${key}\\s*=\\s*"([^"]*)"`, "m"));
  return match?.[1] ?? "";
}

function extractNumber(
  content: string,
  key: string,
  fallback: number,
): number {
  const match = content.match(
    new RegExp(`${key}\\s*=\\s*([\\d.]+)`, "m"),
  );
  return match ? Number(match[1]) : fallback;
}

function escapeToml(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
