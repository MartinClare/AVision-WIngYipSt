# CMP Mobile (Expo)

Native **standalone** app for AXON Vision CMP — full parity with the web dashboard: KPIs, filtered incidents with bounding boxes, edge device detail + report feed, analytics, settings, and push notifications.

## Quick start (dev)

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

Set `EXPO_PUBLIC_CMP_API_URL` to your CMP server (phones cannot use `localhost`).

## Build Android APK

```bash
npm install -g eas-cli
cd mobile
npm install
eas login
npm run build:apk
```

See [README build section](README.md) in repo for push setup on CMP server.

## Background alerts

Native background alerts use Expo push notifications. They work when the APK is in the background or closed, after three things are done:

1. Build and install the standalone APK (`npm run build:apk` or `npm run build:apk:preview`).
2. Set `EXPO_ACCESS_TOKEN` on the CMP server and restart CMP:

```bash
export EXPO_ACCESS_TOKEN=your_expo_access_token
cd ..
./deploy/start-cmp.sh
```

3. Open the APK once, sign in, then go to **Settings → Register this device for push**. Use **Send test notification** to verify delivery.

The current mobile web preview cannot receive alerts while closed. That requires a separate HTTPS PWA Web Push setup.

## App identity

| Field | Value |
|-------|-------|
| App name | AXON Vision CMP |
| Android package | `com.axoncase.cmp` |
| EAS project | `4d418b37-ba61-4887-84e2-c489fecb5d17` |
