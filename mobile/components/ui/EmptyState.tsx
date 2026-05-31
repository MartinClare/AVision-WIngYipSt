import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  text: {
    color: colors.muted,
    fontSize: typography.base,
    textAlign: "center",
  },
});
