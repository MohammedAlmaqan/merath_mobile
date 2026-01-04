# Merath Mobile APK Build Guide

## Project Analysis Summary

### Project Overview
- **Name**: Merath Mobile (حاسبة المواريث الشرعية)
- **Type**: React Native with Expo
- **Architecture**: Full-stack app with tRPC backend
- **Platform**: Android & iOS (focused on Android APK for this guide)
- **Package**: space.manus.merath_mobile.t20260101172935
- **Version**: 1.0.0

### Project Structure
```
├── app/                          # Expo Router app directory
│   ├── (tabs)/                   # Tab-based navigation
│   ├── oauth/                    # OAuth callback handling
│   └── _layout.tsx              # Root layout
├── components/                   # React components
├── server/                        # Backend server (tRPC + Express)
├── lib/                          # Utilities & API
├── drizzle/                      # Database schema & migrations
├── assets/                       # Images, icons, splash screens
└── android/                      # Native Android code (generated)
```

### Key Dependencies
- **Framework**: React 19.1.0, React Native 0.81.5
- **Build Tools**: Expo 54.0.29, Metro
- **Backend**: Express.js, tRPC, Drizzle ORM
- **Database**: MySQL 2
- **Features**: 
  - OAuth/Authentication
  - Push Notifications (expo-notifications)
  - Secure Storage (expo-secure-store)
  - Haptics (expo-haptics)
  - Router & Navigation

### Current Issue

**Java Version Compatibility Error**:
- Current Java: Java 25.0.1
- Gradle: 8.13
- Error: `Unsupported class file major version 69`
- Root Cause: Java 25 generates bytecode major version 69, which is not compatible with Gradle versions prior to 8.12+, and even then requires proper configuration

## Solutions for Building APK

### **Solution 1: Use EAS Build Service (Recommended)**

The easiest solution is to use Expo's managed EAS Build service, which handles all compilation complexity:

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Authenticate with your Expo account
eas login

# Build APK for Android
eas build --platform android

# For faster builds, you can build locally with prebuilt Docker images
eas build --platform android --local
```

**Pros**:
- No local Java/Gradle configuration needed
- Cloud builds handle all compatibility issues
- Automatic signing for release builds (with configuration)
- Reliable and tested build process

**Cons**:
- Requires Expo account
- Build time depends on cloud service availability

### **Solution 2: Fix Java Version Locally**

If you need to build locally, downgrade to a compatible Java version or upgrade your toolchain:

#### Option A: Install Java 21
```bash
# Using apt (if available in your Ubuntu container)
sudo apt-get install openjdk-21-jdk-headless

# Or use alternative Java installations if available
```

#### Option B: Update Gradle Wrapper
Already done in this project. Current version: Gradle 8.13
```
# File: android/gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.13-bin.zip
```

#### Option C: Configure Java Toolchain in Gradle
Add to `android/build.gradle`:
```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

### **Solution 3: Use Docker Container**

Build inside a Docker container with proper Java/Gradle compatibility:

```bash
# Build using Docker with Java 21 and Android SDK
docker run --rm -v $(pwd):/workspace \
  -w /workspace/android \
  nvidia/cuda:12.0-devel-ubuntu22.04 \
  bash -c "apt-get update && apt-get install -y openjdk-21-jdk && ./gradlew assembleRelease"
```

###**Solution 4: Use Prebuild with Expo**

Generate the native Android code without building:

```bash
# This creates the android/ directory with proper configuration
npx expo prebuild --clean --platform android

# Then build manually
cd android
./gradlew assembleRelease
```

## Step-by-Step Build Instructions (Recommended Path)

### **Using EAS Build (Easiest)**

1. **Setup**:
```bash
# Navigate to project root
cd /workspaces/merath_mobile

# Install dependencies
pnpm install

# Login to Expo
eas login
# Enter your Expo credentials
```

2. **Build**:
```bash
# Build APK
eas build --platform android --profile production

# Or build locally (if Docker/Node available)
eas build --platform android --local
```

3. **Output**:
   - APK will be available for download
   - Check the build status: `eas build:list`

### **Using Local Gradle (If Java is fixed)**

1. **Verify Java**:
```bash
java -version
# Should show Java 21 or compatible version
```

2. **Prebuild Android**:
```bash
cd /workspaces/merath_mobile
npx expo prebuild --clean --platform android
```

3. **Build APK**:
```bash
cd android
./gradlew assembleRelease

# Output will be at:
# app/build/outputs/apk/release/app-release.apk
```

## Configuration Files

### App Configuration
- **app.config.ts**: Main Expo configuration
  - Bundle ID: `space.manus.merath_mobile.t20260101172935`
  - App Name: `حاسبة المواريث الشرعية (تطبيق جوال)`
  - Scheme: `manus20260101172935`
  - Permissions: `POST_NOTIFICATIONS`
  - Deep linking enabled for OAuth

### Android-Specific Settings
- **android/gradle.properties**: Gradle configuration
- **android/app/build.gradle**: App build configuration
  - Target SDK: Latest (auto-configured)
  - Min SDK: 23
  - Signing: Uses debug keystore by default
  - Features: Hermes engine enabled, new architecture enabled

### Environment Variables
- None required for default build
- Add `.env` file if needed for custom configuration
- Backend URL: Configured in `lib/trpc.ts`

## Release Build Considerations

For production release builds, you'll need to:

1. **Generate Release Keystore**:
```bash
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release
```

2. **Update Signing Configuration** in `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('path/to/release.keystore')
        storePassword 'your_password'
        keyAlias 'release'
        keyPassword 'your_key_password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        // other configurations
    }
}
```

3. **Build Release APK**:
```bash
cd android
./gradlew assembleRelease

# Or to build and sign in one step:
./gradlew assembleRelease --info
```

## Testing the APK

```bash
# Install on connected Android device
adb install -r app/build/outputs/apk/release/app-release.apk

# Or use Expo
eas build:download --latest --path app.apk
adb install -r app.apk
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Java version error | Use EAS Build or downgrade Java to 21 |
| Node not found in Docker | Use image with Node.js pre-installed |
| Gradle daemon issues | Run `./gradlew --stop` then retry |
| OutOfMemory errors | Increase heap: `-Xmx4096m` in gradle.properties |
| Port conflicts | Change ports in expo start or use random ports |
| Missing dependencies | Run `pnpm install` and `pnpm db:push` |

## Next Steps

1. **Immediate**: Use **EAS Build** to generate APK without local setup issues
2. **Alternative**: Fix Java version locally to Java 21 or compatible version
3. **Production**: Follow release signing steps before publishing to Google Play Store

## Resources

- [Expo Build Documentation](https://docs.expo.dev/build/setup/)
- [React Native Gradle Build](https://reactnative.dev/docs/android-build-gradle)
- [Android APK Distribution](https://developer.android.com/studio/command-line/apksigner)
- [Project Source](https://github.com/MohammedAlmaqan/merath_mobile)

---

Generated: January 4, 2026
Project: Merath Mobile v1.0.0
