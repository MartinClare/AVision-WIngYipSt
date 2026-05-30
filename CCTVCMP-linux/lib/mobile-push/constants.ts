import type { IncidentRiskLevel } from "@prisma/client";

export const RISK_ORDER: Record<IncidentRiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/** Incident types treated as "critical" when criticalTypesOnly is enabled. */
export const CRITICAL_MOBILE_ALERT_TYPES = [
  "ppe_violation",
  "smoking",
  "fire_detected",
  "machinery_hazard",
] as const;

export const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
