import { EXPO_PUSH_URL } from "@/lib/mobile-push/constants";

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
};

type ExpoPushTicket =
  | { status: "ok"; id: string }
  | { status: "error"; message: string; details?: { error?: string } };

type ExpoPushResponse = {
  data?: ExpoPushTicket[];
  errors?: Array<{ code: string; message: string }>;
};

export function isMobilePushEnabled(): boolean {
  return process.env.MOBILE_PUSH_ENABLED !== "false";
}

export function getExpoAccessToken(): string | null {
  const token = process.env.EXPO_ACCESS_TOKEN?.trim();
  return token || null;
}

export function isMobilePushConfigured(): boolean {
  return isMobilePushEnabled() && !!getExpoAccessToken();
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function sendExpoPushMessages(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];

  const accessToken = getExpoAccessToken();
  if (!accessToken) {
    throw new Error("EXPO_ACCESS_TOKEN is not configured on the CMP server");
  }

  const tickets: ExpoPushTicket[] = [];
  for (const batch of chunk(messages, 100)) {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(batch),
    });

    const payload = (await response.json().catch(() => ({}))) as ExpoPushResponse;
    if (!response.ok) {
      const message =
        payload.errors?.map((entry) => entry.message).join("; ") ||
        `Expo push API returned HTTP ${response.status}`;
      throw new Error(message);
    }

    if (Array.isArray(payload.data)) {
      tickets.push(...payload.data);
    }
  }

  return tickets;
}

/** Remove tokens Expo reports as invalid or unregistered. */
export async function pruneInvalidPushTokens(
  messages: ExpoPushMessage[],
  tickets: ExpoPushTicket[],
  deleteToken: (token: string) => Promise<void>
): Promise<void> {
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    if (ticket.status !== "error") continue;
    const errorCode = ticket.details?.error;
    if (errorCode === "DeviceNotRegistered" || errorCode === "InvalidCredentials") {
      const token = messages[i]?.to;
      if (token) await deleteToken(token);
    }
  }
}
