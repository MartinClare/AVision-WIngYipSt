import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BoundingBoxCanvas } from "@/components/BoundingBoxCanvas";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Row } from "@/components/ui/Row";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { incidentTypeLabel, formatDateTime } from "@/lib/i18n";
import { useIncident, usePatchIncident } from "@/lib/queries";
import { colors, radius, spacing, typography } from "@/lib/theme";

function SafetyBlock({ title, data }: { title: string; data: unknown }) {
  if (!data || typeof data !== "object") return null;
  const obj = data as { summary?: string; issues?: string[]; recommendations?: string[] };
  return (
    <Card>
      <SectionHeader title={title} />
      {obj.summary ? <Text style={styles.body}>{obj.summary}</Text> : null}
      {(obj.issues ?? []).map((issue, i) => (
        <Text key={`i-${i}`} style={styles.listItem}>• {issue}</Text>
      ))}
      {(obj.recommendations ?? []).map((rec, i) => (
        <Text key={`r-${i}`} style={styles.listItem}>→ {rec}</Text>
      ))}
    </Card>
  );
}

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useIncident(id);
  const patch = usePatchIncident(id);
  const [notes, setNotes] = useState("");

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

  const incident = data;
  const edge = incident.edgeReport;
  const classifications = (edge?.classificationJson as { classifications?: Array<{ type: string; detected: boolean; riskLevel: string; confidence: number; reasoning: string }> } | null)?.classifications ?? [];
  const vision = edge?.visionVerificationJson as { summary?: string; missedHazards?: string[]; incorrectClaims?: string[] } | null;

  const changeStatus = async (status: string) => {
    try {
      await patch.mutateAsync({ status });
    } catch (e) {
      Alert.alert((e as Error).message);
    }
  };

  const saveNotes = async () => {
    try {
      await patch.mutateAsync({ notes });
      Alert.alert(t("settings.saved"));
    } catch (e) {
      Alert.alert((e as Error).message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{incidentTypeLabel(locale, incident.type)}</Text>
        <Badge value={incident.riskLevel} kind="risk" />
      </View>
      <Badge value={incident.status} kind="status" />

      <Card>
        <SectionHeader title={t("incidents.details")} />
        <Row label={t("incidents.detectedAt")} value={formatDateTime(incident.detectedAt)} />
        <Row label={t("incidents.assignedTo")} value={incident.assignee?.name ?? t("incidents.unassigned")} />
        <Row label={t("incidents.acknowledgedAt")} value={formatDateTime(incident.acknowledgedAt)} />
        <Row label={t("incidents.resolvedAt")} value={formatDateTime(incident.resolvedAt)} />
      </Card>

      {incident.reasoning ? (
        <Card>
          <SectionHeader title={t("incidents.reasoning")} />
          <Text style={styles.body}>{incident.reasoning}</Text>
        </Card>
      ) : null}

      {edge?.imageUrl ? (
        <Card>
          <SectionHeader title={t("incidents.evidence")} />
          <BoundingBoxCanvas
            imageUrl={edge.imageUrl}
            token={token}
            detections={edge.detections ?? []}
            maxHeight={320}
          />
          <Button
            title={t("incidents.viewEdgeReport")}
            variant="ghost"
            onPress={() => router.push(`/incident/edge-report/${edge.id}`)}
          />
        </Card>
      ) : null}

      {classifications.length > 0 ? (
        <Card>
          <SectionHeader title={t("incidents.classification")} />
          {classifications.filter((c) => c.detected).map((c) => (
            <View key={c.type} style={styles.classRow}>
              <Text style={styles.body}>{c.type.replace(/_/g, " ")}</Text>
              <Badge value={c.riskLevel} kind="risk" />
              <Text style={styles.sub}>{c.reasoning}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      {vision ? (
        <Card>
          <SectionHeader title={t("incidents.vision")} />
          {vision.summary ? <Text style={styles.body}>{vision.summary}</Text> : null}
          {(vision.missedHazards ?? []).map((h, i) => (
            <Text key={i} style={styles.listItem}>Missed: {h}</Text>
          ))}
          {(vision.incorrectClaims ?? []).map((h, i) => (
            <Text key={i} style={styles.listItem}>Not confirmed: {h}</Text>
          ))}
        </Card>
      ) : null}

      <SafetyBlock title="Construction" data={edge?.constructionSafety} />
      <SafetyBlock title="Fire" data={edge?.fireSafety} />
      <SafetyBlock title="Property" data={edge?.propertySecurity} />

      <Card>
        <SectionHeader title={t("incidents.notes")} />
        <TextInput
          style={styles.notesInput}
          multiline
          value={notes || incident.notes || ""}
          onChangeText={setNotes}
          placeholderTextColor={colors.mutedForeground}
        />
        <Button title={t("incidents.saveNotes")} onPress={() => void saveNotes()} loading={patch.isPending} />
      </Card>

      {(incident.notificationLogs ?? []).length > 0 ? (
        <Card>
          <SectionHeader title={t("incidents.notifications")} />
          {(incident.notificationLogs ?? []).map((log) => (
            <Text key={log.id} style={styles.sub}>
              {log.channel.name} ({log.channel.type}) · {log.status} · {formatDateTime(log.sentAt)}
            </Text>
          ))}
        </Card>
      ) : null}

      <View style={styles.actions}>
        {incident.status === "open" ? (
          <>
            <Button title={t("incidents.acknowledge")} onPress={() => void changeStatus("acknowledged")} />
            <Button title={t("incidents.resolve")} variant="secondary" onPress={() => void changeStatus("resolved")} />
            <Button title={t("incidents.dismiss")} variant="ghost" onPress={() => void changeStatus("dismissed")} />
          </>
        ) : null}
        {incident.status === "acknowledged" ? (
          <>
            <Button title={t("incidents.resolve")} onPress={() => void changeStatus("resolved")} />
            <Button title={t("incidents.dismiss")} variant="ghost" onPress={() => void changeStatus("dismissed")} />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.foreground, fontSize: typography.xl, fontWeight: "700", flex: 1 },
  body: { color: colors.cardForeground, fontSize: typography.sm, lineHeight: 22 },
  sub: { color: colors.muted, fontSize: typography.sm, marginTop: spacing.xs },
  listItem: { color: colors.muted, fontSize: typography.sm, marginTop: spacing.xs },
  classRow: { gap: spacing.xs, marginBottom: spacing.md },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.foreground,
    backgroundColor: colors.secondary,
    marginBottom: spacing.md,
  },
  actions: { gap: spacing.sm },
  loading: { color: colors.muted, textAlign: "center", marginTop: spacing.xxl },
});
