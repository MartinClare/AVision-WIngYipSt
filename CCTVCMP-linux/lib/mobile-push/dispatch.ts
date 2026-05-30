import type { Incident, IncidentType, UserAlertPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CRITICAL_MOBILE_ALERT_TYPES, RISK_ORDER } from "@/lib/mobile-push/constants";
import {
  isMobilePushConfigured,
  pruneInvalidPushTokens,
  sendExpoPushMessages,
  type ExpoPushMessage,
} from "@/lib/mobile-push/expo";
import { getOrCreateAlertPreference, parseProjectIdsFromPref } from "@/lib/mobile-push/dispatch-helpers";

type IncidentForPush = Incident & {
  camera?: { name: string } | null;
  zone?: { name: string } | null;
  project?: { name: string } | null;
};

function formatIncidentType(type: IncidentType): string {
  return type.replace(/_/g, " ");
}

function userMatchesIncident(pref: UserAlertPreference, incident: IncidentForPush): boolean {
  if (!pref.alertsEnabled) return false;
  if (RISK_ORDER[incident.riskLevel] < RISK_ORDER[pref.minRiskLevel]) return false;

  if (pref.criticalTypesOnly) {
    if (!CRITICAL_MOBILE_ALERT_TYPES.includes(incident.type as (typeof CRITICAL_MOBILE_ALERT_TYPES)[number])) {
      return false;
    }
  }

  const projectIds = parseProjectIdsFromPref(pref.projectIds);
  if (projectIds.length > 0 && !projectIds.includes(incident.projectId)) {
    return false;
  }

  return true;
}

function buildPushMessage(token: string, incident: IncidentForPush): ExpoPushMessage {
  const project = incident.project?.name ?? "Project";
  const camera = incident.camera?.name ?? "Camera";
  const typeLabel = formatIncidentType(incident.type);
  const risk = incident.riskLevel.toUpperCase();

  return {
    to: token,
    title: `${risk} · ${typeLabel}`,
    body: `${project} · ${camera}`,
    data: { incidentId: incident.id },
    sound: "default",
    priority: "high",
  };
}

async function logPushResult(input: {
  userId: string;
  deviceId: string;
  incidentId?: string;
  status: string;
  error?: string | null;
}) {
  await prisma.mobilePushLog.create({
    data: {
      userId: input.userId,
      deviceId: input.deviceId,
      incidentId: input.incidentId ?? null,
      status: input.status,
      error: input.error ?? null,
    },
  });
}

/**
 * Fan out mobile push notifications for a newly created incident.
 * Fire-and-forget from the alarm engine.
 */
export async function dispatchMobilePush(incident: IncidentForPush): Promise<void> {
  if (!isMobilePushConfigured()) return;
  if (incident.recordOnly || incident.status === "record_only") return;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      role: true,
      pushDevices: { select: { id: true, token: true } },
    },
  });

  const messages: ExpoPushMessage[] = [];
  const targets: Array<{ userId: string; deviceId: string; token: string }> = [];

  for (const user of users) {
    if (user.pushDevices.length === 0) continue;
    const pref = await getOrCreateAlertPreference(user.id, user.role);
    if (!userMatchesIncident(pref, incident)) continue;

    for (const device of user.pushDevices) {
      messages.push(buildPushMessage(device.token, incident));
      targets.push({ userId: user.id, deviceId: device.id, token: device.token });
    }
  }

  if (messages.length === 0) return;

  let tickets;
  try {
    tickets = await sendExpoPushMessages(messages);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[MobilePush] Batch send failed:", error);
    await Promise.all(
      targets.map((target) =>
        logPushResult({
          userId: target.userId,
          deviceId: target.deviceId,
          incidentId: incident.id,
          status: "failed",
          error,
        })
      )
    );
    return;
  }

  await pruneInvalidPushTokens(messages, tickets, async (token) => {
    await prisma.pushDevice.deleteMany({ where: { token } });
  });

  await Promise.all(
    targets.map((target, index) => {
      const ticket = tickets[index];
      const status = ticket?.status === "ok" ? "sent" : "failed";
      const error = ticket?.status === "error" ? ticket.message : null;
      return logPushResult({
        userId: target.userId,
        deviceId: target.deviceId,
        incidentId: incident.id,
        status,
        error,
      });
    })
  );
}

export async function sendTestPushToUser(userId: string): Promise<number> {
  if (!isMobilePushConfigured()) {
    throw new Error("Mobile push is not configured. Set EXPO_ACCESS_TOKEN on the CMP server.");
  }

  const devices = await prisma.pushDevice.findMany({
    where: { userId },
    select: { id: true, token: true },
  });
  if (devices.length === 0) {
    throw new Error("No registered push devices for this user.");
  }

  const messages: ExpoPushMessage[] = devices.map((device) => ({
    to: device.token,
    title: "CMP test notification",
    body: "Mobile alerts are working.",
    data: { test: true },
    sound: "default",
    priority: "high",
  }));

  const tickets = await sendExpoPushMessages(messages);

  await pruneInvalidPushTokens(messages, tickets, async (token) => {
    await prisma.pushDevice.deleteMany({ where: { token } });
  });

  let sent = 0;
  await Promise.all(
    devices.map(async (device, index) => {
      const ticket = tickets[index];
      const status = ticket?.status === "ok" ? "sent" : "failed";
      const error = ticket?.status === "error" ? ticket.message : null;
      if (status === "sent") sent += 1;
      await logPushResult({
        userId,
        deviceId: device.id,
        status,
        error,
      });
    })
  );

  return sent;
}
