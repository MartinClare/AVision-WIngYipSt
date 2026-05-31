import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/context/LocaleContext";
import { useDashboard } from "@/lib/queries";
import { incidentTypeLabel, formatDateTime } from "@/lib/i18n";
import { colors, spacing, typography } from "@/lib/theme";

export default function DashboardScreen() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useDashboard();

  return (
    <Screen
      title={t("dashboard.title")}
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
    >
      {isError ? <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} /> : null}
      {isLoading && !data ? <Text style={styles.loading}>{t("common.loading")}</Text> : null}
      {data ? (
        <>
          <View style={styles.statsRow}>
            <Stat label={t("dashboard.openIncidents")} value={data.kpis.openIncidents} />
            <Stat label={t("dashboard.highCritical")} value={data.kpis.highCriticalRisk} />
          </View>
          <View style={styles.statsRow}>
            <Stat
              label={t("dashboard.edgeOnline")}
              value={`${data.kpis.edgeOnline}/${data.kpis.edgeTotal}`}
            />
            <Stat
              label={t("dashboard.avgResponse")}
              value={Math.round(data.kpis.avgResponseTime)}
            />
          </View>

          <SectionHeader title={t("dashboard.edgeStatus")} />
          {data.edgeDevices.length === 0 ? (
            <EmptyState message={t("edge.empty")} />
          ) : (
            data.edgeDevices.slice(0, 8).map((device) => (
              <Pressable key={device.id} onPress={() => router.push(`/edge/${device.id}`)}>
                <Card style={styles.listCard}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{device.name}</Text>
                    <Badge
                      value={device.isOnline ? t("edge.online") : t("edge.offline")}
                      kind="default"
                    />
                  </View>
                  {device.latestRiskLevel ? (
                    <Badge value={device.latestRiskLevel} kind="risk" />
                  ) : null}
                </Card>
              </Pressable>
            ))
          )}

          <SectionHeader title={t("dashboard.riskByCategory")} />
          {data.riskCategories.map((cat) => (
            <Card key={cat.categoryKey} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.name}>
                  {cat.icon} {t(`dashboard.categories.${cat.categoryKey}`)}
                </Text>
                <Text style={styles.meta}>{t("dashboard.openCount", { count: cat.openCount })}</Text>
              </View>
              {cat.latestRisk ? <Badge value={cat.latestRisk} kind="risk" /> : null}
            </Card>
          ))}

          <SectionHeader title={t("dashboard.recentAlerts")} />
          {data.recentAlerts.length === 0 ? (
            <EmptyState message={t("dashboard.noAlerts")} />
          ) : (
            data.recentAlerts.map((alert) => (
              <Pressable key={alert.id} onPress={() => router.push(`/incident/${alert.id}`)}>
                <Card style={styles.listCard}>
                  <View style={styles.row}>
                    <Text style={styles.name}>{incidentTypeLabel(locale, alert.type)}</Text>
                    <Badge value={alert.riskLevel} kind="risk" />
                  </View>
                  <Text style={styles.meta}>
                    {alert.cameraName} · {formatDateTime(alert.detectedAt)}
                  </Text>
                </Card>
              </Pressable>
            ))
          )}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  listCard: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    color: colors.foreground,
    fontSize: typography.base,
    fontWeight: "600",
    flex: 1,
  },
  meta: {
    color: colors.muted,
    fontSize: typography.sm,
  },
  loading: {
    color: colors.muted,
    textAlign: "center",
  },
});
