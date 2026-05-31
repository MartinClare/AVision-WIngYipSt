import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider, useLocale } from "@/context/LocaleContext";
import { colors } from "@/lib/theme";

function RootLayoutNav() {
  const { t } = useLocale();
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: t("login.title") }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="incident/[id]" options={{ title: t("incidents.incidentTitle") }} />
        <Stack.Screen name="incident/edge-report/[id]" options={{ title: t("edgeReport.title") }} />
        <Stack.Screen name="edge/[id]" options={{ title: t("edge.detail") }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 5_000 },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
