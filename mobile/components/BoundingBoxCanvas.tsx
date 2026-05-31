import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { AuthImage } from "@/components/AuthImage";
import { colors, radius, spacing, typography } from "@/lib/theme";

export type Detection = {
  label: string;
  bbox: [number, number, number, number];
  description?: string;
};

const BOX_COLORS: Record<string, string> = {
  person_ok: "#06b6d4",
  no_hardhat: "#ef4444",
  no_vest: "#f97316",
  no_hardhat_no_vest: "#dc2626",
  fire_smoke: "#f97316",
  smoking: "#eab308",
  machine_proximity: "#f97316",
  working_at_height: "#eab308",
  person_fallen: "#dc2626",
};

const LABEL_TEXT: Record<string, string> = {
  no_hardhat: "No Hardhat",
  no_vest: "No Vest",
  no_hardhat_no_vest: "No PPE",
  fire_smoke: "Fire/Smoke",
  smoking: "Smoking",
  machine_proximity: "Machinery",
  working_at_height: "Height Risk",
  person_fallen: "FALLEN",
};

const ALWAYS_RENDER = new Set([
  "no_hardhat",
  "no_vest",
  "no_hardhat_no_vest",
  "fire_smoke",
  "smoking",
  "machine_proximity",
  "working_at_height",
  "person_fallen",
]);

function normalizeBBox(det: Detection): [number, number, number, number] {
  let [xMin, yMin, xMax, yMax] = det.bbox;
  const maxVal = Math.max(xMin, yMin, xMax, yMax);
  const scale = maxVal <= 1.5 ? 1000 : 1;
  xMin *= scale;
  yMin *= scale;
  xMax *= scale;
  yMax *= scale;
  const clamp = (v: number) => Math.max(0, Math.min(1000, v));
  return [clamp(xMin), clamp(yMin), clamp(xMax), clamp(yMax)];
}

function shouldRender(det: Detection) {
  if (det.label === "person_ok" || det.label === "safety_hazard") return false;
  return ALWAYS_RENDER.has(det.label);
}

export function BoundingBoxCanvas({
  imageUrl,
  token,
  detections,
  maxHeight = 280,
  style,
}: {
  imageUrl: string | null;
  token?: string | null;
  detections: Detection[];
  maxHeight?: number;
  style?: ViewStyle;
}) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [natural, setNatural] = useState({ width: 0, height: 0 });

  const visible = useMemo(() => detections.filter(shouldRender), [detections]);

  const contentRect = useMemo(() => {
    const W = layout.width;
    const H = layout.height;
    if (!W || !H || !natural.width || !natural.height) {
      return { x: 0, y: 0, w: W, h: H };
    }
    const naturalAspect = natural.width / natural.height;
    const elementAspect = W / H;
    if (Math.abs(naturalAspect - elementAspect) < 0.01) {
      return { x: 0, y: 0, w: W, h: H };
    }
    if (naturalAspect > elementAspect) {
      const contentH = W / naturalAspect;
      return { x: 0, y: (H - contentH) / 2, w: W, h: contentH };
    }
    const contentW = H * naturalAspect;
    return { x: (W - contentW) / 2, y: 0, w: contentW, h: H };
  }, [layout, natural]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.imageWrap, { maxHeight }]} onLayout={onLayout}>
        <AuthImage
          uri={imageUrl}
          token={token}
          style={styles.image}
          resizeMode="contain"
          onLoadDimensions={(width, height) => setNatural({ width, height })}
        />
        {layout.width > 0 && layout.height > 0 && visible.length > 0 ? (
          <Svg
            style={StyleSheet.absoluteFill}
            width={layout.width}
            height={layout.height}
            pointerEvents="none"
          >
            {visible.map((det, idx) => {
              const [xMin, yMin, xMax, yMax] = normalizeBBox(det);
              const color = BOX_COLORS[det.label] ?? "#a855f7";
              const x = contentRect.x + (xMin / 1000) * contentRect.w;
              const y = contentRect.y + (yMin / 1000) * contentRect.h;
              const w = ((xMax - xMin) / 1000) * contentRect.w;
              const h = ((yMax - yMin) / 1000) * contentRect.h;
              const label = LABEL_TEXT[det.label] ?? det.label;
              return (
                <React.Fragment key={`${det.label}-${idx}`}>
                  <Rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    stroke={color}
                    strokeWidth={2}
                    fill={`${color}22`}
                  />
                  <Rect x={x} y={Math.max(0, y - 16)} width={Math.min(w, label.length * 7 + 8)} height={16} fill="rgba(0,0,0,0.72)" />
                  <SvgText x={x + 4} y={Math.max(12, y - 4)} fill="#fff" fontSize={10} fontWeight="600">
                    {label}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
        ) : null}
      </View>
      {visible.length > 0 ? (
        <View style={styles.legend}>
          {Array.from(new Set(visible.map((d) => d.label))).map((label) => (
            <View
              key={label}
              style={[styles.chip, { backgroundColor: `${BOX_COLORS[label] ?? "#a855f7"}33` }]}
            >
              <Text style={[styles.chipText, { color: BOX_COLORS[label] ?? "#a855f7" }]}>
                {LABEL_TEXT[label] ?? label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  imageWrap: {
    width: "100%",
    minHeight: 160,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  image: {
    width: "100%",
    height: "100%",
    minHeight: 160,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: {
    fontSize: typography.xs,
    fontWeight: "600",
  },
});
