import { IncidentRiskLevel, Role, UserAlertPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AlertPreferencePayload = {
  minRiskLevel: IncidentRiskLevel;
  criticalTypesOnly: boolean;
  alertsEnabled: boolean;
  projectIds: string[];
};

export function defaultPreferenceForRole(role: Role): AlertPreferencePayload {
  return {
    minRiskLevel: role === "viewer" ? "high" : "medium",
    criticalTypesOnly: false,
    alertsEnabled: true,
    projectIds: [],
  };
}

function parseProjectIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is string => typeof value === "string");
}

export function serializePreference(pref: UserAlertPreference): AlertPreferencePayload {
  return {
    minRiskLevel: pref.minRiskLevel,
    criticalTypesOnly: pref.criticalTypesOnly,
    alertsEnabled: pref.alertsEnabled,
    projectIds: parseProjectIds(pref.projectIds),
  };
}

export async function getOrCreateAlertPreference(userId: string, role: Role) {
  const existing = await prisma.userAlertPreference.findUnique({ where: { userId } });
  if (existing) return existing;

  const defaults = defaultPreferenceForRole(role);
  return prisma.userAlertPreference.create({
    data: {
      userId,
      minRiskLevel: defaults.minRiskLevel,
      criticalTypesOnly: defaults.criticalTypesOnly,
      alertsEnabled: defaults.alertsEnabled,
      projectIds: defaults.projectIds,
    },
  });
}

export async function resolveProjectScope(projectIds: string[]) {
  if (projectIds.length === 0) return [];
  return prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function buildPreferenceResponse(userId: string, role: Role) {
  const pref = await getOrCreateAlertPreference(userId, role);
  const projectIds = parseProjectIds(pref.projectIds);
  const projectScope = await resolveProjectScope(projectIds);
  return {
    preference: serializePreference(pref),
    projectScope,
  };
}
