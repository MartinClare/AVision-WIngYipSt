import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { ErrorState } from "@/components/ui/ErrorState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Stat } from "@/components/ui/Stat";
import { useLocale } from "@/context/LocaleContext";
import { useAnalytics } from "@/lib/queries";
import { colors, spacing, typography } from "@/lib/theme";

const chartWidth = Dimensions.get("window").width - spacing.lg * 2;

function MiniLineChart({ labels, values }: { labels: string[]; values: number[] }) {
  const width = Math.max(chartWidth, labels.length * 44);
  const height = 180;
  const pad = 24;
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
      const y = height - pad - (value / max) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={styles.chartCard}>
      <Svg width={width} height={height}>
        <Line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke={colors.border} />
        <Line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke={colors.border} />
        <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth={3} />
        {values.map((value, index) => {
          const x = pad + (index / Math.max(1, values.length - 1)) * (width - pad * 2);
          const y = height - pad - (value / max) * (height - pad * 2);
          return (
            <React.Fragment key={`${labels[index]}-${index}`}>
              <Circle cx={x} cy={y} r={4} fill={colors.accent} />
              <SvgText x={x} y={height - 6} fill={colors.muted} fontSize={10} textAnchor="middle">
                {labels[index]}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

function RiskBars({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <View style={styles.chartCard}>
      {data.map((item) => (
        <View key={item.name} style={styles.barRow}>
          <Text style={styles.barLabel}>{item.name}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${(item.value / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={styles.barValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const { t } = useLocale();
  const { data, isLoading, isError, error, refetch, isRefetching } = useAnalytics();

  const trendLabels = (data?.trend ?? []).slice(-7).map((p) => p.date.slice(5));
  const trendValues = (data?.trend ?? []).slice(-7).map((p) => p.totalReports);

  const riskData = data
    ? [
        { name: t("common.risk.high"), value: data.riskPie.high, color: colors.destructive },
        { name: t("common.risk.medium"), value: data.riskPie.medium, color: colors.accent },
        { name: t("common.risk.low"), value: data.riskPie.low, color: colors.mutedForeground },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Screen title={t("analytics.title")} refreshing={isRefetching} onRefresh={() => void refetch()}>
      {isError ? <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} /> : null}
      {isLoading && !data ? <Text style={styles.loading}>{t("common.loading")}</Text> : null}
      {data ? (
        <>
          <View style={styles.statsRow}>
            <Stat label={t("analytics.totalReports")} value={data.totalReports} />
            <Stat label={t("analytics.highRisk")} value={data.highRiskCount} />
          </View>
          <View style={styles.statsRow}>
            <Stat label={t("analytics.peopleDetected")} value={data.totalPeopleDetected} />
            <Stat
              label={t("analytics.ppeCompliance")}
              value={data.ppeCompliance != null ? `${data.ppeCompliance}%` : "—"}
            />
          </View>

          {trendLabels.length > 0 ? (
            <>
              <SectionHeader title={t("analytics.dailyTrend")} />
              <MiniLineChart labels={trendLabels} values={trendValues.length ? trendValues : [0]} />
            </>
          ) : null}

          {riskData.length > 0 ? (
            <>
              <SectionHeader title={t("analytics.riskDistribution")} />
              <RiskBars data={riskData} />
            </>
          ) : null}
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
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: "hidden",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  barLabel: {
    color: colors.cardForeground,
    width: 72,
    fontSize: typography.sm,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  barValue: {
    color: colors.muted,
    width: 34,
    textAlign: "right",
    fontSize: typography.sm,
  },
  loading: {
    color: colors.muted,
    textAlign: "center",
  },
});
