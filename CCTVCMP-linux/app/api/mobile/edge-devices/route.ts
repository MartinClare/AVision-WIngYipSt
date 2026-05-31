import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSyntheticEdgeCamera, ONLINE_THRESHOLD_MS } from "@/lib/camera-status";
import { resolveMobilePublicBaseUrl } from "@/lib/runtime-config";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const publicBaseUrl = await resolveMobilePublicBaseUrl(request.url);

  const cameras = await prisma.camera.findMany({
    select: {
      id: true,
      name: true,
      edgeCameraId: true,
      status: true,
      lastReportAt: true,
      project: { select: { name: true } },
      edgeReports: {
        orderBy: { receivedAt: "desc" },
        take: 1,
        select: {
          overallRiskLevel: true,
          receivedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();
  const devices = cameras
    .filter((camera) => !isSyntheticEdgeCamera(camera))
    .map((camera) => ({
      id: camera.id,
      name: camera.name,
      isOnline:
        camera.status !== "maintenance" &&
        camera.lastReportAt != null &&
        now - camera.lastReportAt.getTime() < ONLINE_THRESHOLD_MS,
      status: camera.status,
      lastReportAt: camera.lastReportAt,
      latestRiskLevel: camera.edgeReports[0]?.overallRiskLevel ?? null,
      snapshotUrl: `${publicBaseUrl}/api/edge-devices/${camera.id}/snapshot`,
      project: camera.project,
    }));

  return NextResponse.json({ devices });
}
