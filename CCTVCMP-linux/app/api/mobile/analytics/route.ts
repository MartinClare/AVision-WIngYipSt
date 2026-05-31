import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAnalyticsSnapshot } from "@/lib/analytics";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const projectId = request.nextUrl.searchParams.get("projectId");
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const reports = await prisma.edgeReport.findMany({
    where: {
      receivedAt: { gte: thirtyDaysAgo },
      ...(projectId ? { camera: { projectId } } : {}),
    },
    select: {
      receivedAt: true,
      overallRiskLevel: true,
      cmpRiskLevel: true,
      peopleCount: true,
      missingHardhats: true,
      missingVests: true,
      keepalive: true,
      messageType: true,
    },
    orderBy: { receivedAt: "asc" },
  });

  const snapshot = buildAnalyticsSnapshot(
    reports as Parameters<typeof buildAnalyticsSnapshot>[0]
  );

  const riskPie = {
    high: snapshot.trend.reduce((acc, d) => acc + d.highRisk, 0),
    medium: snapshot.trend.reduce((acc, d) => acc + d.mediumRisk, 0),
    low: snapshot.trend.reduce((acc, d) => acc + d.lowRisk, 0),
  };

  return NextResponse.json({
    data: {
      ...snapshot,
      riskPie,
    },
  });
}
