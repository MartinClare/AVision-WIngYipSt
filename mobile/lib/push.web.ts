export async function registerPushTokenWithCmp(): Promise<string | null> {
  return null;
}

export async function sendTestPush(): Promise<{ ok: false; message: string }> {
  return { ok: false, message: "Push notifications are only available in the native app." };
}
