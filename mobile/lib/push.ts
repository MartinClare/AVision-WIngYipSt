import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { apiFetch } from "@/lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function isExpoGo(): boolean {
  return Constants.appOwnership === "expo";
}

export async function registerPushTokenWithCmp(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) return null;

  if (Platform.OS === "android" && isExpoGo()) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return null;

  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ||
    Constants.easConfig?.projectId;

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const expoToken = tokenResult.data;
    const platform = Platform.OS === "ios" ? "ios" : "android";
    const res = await apiFetch<{ device: { id: string } }>("/api/mobile/devices", {
      method: "POST",
      body: JSON.stringify({ token: expoToken, platform }),
    });
    if (!res.ok) return null;
    return expoToken;
  } catch {
    return null;
  }
}

export async function sendTestPush(): Promise<{ ok: true; sent: number } | { ok: false; message: string }> {
  const res = await apiFetch<{ ok: true; sent: number }>("/api/mobile/push/test", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (!res.ok) return { ok: false, message: res.error.message };
  return { ok: true, sent: res.data.sent };
}
