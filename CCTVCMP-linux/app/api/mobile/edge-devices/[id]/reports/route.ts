import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveMobilePublicBaseUrl } from "@/lib/runtime-config";
import { resolveMobileLocale, serializeEdgeReportForMobile } from "@/lib/mobile-serialize";

type FeedFilter = "all" | "analysis" | "alerts" | "keepalive";

function buildWhere(cameraId: string, filter: FeedFilter) {
  const base = { cameraId };
  if (filter === "keepalive") {
    return { ...base, OR: [{ keepalive: true }, { messageType: "keepalive" }] };
  }
  if (filter === "analysis") {
    return { ...base, keepalive: false, NOT: { messageType: "keepalive" } };
  }
  if (filter === "alerts") {
    return {
      ...base,
      keepalive: false,
      NOT: { messageType: "keepalive" },
      incidents: { some: {} },
    };
  }
  return base;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const filter = (url.searchParams.get("filter") ?? "analysis") as FeedFilter;
  const limitParam = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(200, limitParam)) : 50;
  const locale = resolveMobileLocale(request);

  const camera = await prisma.camera.findUnique({
    where: { id: context.params.id },
    select: { id: true },
  });
  if (!camera) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const reports = await prisma.edgeReport.findMany({
    where: buildWhere(camera.id, filter),
    orderBy: { receivedAt: "desc" },
    take: limit,
    select: {
      id: true,
      receivedAt: true,
      messageType: true,
      keepalive: true,
      overallRiskLevel: true,
      cmpRiskLevel: true,
      overallDescription: true,
      peopleCount: true,
      missingHardhats: true,
      missingVests: true,
      rawJson: true,
      translationsJson: true,
      classificationJson: true,
      visionVerificationJson: true,
      constructionSafety: true,
      fireSafety: true,
      propertySecurity: true,
      eventImageIncluded: true,
      _count: { select: { incidents: true } },
    },
  });

  const publicBaseUrl = await resolveMobilePublicBaseUrl(request.url);

  return NextResponse.json({
    reports: reports.map((report) => ({
      ...serializeEdgeReportForMobile(report, publicBaseUrl, locale),
      receivedAt: report.receivedAt.toISOString(),
      incidentCount: report._count.incidents,
    })),
  });
}
