export type Detection = {
  label: string;
  bbox: [number, number, number, number];
  description?: string;
};

export function extractDetections(rawJson: unknown): Detection[] {
  if (!rawJson || typeof rawJson !== "object") return [];
  const payload = rawJson as Record<string, unknown>;
  const analysis =
    payload.analysis && typeof payload.analysis === "object"
      ? (payload.analysis as Record<string, unknown>)
      : payload;
  const dets = analysis.detections;
  if (!Array.isArray(dets)) return [];
  return dets.filter(
    (d): d is Detection =>
      d !== null &&
      typeof d === "object" &&
      typeof (d as Record<string, unknown>).label === "string" &&
      Array.isArray((d as Record<string, unknown>).bbox) &&
      ((d as Record<string, unknown>).bbox as unknown[]).length === 4
  );
}
