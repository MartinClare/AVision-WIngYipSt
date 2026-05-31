import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageResizeMode, ImageStyle, Platform, StyleProp, View } from "react-native";
import { colors } from "@/lib/theme";
import { resolveCmpAssetUrl } from "@/constants/Config";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function AuthImage({
  uri,
  token,
  style,
  resizeMode = "cover",
  onLoadDimensions,
}: {
  uri: string | null;
  token?: string | null;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  onLoadDimensions?: (width: number, height: number) => void;
}) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    async function load() {
      const resolved = resolveCmpAssetUrl(uri);
      if (!resolved) {
        setDataUri(null);
        return;
      }
      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(resolved, { headers });
        if (!res.ok) {
          if (!cancelled) setDataUri(null);
          return;
        }
        if (Platform.OS === "web") {
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) setDataUri(objectUrl);
          return;
        }
        const contentType = res.headers.get("content-type") || "image/jpeg";
        const buffer = await res.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        if (!cancelled) {
          setDataUri(`data:${contentType};base64,${base64}`);
        }
      } catch {
        if (!cancelled) setDataUri(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uri, token]);

  if (!dataUri) {
    return (
      <View
        style={[
          style,
          { backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" },
        ]}
      >
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: dataUri }}
      style={style}
      resizeMode={resizeMode}
      onLoad={(e) => {
        const nativeEvent = e.nativeEvent as typeof e.nativeEvent & {
          source?: { width?: number; height?: number };
          target?: { naturalWidth?: number; naturalHeight?: number };
        };
        const width = nativeEvent.source?.width ?? nativeEvent.target?.naturalWidth;
        const height = nativeEvent.source?.height ?? nativeEvent.target?.naturalHeight;
        if (width && height) onLoadDimensions?.(width, height);
      }}
    />
  );
}
