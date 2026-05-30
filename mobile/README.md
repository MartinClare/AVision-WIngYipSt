# CMP Mobile (Expo)

Native **standalone** app for AXON Vision CMP: push alerts, incident list/detail, summary KPIs, and edge device status.

This is **not** an Expo Go demo. Build a real installable APK/IPA with EAS.

## Build a real Android APK (Mac)

### 1. Install tools

```bash
npm install -g eas-cli
cd mobile
npm install
eas login
```

### 2. Set your CMP server URL

Phones cannot reach `localhost`. Use your CMP **public URL** or **LAN IP**:

```bash
cp .env.example .env
# Edit .env — example for same Wi‑Fi testing:
# EXPO_PUBLIC_CMP_API_URL=http://wingyip.axoncase.com:3002
```

Also replace `REPLACE_WITH_YOUR_CMP_URL` in `eas.json` (both `preview` and `production` profiles), **or** set an EAS env var:

```bash
eas env:create --name EXPO_PUBLIC_CMP_API_URL --value "http://wingyip.axoncase.com:3002" --environment production --visibility plaintext
eas env:create --name EXPO_PUBLIC_CMP_API_URL --value "http://wingyip.axoncase.com:3002" --environment preview --visibility plaintext
```

### 3. Build the APK (cloud — no Android Studio required)

```bash
npm run build:apk
```

EAS compiles a **standalone release APK** (`com.axoncase.cmp`). When finished, download the `.apk` from the link in the terminal or [expo.dev](https://expo.dev) → your project → Builds.

Install on your Android phone (enable “Install unknown apps” for your browser/files app).

### 4. Enable push on CMP

On the CMP server:

```bash
cd CCTVCMP-linux
npx prisma migrate deploy
```

Add to `.env`:

```env
EXPO_ACCESS_TOKEN=your_expo_access_token
```

Restart CMP. In **Settings → Mobile**, confirm **Push configured**.

### 5. Test on the phone

1. Open **AXON Vision CMP** (installed APK — not Expo Go)
2. Sign in
3. **Settings → Register this device for push**
4. **Settings → Send test notification**
5. Trigger a real incident above your risk threshold

---

## Alternative: local APK with Android Studio (Mac)

If you prefer building on your Mac instead of EAS cloud:

```bash
cd mobile
cp .env.example .env   # set EXPO_PUBLIC_CMP_API_URL
npm install
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

You need Android Studio + SDK installed, and a signing keystore for release builds. EAS is simpler for most teams.

---

## CMP server

1. Apply the mobile push migration (`npx prisma migrate deploy` in `CCTVCMP-linux`).
2. Set **`EXPO_ACCESS_TOKEN`** on the CMP host.
3. Optional: **`MOBILE_PUSH_ENABLED=false`** to disable incident push fan-out.

In CMP **Settings → Mobile**, configure per-user alert thresholds. Users register devices from the app **Settings** tab.

---

## Dev (JS only — not for push testing on Android)

```bash
npm start
```

Expo Go is fine for UI dev on iOS. **Android push requires the standalone APK above.**

---

## App identity

| Field | Value |
|-------|-------|
| App name | AXON Vision CMP |
| Android package | `com.axoncase.cmp` |
| EAS project | `4d418b37-ba61-4887-84e2-c489fecb5d17` |
