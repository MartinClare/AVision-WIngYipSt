import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveMobilePublicBaseUrl } from "@/lib/runtime-config";
import { resolveMobileLocale, serializeEdgeReportForMobile } from "@/lib/mobile-serialize";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const locale = resolveMobileLocale(request);
  const report = await prisma.edgeReport.findUnique({
    where: { id: context.params.id },
    include: {
      camera: {
        select: { id: true, name: true, edgeCameraId: true, status: true, streamUrl: true },
      },
    },
  });

  if (!report) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const publicBaseUrl = await resolveMobilePublicBaseUrl(request.url);

  return NextResponse.json({
    report: {
      ...serializeEdgeReportForMobile(report, publicBaseUrl, locale),
      receivedAt: report.receivedAt.toISOString(),
      camera: report.camera,
    },
  });
}
