import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { useLocale } from "@/context/LocaleContext";
import { formatDateTime } from "@/lib/i18n";
import { useEdgeDevices } from "@/lib/queries";
import { colors, radius, spacing, typography } from "@/lib/theme";

export default function EdgeDevicesScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useEdgeDevices();

  return (
    <Screen title={t("edge.title")} refreshing={isRefetching} onRefresh={() => void refetch()}>
      {isError ? <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} /> : null}
      {isLoading && !data ? <Text style={styles.loading}>{t("common.loading")}</Text> : null}
      {!isLoading && data?.length === 0 ? <EmptyState message={t("edge.empty")} /> : null}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/edge/${item.id}`)}>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Badge
                  value={item.isOnline ? t("edge.online") : t("edge.offline")}
                  kind="default"
                />
              </View>
              <Text style={styles.meta}>{item.project.name}</Text>
              {item.latestRiskLevel ? (
                <Text style={styles.meta}>{t("edge.latestRisk", { value: item.latestRiskLevel })}</Text>
              ) : null}
              <Text style={styles.meta}>
                {t("edge.lastReport", { value: formatDateTime(item.lastReportAt) })}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
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
