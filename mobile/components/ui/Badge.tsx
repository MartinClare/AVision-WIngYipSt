import { StyleSheet, Text, View } from "react-native";
import { colors, radius, riskColors, statusColors, spacing, typography } from "@/lib/theme";

type BadgeKind = "risk" | "status" | "default";

export function Badge({
  label,
  value,
  kind = "default",
}: {
  label?: string;
  value: string;
  kind?: BadgeKind;
}) {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  const bg =
    kind === "risk"
      ? riskColors[normalized] ?? colors.secondary
      : kind === "status"
        ? statusColors[normalized] ?? colors.secondary
        : colors.secondary;

  return (
    <View style={[styles.badge, { backgroundColor: `${bg}33`, borderColor: bg }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={[styles.text, { color: bg }]}>{value.replace(/_/g, " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: {
    color: colors.muted,
    fontSize: typography.xs,
  },
  text: {
    fontSize: typography.xs,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
