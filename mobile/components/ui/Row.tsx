import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";

export function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.muted,
    fontSize: typography.sm,
    flex: 1,
  },
  value: {
    color: colors.cardForeground,
    fontSize: typography.sm,
    flex: 1.2,
    textAlign: "right",
  },
});
