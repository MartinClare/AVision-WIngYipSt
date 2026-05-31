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

## App identity

| Field | Value |
|-------|-------|
| App name | AXON Vision CMP |
| Android package | `com.axoncase.cmp` |
| EAS project | `4d418b37-ba61-4887-84e2-c489fecb5d17` |
