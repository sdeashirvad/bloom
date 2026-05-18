# Bloom — Pregnancy Companion App

A warm, emotionally supportive pregnancy companion app built with React Native (Expo).

---

## About

Bloom is a calm, premium wellness companion for pregnant women. It provides week-by-week pregnancy guidance, mood check-ins with personalized emotional responses, and daily affirmations — all stored locally with no backend or account required.

**Screens:**
- **Onboarding** — Conversational, 4-step flow (name, LMP date, first pregnancy)
- **Home** — Pregnancy week, baby size, daily affirmation, emotional note
- **Week Detail** — Baby development, body changes, self-care tip
- **Mood Check-In** — 5 mood options with 8 rotating supportive responses each

---

## Tech Stack

- React Native 0.76 + Expo 52
- Expo Router (file-based navigation)
- Zustand + AsyncStorage (local state, no backend)
- Cormorant Garamond + Inter (typography)
- expo-linear-gradient, expo-haptics, react-native-reanimated

---

## Running in Development

### Prerequisites

- Node.js 20+
- Expo Go app on your Android/iOS device, or an Android emulator

### Install & Start

```bash
npm install
npm run start
```

Then scan the QR code in the terminal with the **Expo Go** app (Android) or your iPhone camera (iOS).

---

## Building a Release Android APK

> **Important:** Replit does not include Android build tooling (Java/Gradle/Android SDK).  
> The APK must be built outside Replit using one of the two methods below.

### Method 1 — EAS Build (Recommended, free, no local setup needed)

EAS Build is Expo's official cloud build service. It builds your APK on Expo's servers for free.

#### Step 1 — Install EAS CLI

```bash
npm install -g eas-cli
```

#### Step 2 — Log in to your Expo account

Create a free account at [expo.dev](https://expo.dev) if you don't have one.

```bash
eas login
```

#### Step 3 — Link project to Expo

```bash
eas init
```

This will assign a project ID. Update the `extra.eas.projectId` field in `app.json` with the generated ID.

#### Step 4 — Build the APK

```bash
eas build --platform android --profile production
```

This submits the build to Expo's servers. You'll receive a download link when it completes (typically 10–15 minutes).

#### Step 5 — Place the APK

Download the APK from the Expo dashboard and save it as:

```
builds/bloom-v1.apk
```

---

### Method 2 — Local Build (requires Android Studio)

Use this method if you want to build entirely offline on your own machine.

#### Prerequisites

1. Install [Android Studio](https://developer.android.com/studio)
2. Ensure `JAVA_HOME` and `ANDROID_HOME` environment variables are set
3. Accept Android SDK licenses: `sdkmanager --licenses`

#### Step 1 — Generate the native Android project

```bash
npx expo prebuild --platform android --clean
```

This creates an `android/` directory with the native Gradle project.

#### Step 2 — Build the release APK

```bash
cd android
./gradlew assembleRelease
```

#### Step 3 — Find and rename the APK

The unsigned APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Copy it to the builds folder:
```bash
cp android/app/build/outputs/apk/release/app-release.apk ../builds/bloom-v1.apk
```

> **Note:** For production distribution you should sign the APK with a keystore.  
> For sideloading/testing, the unsigned APK will work.

---

## Installing the APK on Android

### Enable Unknown Sources

1. Go to **Settings → Security** (or **Settings → Apps → Special app access → Install unknown apps**)
2. Enable "Install from unknown sources" for your file manager or browser

### Install via ADB (recommended for developers)

Connect your device via USB with USB debugging enabled, then:

```bash
adb install builds/bloom-v1.apk
```

### Install by transferring the file

1. Copy `builds/bloom-v1.apk` to your Android device (via USB, Google Drive, email, etc.)
2. Open the file on your device using a file manager
3. Tap **Install** when prompted
4. Tap **Open** after installation completes

---

## Verifying the App After Install

After a fresh install, verify the following:

- [ ] App launches to the **Bloom onboarding screen** (warm cream background, "Welcome to Bloom")
- [ ] Onboarding completes in 4 steps: Welcome → Name → LMP date → First pregnancy
- [ ] **Home screen** shows correct pregnancy week calculated from the entered LMP date
- [ ] Baby illustration is visible on the hero card and Week screen
- [ ] **Trimester badge** displays the correct trimester label
- [ ] **Mood screen** shows 5 mood buttons; selecting one reveals a supportive response card
- [ ] Response card **re-animates** when a different mood is selected
- [ ] All data persists after closing and reopening the app (AsyncStorage)
- [ ] App works fully **offline** — no network connection required at any point

---

## Offline Support

Bloom is designed to work entirely offline:

- All content (week data, mood responses, affirmations) is bundled in the app
- User data (name, LMP, mood history) is stored in device AsyncStorage
- No API calls, no analytics, no telemetry
- No network permission is declared in `AndroidManifest.xml`

---

## Project Structure

```
bloom/
├── app/
│   ├── _layout.tsx          # Root layout, navigation guard, font loading
│   ├── onboarding.tsx        # 4-step onboarding flow
│   └── (tabs)/
│       ├── _layout.tsx       # Bottom tab bar
│       ├── index.tsx         # Home screen
│       ├── week.tsx          # Week detail screen
│       └── mood.tsx          # Mood check-in screen
├── assets/
│   └── images/               # Icon, splash, hero illustration
├── components/
│   ├── BabyIllustration.tsx  # Animated SVG-style growth visual
│   ├── BloomCard.tsx         # Reusable card container
│   ├── GradientBackground.tsx
│   ├── MoodButton.tsx        # Animated mood selection button
│   ├── ProgressDots.tsx      # Onboarding step indicator
│   ├── SupportCard.tsx       # Animated emotional response card
│   └── TrimesterBadge.tsx    # Trimester label pill
├── constants/
│   ├── colors.ts             # Full design token palette
│   ├── emotionalContent.ts   # Mood responses, affirmations, trimester data
│   └── weekData.ts           # Week-by-week pregnancy content
├── context/
│   └── BloomContext.tsx      # User state + pregnancy week calculation
├── hooks/
│   └── useColors.ts
├── builds/
│   └── bloom-v1.apk          # ← Place generated APK here
├── eas.json                  # EAS Build configuration
├── app.json                  # Expo + Android configuration
└── README.md                 # This file
```

---

## Android Build Configuration

Key settings in `app.json`:

| Setting | Value | Reason |
|---|---|---|
| `minSdkVersion` | 24 (Android 7.0) | Covers 98%+ of active Android devices |
| `targetSdkVersion` | 35 (Android 15) | Required for new Play Store submissions |
| `compileSdkVersion` | 35 | Matches target SDK |
| `allowBackup` | false | Protects user privacy |
| `permissions` | [] (none) | App requires no device permissions |
| `userInterfaceStyle` | light | Consistent warm palette |
| `updates.enabled` | false | Fully offline, no OTA updates |

---

## License

Private prototype — not for public distribution.
