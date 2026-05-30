import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { sendTestPushToUser } from "@/lib/mobile-push/dispatch";
import { isMobilePushConfigured } from "@/lib/mobile-push/expo";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!isMobilePushConfigured()) {
    return NextResponse.json(
      {
        message:
          "Push notifications are not configured. Set EXPO_ACCESS_TOKEN on the CMP server and ensure MOBILE_PUSH_ENABLED is not false.",
        sent: 0,
      },
      { status: 503 }
    );
  }

  try {
    const sent = await sendTestPushToUser(user.id);
    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send test notification";
    return NextResponse.json({ message, sent: 0 }, { status: 400 });
  }
}
