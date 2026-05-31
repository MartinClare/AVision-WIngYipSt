import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/lib/theme";

export function Skeleton({
  height = 16,
  width = "100%",
}: {
  height?: number;
  width?: number | `${number}%`;
}) {
  return <View style={[styles.base, { height, width }]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    opacity: 0.6,
  },
});
