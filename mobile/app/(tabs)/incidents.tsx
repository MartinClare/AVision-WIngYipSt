import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BoundingBoxCanvas } from "@/components/BoundingBoxCanvas";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { incidentTypeLabel, formatDateTime } from "@/lib/i18n";
import { useIncidents } from "@/lib/queries";
import { colors, radius, spacing, typography } from "@/lib/theme";

const STATUS_FILTERS = ["", "open", "acknowledged", "resolved", "dismissed", "record_only"] as const;
const RISK_FILTERS = ["", "low", "medium", "high", "critical"] as const;

export default function IncidentsScreen() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [risk, setRisk] = useState("");

  const filters = useMemo(
    () => ({
      status: status || undefined,
      riskLevel: risk || undefined,
    }),
    [status, risk]
  );

  const { data, isLoading, isError, error, refetch, isRefetching } = useIncidents(filters);

  return (
    <Screen title={t("incidents.title")} refreshing={isRefetching} onRefresh={() => void refetch()}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {STATUS_FILTERS.map((value) => (
          <Pressable
            key={`s-${value || "all"}`}
            style={[styles.chip, status === value && styles.chipActive]}
            onPress={() => setStatus(value)}
          >
            <Text style={[styles.chipText, status === value && styles.chipTextActive]}>
              {value ? t(`common.status.${value}`) : t("incidents.all")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {RISK_FILTERS.map((value) => (
          <Pressable
            key={`r-${value || "all"}`}
            style={[styles.chip, risk === value && styles.chipActive]}
            onPress={() => setRisk(value)}
          >
            <Text style={[styles.chipText, risk === value && styles.chipTextActive]}>
              {value ? t(`common.risk.${value}`) : t("incidents.all")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isError ? <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} /> : null}
      {isLoading && !data ? <Text style={styles.loading}>{t("common.loading")}</Text> : null}
      {!isLoading && data?.length === 0 ? <EmptyState message={t("incidents.empty")} /> : null}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => router.push(`/incident/${item.id}`)}>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{incidentTypeLabel(locale, item.type)}</Text>
                <Badge value={item.riskLevel} kind="risk" />
              </View>
              <View style={styles.row}>
                <Badge value={item.status} kind="status" />
                {item.recordOnly ? <Badge value={t("incidents.record")} kind="default" /> : null}
              </View>
              <Text style={styles.meta}>
                {item.camera.name} · {item.project.name}
              </Text>
              <Text style={styles.meta}>{formatDateTime(item.detectedAt)}</Text>
              {item.edgeReport?.imageUrl && index < 8 ? (
                <BoundingBoxCanvas
                  imageUrl={item.edgeReport.imageUrl}
                  token={token}
                  detections={item.edgeReport.detections ?? []}
                  maxHeight={160}
                />
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginBottom: spacing.sm,
    maxHeight: 44,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.card,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  chipText: {
    color: colors.muted,
    fontSize: typography.sm,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    alignItems: "center",
  },
  title: {
    color: colors.foreground,
    fontSize: typography.base,
    fontWeight: "700",
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
