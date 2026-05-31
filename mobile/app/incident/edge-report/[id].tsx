import { ScrollView, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BoundingBoxCanvas } from "@/components/BoundingBoxCanvas";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { formatDateTime } from "@/lib/i18n";
import { useEdgeReport } from "@/lib/queries";
import { colors, spacing, typography } from "@/lib/theme";

export default function EdgeReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocale();
  const { token } = useAuth();
  const { data, isLoading, isError, error, refetch } = useEdgeReport(id);

  if (isError) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ErrorState message={error?.message ?? "Error"} onRetry={() => void refetch()} />
      </ScrollView>
    );
  }

  if (isLoading || !data) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.loading}>{t("common.loading")}</Text>
      </ScrollView>
    );
  }

  const report = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {report.keepalive ? (
        <Text style={styles.warning}>{t("edgeReport.keepaliveWarning")}</Text>
      ) : null}

      <Card>
        <SectionHeader title={report.camera.name} subtitle={formatDateTime(report.receivedAt)} />
        <Badge value={report.overallRiskLevel} kind="risk" />
        {report.overallDescription ? <Text style={styles.body}>{report.overallDescription}</Text> : null}
      </Card>

      {report.imageUrl ? (
        <Card>
          <SectionHeader title={t("incidents.evidence")} subtitle={t("edgeReport.detections", { count: report.detections?.length ?? 0 })} />
          <BoundingBoxCanvas
            imageUrl={report.imageUrl}
            token={token}
            detections={report.detections ?? []}
            maxHeight={360}
          />
        </Card>
      ) : (
        <Text style={styles.sub}>{t("edgeReport.noImage")}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  body: { color: colors.cardForeground, fontSize: typography.sm, marginTop: spacing.sm, lineHeight: 22 },
  sub: { color: colors.muted, fontSize: typography.sm },
  warning: { color: colors.warning, fontSize: typography.sm, marginBottom: spacing.sm },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.xxl },
});
