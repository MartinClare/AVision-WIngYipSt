import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { isMobilePushEnabled } from "@/lib/mobile-push/expo";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  if (!isMobilePushEnabled()) {
    return NextResponse.json(
      { message: "Mobile push is disabled on this CMP instance (MOBILE_PUSH_ENABLED=false)." },
      { status: 503 }
    );
  }

  let body: { token?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const platform = typeof body.platform === "string" ? body.platform.trim().toLowerCase() : "";

  if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
    return NextResponse.json({ message: "Invalid Expo push token" }, { status: 400 });
  }
  if (platform !== "ios" && platform !== "android") {
    return NextResponse.json({ message: "platform must be ios or android" }, { status: 400 });
  }

  const device = await prisma.pushDevice.upsert({
    where: { token },
    create: {
      userId: user.id,
      token,
      platform,
    },
    update: {
      userId: user.id,
      platform,
      lastSeenAt: new Date(),
    },
    select: { id: true, platform: true, lastSeenAt: true },
  });

  return NextResponse.json({ device });
}
