import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { registerPushTokenWithCmp } from "@/lib/push";

export function PushRegistration() {
  const router = useRouter();
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;
    void registerPushTokenWithCmp();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const incidentId = response.notification.request.content.data?.incidentId;
      if (typeof incidentId === "string") {
        router.push(`/incident/${incidentId}`);
      }
    });
    return () => sub.remove();
  }, [router]);

  return null;
}
