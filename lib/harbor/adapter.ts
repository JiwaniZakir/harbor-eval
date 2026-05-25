/** Configuration for a Harbor evaluation run. */
export interface RunConfig {
  projectName: string;
  taskSlug: string;
  version: string;
  timeoutSeconds: number;
  maxTokens: number;
}

/** A complete Harbor task pack ready for the registry. */
export interface HarborTaskPack {
  slug: string;
  version: string;
  projectName: string;
  config: RunConfig;
  files: Map<string, string>;
  createdAt: number;
}

/**
 * Convert a workspace artifact map + run config into a Harbor task pack.
 */
export function toHarborFormat(
  artifacts: Map<string, string>,
  config: RunConfig,
): HarborTaskPack {
  const files = new Map<string, string>();

  for (const [path, content] of artifacts) {
    // Normalize paths: strip leading slashes, ensure consistent separators
    const normalized = path.replace(/^\/+/, "").replace(/\\/g, "/");
    files.set(normalized, content);
  }

  return {
    slug: config.taskSlug,
    version: config.version,
    projectName: config.projectName,
    config,
    files,
    createdAt: Date.now(),
  };
}
