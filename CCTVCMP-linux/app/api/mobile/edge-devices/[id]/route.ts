import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ONLINE_THRESHOLD_MS } from "@/lib/camera-status";
import { resolveMobilePublicBaseUrl } from "@/lib/runtime-config";
import { resolveMobileLocale, serializeEdgeReportForMobile } from "@/lib/mobile-serialize";

function buildCmpDescription(
  classificationJson: unknown,
  visionVerificationJson: unknown
): string {
  const cls = classificationJson as {
    classifications?: Array<{
      type: string;
      detected: boolean;
      riskLevel: string;
      confidence: number;
      reasoning?: string;
    }>;
  } | null;
  const vv = visionVerificationJson as {
    summary?: string;
    missedHazards?: string[];
    incorrectClaims?: string[];
  } | null;
  const detected = (cls?.classifications ?? []).filter((c) => c.detected);
  if (detected.length === 0 && !vv?.summary) return "";
  let text =
    detected.length === 0
      ? "CMP found no safety incidents."
      : `CMP identified: ${detected.map((c) => `${c.type.replace(/_/g, " ")} (${c.riskLevel}, ${Math.round(c.confidence * 100)}%)`).join("; ")}.`;
  if (vv?.summary) text += ` ${vv.summary}`;
  if (vv?.missedHazards?.length) text += ` Missed by edge: ${vv.missedHazards.join("; ")}.`;
  if (vv?.incorrectClaims?.length) text += ` Not confirmed: ${vv.incorrectClaims.join("; ")}.`;
  return text;
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const locale = resolveMobileLocale(request);
  const camera = await prisma.camera.findUnique({
    where: { id: context.params.id },
    include: {
      project: { select: { id: true, name: true } },
      zone: { select: { name: true } },
      _count: { select: { incidents: true, edgeReports: true } },
    },
  });

  if (!camera) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const latestAnalysis = await prisma.edgeReport.findFirst({
    where: {
      cameraId: camera.id,
      keepalive: false,
      NOT: { messageType: "keepalive" },
    },
    orderBy: { receivedAt: "desc" },
    select: {
      id: true,
      overallRiskLevel: true,
      cmpRiskLevel: true,
      overallDescription: true,
      peopleCount: true,
      missingHardhats: true,
      missingVests: true,
      receivedAt: true,
      rawJson: true,
      translationsJson: true,
      classificationJson: true,
      visionVerificationJson: true,
      constructionSafety: true,
      fireSafety: true,
      propertySecurity: true,
      keepalive: true,
      messageType: true,
      eventImageIncluded: true,
    },
  });

  const publicBaseUrl = await resolveMobilePublicBaseUrl(request.url);
  const now = Date.now();
  const isOnline =
    camera.status !== "maintenance" &&
    camera.status !== "degraded" &&
    camera.lastReportAt != null &&
    now - camera.lastReportAt.getTime() < ONLINE_THRESHOLD_MS;

  const serializedLatest = latestAnalysis
    ? serializeEdgeReportForMobile(latestAnalysis, publicBaseUrl, locale)
    : null;

  return NextResponse.json({
    device: {
      id: camera.id,
      name: camera.name,
      edgeCameraId: camera.edgeCameraId,
      streamUrl: camera.streamUrl,
      status: camera.status,
      isOnline,
      lastReportAt: camera.lastReportAt?.toISOString() ?? null,
      project: camera.project,
      zone: camera.zone,
      incidentCount: camera._count.incidents,
      reportCount: camera._count.edgeReports,
      snapshotUrl: `${publicBaseUrl}/api/edge-devices/${camera.id}/snapshot`,
      latestAnalysis: serializedLatest,
      latestCmpDescription: latestAnalysis
        ? buildCmpDescription(latestAnalysis.classificationJson, latestAnalysis.visionVerificationJson)
        : null,
    },
  });
}
