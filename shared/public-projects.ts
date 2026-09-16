/**
 * Public project publication registry.
 *
 * A row existing in the projects table is not evidence that it is ready for
 * public release. Keep public reads fail-closed until a case study has an
 * explicit, evidence-reviewed entry here. This registry intentionally avoids
 * treating mutable seed or database content as a publication switch.
 */
export const PUBLIC_PROJECT_PUBLICATION_REGISTRY = {
  "nelson-dr": {
    canonicalPath: "/projects/nelson-dr",
  },
} as const;

export type PublishedProjectSlug = keyof typeof PUBLIC_PROJECT_PUBLICATION_REGISTRY;

const publishedProjectSlugs = new Set<string>(
  Object.keys(PUBLIC_PROJECT_PUBLICATION_REGISTRY),
);

export function isPublishedProjectSlug(
  value: unknown,
): value is PublishedProjectSlug {
  return typeof value === "string" && publishedProjectSlugs.has(value);
}

export function filterPublishedProjects<T extends { slug: unknown }>(
  projects: readonly T[],
): T[] {
  return projects.filter((project) => isPublishedProjectSlug(project.slug));
}

export function publishedProjectPaths(): string[] {
  return Object.values(PUBLIC_PROJECT_PUBLICATION_REGISTRY).map(
    ({ canonicalPath }) => canonicalPath,
  );
}
