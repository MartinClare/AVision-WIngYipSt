import type { Role } from "@prisma/client";
import { getOrCreateAlertPreference as getOrCreate } from "@/lib/mobile-push/preferences";

export async function getOrCreateAlertPreference(userId: string, role: Role) {
  return getOrCreate(userId, role);
}

export function parseProjectIdsFromPref(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((value): value is string => typeof value === "string");
}
