import type { HarborTaskPack } from "./adapter";

/**
 * Serialize a HarborTaskPack into a flat map of file paths -> content strings.
 *
 * All files are prefixed with `{slug}/` to create a self-contained directory
 * structure suitable for writing to disk or uploading to a registry.
 */
export function materializeTaskPack(
  pack: HarborTaskPack,
): Map<string, string> {
  const output = new Map<string, string>();
  const prefix = pack.slug;

  // Materialize the manifest
  output.set(
    `${prefix}/manifest.json`,
    JSON.stringify(
      {
        slug: pack.slug,
        version: pack.version,
        project: pack.projectName,
        created_at: new Date(pack.createdAt).toISOString(),
        files: [...pack.files.keys()],
      },
      null,
      2,
    ),
  );

  // Materialize all task files under the slug directory
  for (const [path, content] of pack.files) {
    output.set(`${prefix}/${path}`, content);
  }

  return output;
}
