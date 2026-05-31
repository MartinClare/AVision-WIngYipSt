/**
 * Normalize edge report image URLs so the UI can render legacy records safely.
 *
 * Historical rows may store filesystem or upload paths that are not browser-
 * accessible. The canonical URL is always /api/edge-reports/:id/image.
 */
export function resolveEdgeReportImageUrl(
  reportId: string,
  eventImagePath: string | null | undefined
): string | null {
  const path = eventImagePath?.trim();
  if (!path) return null;

  // Canonical API route stored by current webhook logic.
  if (path.startsWith("/api/edge-reports/")) return path;

  // Keep fully-qualified URLs intact (e.g. external object storage URL).
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Legacy/non-public paths: force canonical API endpoint.
  return `/api/edge-reports/${reportId}/image`;
}
