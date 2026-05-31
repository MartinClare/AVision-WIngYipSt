/**
 * Backfill legacy edge_reports.event_image_path values to the canonical route:
 *   /api/edge-reports/:id/image
 *
 * Why:
 * - Older rows may store filesystem/upload paths that are not browser-accessible.
 * - Incident and report UIs now resolve defensively, but this script permanently
 *   normalizes stored values to avoid future breakage.
 *
 * Usage:
 * - Dry run (default):  node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/backfill-edge-report-image-paths.ts
 * - Apply updates:      node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/backfill-edge-report-image-paths.ts --apply
 */

import { prisma } from "@/lib/prisma";
import { resolveEdgeReportImageUrl } from "@/lib/edge-report-images";

const PAGE_SIZE = 500;
const APPLY = process.argv.includes("--apply");

type ReportRow = {
  id: string;
  eventImagePath: string | null;
  eventImageIncluded: boolean;
  eventImageMimeType: string | null;
};

function canonicalPathForReport(report: ReportRow): string | null {
  if (report.eventImagePath) {
    return resolveEdgeReportImageUrl(report.id, report.eventImagePath);
  }

  // Legacy rows can have image bytes/mime but no path stored.
  if (report.eventImageIncluded || !!report.eventImageMimeType) {
    return `/api/edge-reports/${report.id}/image`;
  }

  return null;
}

async function main() {
  console.log("=== Backfill edge_reports.event_image_path ===");
  console.log(APPLY ? "Mode: APPLY (writes enabled)\n" : "Mode: DRY RUN (no writes)\n");

  let cursor: string | undefined;
  let scanned = 0;
  const updates: Array<{ id: string; from: string | null; to: string }> = [];

  while (true) {
    const rows = await prisma.edgeReport.findMany({
      where: {
        OR: [
          { eventImagePath: { not: null } },
          { eventImageIncluded: true },
          { eventImageMimeType: { not: null } },
        ],
      },
      orderBy: { id: "asc" },
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      take: PAGE_SIZE,
      select: {
        id: true,
        eventImagePath: true,
        eventImageIncluded: true,
        eventImageMimeType: true,
      },
    });

    if (rows.length === 0) break;

    for (const row of rows) {
      scanned += 1;
      const target = canonicalPathForReport(row);
      if (!target) continue;
      if (row.eventImagePath === target) continue;
      updates.push({ id: row.id, from: row.eventImagePath, to: target });
    }

    cursor = rows[rows.length - 1]?.id;
  }

  console.log(`Scanned rows: ${scanned}`);
  console.log(`Rows needing update: ${updates.length}`);

  if (updates.length > 0) {
    const preview = updates.slice(0, 10);
    console.log("\nPreview (first 10):");
    for (const item of preview) {
      console.log(`- ${item.id}: ${item.from ?? "<null>"} -> ${item.to}`);
    }
    if (updates.length > preview.length) {
      console.log(`... and ${updates.length - preview.length} more`);
    }
  }

  if (!APPLY || updates.length === 0) {
    console.log(
      APPLY
        ? "\nNo updates required."
        : "\nDry run complete. Re-run with --apply to persist changes."
    );
    await prisma.$disconnect();
    return;
  }

  let applied = 0;
  for (const item of updates) {
    await prisma.edgeReport.update({
      where: { id: item.id },
      data: { eventImagePath: item.to },
    });
    applied += 1;
  }

  console.log(`\nApplied updates: ${applied}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Backfill failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
