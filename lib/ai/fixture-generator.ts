import type { Artifact, ArtifactKind, WeaknessCard } from "@/lib/types";

/**
 * Generate fixture artifacts for a weakness card.
 *
 * Currently returns hardcoded demo fixtures. Replace internals with
 * LLM-generated fixture data later.
 */
export async function generateFixtures(
  weakness: WeaknessCard,
  count: number = 5,
): Promise<Artifact[]> {
  const slug = weakness.taxonomySlug;
  const now = Date.now();

  const fixtures: Artifact[] = [];

  for (let i = 0; i < count; i++) {
    const kind: ArtifactKind = i % 2 === 0 ? "json" : "csv";
    const ext = kind === "json" ? "json" : "csv";

    const content =
      kind === "json"
        ? JSON.stringify(
            {
              fixture_id: `${slug}_${i + 1}`,
              weakness: weakness.weaknessTitle,
              input: `Sample input ${i + 1} for ${slug.replace(/_/g, " ")}`,
              expected_output: `Expected output ${i + 1}`,
              distractor: `Plausible-but-wrong answer ${i + 1}`,
              metadata: {
                variant: i % 3 === 0 ? "adversarial" : "baseline",
                difficulty: i < count / 2 ? "easy" : "hard",
              },
            },
            null,
            2,
          )
        : [
            "fixture_id,input,expected_output,distractor,variant",
            `${slug}_${i + 1},"Sample input ${i + 1}","Expected ${i + 1}","Wrong ${i + 1}",baseline`,
          ].join("\n");

    fixtures.push({
      path: `fixtures/${slug}_${i + 1}.${ext}`,
      kind,
      content,
      badge: `fixture-${i + 1}`,
      updatedAt: now,
      dirty: false,
      taskSlug: slug,
    });
  }

  return fixtures;
}
