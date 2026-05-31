import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { PushRegistration } from "@/components/PushRegistration";
import { useLocale } from "@/context/LocaleContext";
import { colors } from "@/lib/theme";

function TabIcon({ symbol, color }: { symbol: string; color: string }) {
  return <Text style={{ color, fontSize: 18, fontWeight: "700" }}>{symbol}</Text>;
}

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <>
      <PushRegistration />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.dashboard"),
            tabBarIcon: ({ color }) => <TabIcon symbol="D" color={color} />,
          }}
        />
        <Tabs.Screen
          name="incidents"
          options={{
            title: t("tabs.incidents"),
            tabBarIcon: ({ color }) => <TabIcon symbol="!" color={color} />,
          }}
        />
        <Tabs.Screen
          name="edge"
          options={{
            title: t("tabs.edge"),
            tabBarIcon: ({ color }) => <TabIcon symbol="E" color={color} />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: t("tabs.analytics"),
            tabBarIcon: ({ color }) => <TabIcon symbol="A" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("tabs.settings"),
            tabBarIcon: ({ color }) => <TabIcon symbol="S" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
