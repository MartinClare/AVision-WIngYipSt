import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveMobilePublicBaseUrl } from "@/lib/runtime-config";
import { resolveMobileLocale, serializeEdgeReportForMobile } from "@/lib/mobile-serialize";
import type { IncidentRiskLevel, IncidentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "40");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, limitParam)) : 40;
  const locale = resolveMobileLocale(request);

  const statusParam = url.searchParams.get("status");
  const riskLevelParam = url.searchParams.get("riskLevel");

  const statuses = statusParam
    ? (statusParam.split(",").filter(Boolean) as IncidentStatus[])
    : undefined;
  const riskLevels = riskLevelParam
    ? (riskLevelParam.split(",").filter(Boolean) as IncidentRiskLevel[])
    : undefined;

  const publicBaseUrl = await resolveMobilePublicBaseUrl(request.url);

  const incidents = await prisma.incident.findMany({
    where: {
      OR: [{ notes: null }, { notes: { not: "__test__" } }],
      ...(statuses?.length ? { status: { in: statuses } } : {}),
      ...(riskLevels?.length ? { riskLevel: { in: riskLevels } } : {}),
    },
    select: {
      id: true,
      type: true,
      riskLevel: true,
      status: true,
      recordOnly: true,
      reasoning: true,
      notes: true,
      detectedAt: true,
      acknowledgedAt: true,
      resolvedAt: true,
      dismissedAt: true,
      camera: { select: { name: true } },
      project: { select: { name: true } },
      zone: { select: { name: true } },
      assignee: { select: { name: true } },
      edgeReport: {
        select: {
          id: true,
          overallRiskLevel: true,
          overallDescription: true,
          receivedAt: true,
          rawJson: true,
          translationsJson: true,
        },
      },
    },
    orderBy: { detectedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    incidents: incidents.map((incident) => ({
      ...incident,
      detectedAt: incident.detectedAt.toISOString(),
      acknowledgedAt: incident.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: incident.resolvedAt?.toISOString() ?? null,
      dismissedAt: incident.dismissedAt?.toISOString() ?? null,
      edgeReport: incident.edgeReport
        ? serializeEdgeReportForMobile(incident.edgeReport, publicBaseUrl, locale)
        : null,
    })),
  });
}
