import { StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.foreground,
    fontSize: typography.lg,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.sm,
    marginBottom: spacing.sm,
  },
});
