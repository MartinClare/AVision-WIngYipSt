import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { registerPushTokenWithCmp, sendTestPush } from "@/lib/push";
import { useAlertPreferences, usePatchAlertPreferences, useProjects } from "@/lib/queries";
import { colors, radius, spacing, typography } from "@/lib/theme";

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;

export default function SettingsScreen() {
  const { user, logout, isAdmin } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const { data: prefsData } = useAlertPreferences();
  const { data: projects } = useProjects();
  const patchPrefs = usePatchAlertPreferences();
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const preference = prefsData?.preference;

  const toggleProject = async (projectId: string) => {
    if (!isAdmin || !preference) return;
    const current = preference.projectIds ?? [];
    const next = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    await patchPrefs.mutateAsync({ projectIds: next });
    Alert.alert(t("settings.saved"));
  };

  const onRegisterPush = async () => {
    const token = await registerPushTokenWithCmp();
    setPushStatus(token ? t("settings.pushRegistered") : t("settings.pushDenied"));
  };

  const onTestPush = async () => {
    const res = await sendTestPush();
    if (res.ok) {
      Alert.alert(t("settings.testSent", { count: res.sent }));
    } else {
      Alert.alert(res.message);
    }
  };

  return (
    <Screen title={t("settings.title")}>
      <Card>
        <SectionHeader title={t("settings.signedIn")} />
        <Text style={styles.text}>{user?.name}</Text>
        <Text style={styles.sub}>{user?.email}</Text>
        <Text style={styles.sub}>{user?.role}</Text>
      </Card>

      <Card>
        <SectionHeader title={t("settings.language")} />
        <View style={styles.row}>
          <Pressable
            style={[styles.langBtn, locale === "en" && styles.langBtnActive]}
            onPress={() => setLocale("en")}
          >
            <Text style={styles.langText}>{t("settings.english")}</Text>
          </Pressable>
          <Pressable
            style={[styles.langBtn, locale === "zh-Hant" && styles.langBtnActive]}
            onPress={() => setLocale("zh-Hant")}
          >
            <Text style={styles.langText}>{t("settings.traditionalChinese")}</Text>
          </Pressable>
        </View>
      </Card>

      {preference ? (
        <Card>
          <SectionHeader title={t("settings.alertThreshold")} subtitle={isAdmin ? undefined : t("settings.adminNote")} />
          <Text style={styles.sub}>{t("settings.notifyAbove")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {RISK_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[styles.chip, preference.minRiskLevel === level && styles.chipActive]}
                disabled={!isAdmin}
                onPress={() => void patchPrefs.mutateAsync({ minRiskLevel: level })}
              >
                <Text style={styles.chipText}>{t(`common.risk.${level}`)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.switchRow}>
            <Text style={styles.text}>{t("settings.alertsEnabled")}</Text>
            <Switch
              value={preference.alertsEnabled}
              disabled={!isAdmin}
              onValueChange={(value) => void patchPrefs.mutateAsync({ alertsEnabled: value })}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.text}>{t("settings.criticalOnly")}</Text>
            <Switch
              value={preference.criticalTypesOnly}
              disabled={!isAdmin}
              onValueChange={(value) => void patchPrefs.mutateAsync({ criticalTypesOnly: value })}
            />
          </View>
          {isAdmin && projects && projects.length > 0 ? (
            <>
              <Text style={styles.sub}>{t("settings.projectFilter")}</Text>
              {projects.map((project) => {
                const selected = (preference.projectIds ?? []).includes(project.id);
                return (
                  <Pressable key={project.id} style={styles.projectRow} onPress={() => void toggleProject(project.id)}>
                    <Text style={styles.text}>{project.name}</Text>
                    <Text style={styles.sub}>{selected ? "✓" : ""}</Text>
                  </Pressable>
                );
              })}
            </>
          ) : (
            <Text style={styles.sub}>{t("settings.allProjects")}</Text>
          )}
        </Card>
      ) : null}

      <Card>
        <SectionHeader title={t("settings.pushNotifications")} />
        {pushStatus ? <Text style={styles.sub}>{pushStatus}</Text> : null}
        <Button title={t("settings.registerPush")} onPress={() => void onRegisterPush()} variant="secondary" />
        <Button title={t("settings.sendTest")} onPress={() => void onTestPush()} variant="ghost" />
      </Card>

      <Button title={t("settings.signOut")} onPress={() => void logout()} variant="destructive" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.foreground,
    fontSize: typography.base,
  },
  sub: {
    color: colors.muted,
    fontSize: typography.sm,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  langBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center",
  },
  langBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  langText: {
    color: colors.foreground,
    fontSize: typography.sm,
  },
  filters: {
    marginVertical: spacing.sm,
  },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}22`,
  },
  chipText: {
    color: colors.foreground,
    fontSize: typography.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  projectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
