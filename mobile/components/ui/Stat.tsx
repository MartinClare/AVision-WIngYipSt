import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/lib/theme";

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: typography.sm,
  },
  value: {
    color: colors.foreground,
    fontSize: typography.xl,
    fontWeight: "700",
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: typography.xs,
  },
});
