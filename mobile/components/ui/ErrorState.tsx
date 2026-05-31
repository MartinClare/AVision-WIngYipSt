import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@/lib/theme";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? <Button title="Retry" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
    alignItems: "center",
  },
  text: {
    color: colors.destructive,
    fontSize: typography.sm,
    textAlign: "center",
  },
});
