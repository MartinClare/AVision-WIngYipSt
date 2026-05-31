import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthImage } from "@/components/AuthImage";
import { BoundingBoxCanvas } from "@/components/BoundingBoxCanvas";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { formatDateTime } from "@/lib/i18n";
import { useEdgeDevice, useEdgeDeviceReports } from "@/lib/queries";
import { colors, radius, spacing, typography } from "@/lib/theme";

const FEED_FILTERS = ["analysis", "alerts", "keepalive", "all"] as const;
const FILTER_LABEL_KEYS: Record<(typeof FEED_FILTERS)[number], string> = {
  all: "edge.filterAll",
  analysis: "edge.filterAnalysis",
  alerts: "edge.filterAlerts",
  keepalive: "edge.filterKeepalive",
};

export default function EdgeDeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocale();
  const { token } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FEED_FILTERS)[number]>("analysis");

  const { data: device, isLoading, isError, error, refetch } = useEdgeDevice(id);
  const { data: reports } = useEdgeDeviceReports(id, filter);

  if (isError) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} />
      </ScrollView>
    );
  }

  if (isLoading || !device) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.loading}>{t("common.loading")}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{device.name}</Text>
        <Badge value={device.isOnline ? t("edge.online") : t("edge.offline")} kind="default" />
      </View>
      <Text style={styles.sub}>
        {device.project.name}
        {device.zone ? ` · ${device.zone.name}` : ""}
      </Text>
      <Text style={styles.sub}>
        {t("edge.reports", { count: device.reportCount })} · {t("edge.incidents", { count: device.incidentCount })}
      </Text>

      <Card>
        <SectionHeader title={t("edge.snapshot")} />
        <AuthImage uri={device.snapshotUrl} token={token} style={styles.snapshot} resizeMode="contain" />
      </Card>

      {device.latestAnalysis ? (
        <Card>
          <SectionHeader title={t("edge.latestAnalysis")} />
          {device.latestAnalysis.overallDescription ? (
            <Text style={styles.body}>{device.latestAnalysis.overallDescription}</Text>
          ) : null}
          {device.latestCmpDescription ? (
            <Text style={styles.sub}>{device.latestCmpDescription}</Text>
          ) : null}
          <Badge value={device.latestAnalysis.overallRiskLevel} kind="risk" />
        </Card>
      ) : null}

      <SectionHeader title={t("edge.reportFeed")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FEED_FILTERS.map((value) => (
          <Pressable
            key={value}
            style={[styles.chip, filter === value && styles.chipActive]}
            onPress={() => setFilter(value)}
          >
            <Text style={[styles.chipText, filter === value && styles.chipTextActive]}>
              {t(FILTER_LABEL_KEYS[value])}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={reports ?? []}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/incident/edge-report/${item.id}`)}>
            <Card style={{ gap: spacing.sm }}>
              <View style={styles.headerRow}>
                <Badge value={item.overallRiskLevel} kind="risk" />
                <Text style={styles.sub}>{formatDateTime(item.receivedAt)}</Text>
              </View>
              {item.overallDescription ? <Text style={styles.body} numberOfLines={3}>{item.overallDescription}</Text> : null}
              {item.imageUrl ? (
                <BoundingBoxCanvas
                  imageUrl={item.imageUrl}
                  token={token}
                  detections={item.detections ?? []}
                  maxHeight={140}
                />
              ) : null}
            </Card>
          </Pressable>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.foreground, fontSize: typography.xl, fontWeight: "700", flex: 1 },
  sub: { color: colors.muted, fontSize: typography.sm },
  body: { color: colors.cardForeground, fontSize: typography.sm, lineHeight: 22 },
  snapshot: { width: "100%", height: 200, borderRadius: radius.md },
  filters: { marginBottom: spacing.sm, maxHeight: 44 },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.card,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: `${colors.accent}22` },
  chipText: { color: colors.muted, fontSize: typography.sm },
  chipTextActive: { color: colors.accent, fontWeight: "600" },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.xxl },
});
