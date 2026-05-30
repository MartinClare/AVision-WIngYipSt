import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  buildPreferenceResponse,
  defaultPreferenceForRole,
  serializePreference,
} from "@/lib/mobile-push/preferences";
import { isMobilePushConfigured } from "@/lib/mobile-push/expo";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (user.role !== Role.admin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: { select: { pushDevices: true } },
      alertPreference: true,
    },
  });

  return NextResponse.json({
    pushConfigured: isMobilePushConfigured(),
    projects: await prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    users: users.map((entry) => ({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      role: entry.role,
      deviceCount: entry._count.pushDevices,
      preference: entry.alertPreference
        ? serializePreference(entry.alertPreference)
        : defaultPreferenceForRole(entry.role),
    })),
  });
}
