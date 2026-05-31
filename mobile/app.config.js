/**
 * Standalone app config for EAS / native APK builds.
 * Set EXPO_PUBLIC_CMP_API_URL before building (EAS secret or .env).
 */
const cmpApiUrl =
  process.env.EXPO_PUBLIC_CMP_API_URL?.replace(/\/$/, "") || "http://wingyip.axoncase.com:3002";

/** @type {import("expo/config").ExpoConfig} */
module.exports = {
  name: "AXON Vision CMP",
  slug: "mobile",
  version: "2.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "axoncmp",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.axoncase.cmp",
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
    package: "com.axoncase.cmp",
    versionCode: 2,
    usesCleartextTraffic: true,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#0369a1",
      },
    ],
  ],
  extra: {
    cmpApiUrl,
    router: {},
    eas: {
      projectId: "4d418b37-ba61-4887-84e2-c489fecb5d17",
    },
  },
  experiments: {
    typedRoutes: true,
  },
  owner: "interlv",
};
