import { NextRequest, NextResponse } from "next/server";
import { IncidentRiskLevel, Role } from "@prisma/client";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  buildPreferenceResponse,
  getOrCreateAlertPreference,
  resolveProjectScope,
  serializePreference,
} from "@/lib/mobile-push/preferences";
import { prisma } from "@/lib/prisma";

const RISKS: IncidentRiskLevel[] = ["low", "medium", "high", "critical"];

export async function PATCH(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const target = await prisma.user.findUnique({
    where: { id: context.params.userId },
    select: { id: true, role: true },
  });
  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });

  let body: {
    minRiskLevel?: string;
    criticalTypesOnly?: boolean;
    alertsEnabled?: boolean;
    projectIds?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const existing = await getOrCreateAlertPreference(target.id, target.role);
  const updateData: {
    minRiskLevel?: IncidentRiskLevel;
    criticalTypesOnly?: boolean;
    alertsEnabled?: boolean;
    projectIds?: string[];
  } = {};

  if (typeof body.minRiskLevel === "string" && RISKS.includes(body.minRiskLevel as IncidentRiskLevel)) {
    updateData.minRiskLevel = body.minRiskLevel as IncidentRiskLevel;
  }
  if (typeof body.criticalTypesOnly === "boolean") updateData.criticalTypesOnly = body.criticalTypesOnly;
  if (typeof body.alertsEnabled === "boolean") updateData.alertsEnabled = body.alertsEnabled;

  if (Array.isArray(body.projectIds)) {
    const ids = body.projectIds.filter((value): value is string => typeof value === "string");
    const validProjects = await prisma.project.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    updateData.projectIds = validProjects.map((project) => project.id);
  }

  await prisma.userAlertPreference.update({
    where: { id: existing.id },
    data: updateData,
  });

  return NextResponse.json(await buildPreferenceResponse(target.id, target.role));
}

export async function DELETE(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.pushDevice.deleteMany({
    where: { userId: context.params.userId },
  });

  return NextResponse.json({ cleared: result.count });
}
