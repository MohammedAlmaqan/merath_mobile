#!/bin/bash
# -------------------------------
# MERATH_MOBILE AUTOMATED ANDROID BUILD SCRIPT
# Handles Preview APK and Production builds safely for Free tier
# -------------------------------

set -e

echo "🚀 MERATH_MOBILE Android Build Script"

# 0️⃣ Select environment
echo "Select environment:"
echo "1) Production"
echo "2) Preview/Test"
read -p "Enter choice [1-2]: " env_choice

if [ "$env_choice" == "1" ]; then
  ENV_NAME="production"
  EAS_PROFILE="production"
elif [ "$env_choice" == "2" ]; then
  ENV_NAME="preview"
  EAS_PROFILE="preview"
else
  echo "❌ Invalid choice, exiting."
  exit 1
fi

echo "✅ Environment: $ENV_NAME"

# 1️⃣ Check git status
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️ Uncommitted changes detected. Commit or stash before building."
  git status
  exit 1
fi

# 2️⃣ Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3️⃣ Run expo doctor and tests
echo "🔍 Verifying project health..."
npx expo-doctor || true
npm test

# 4️⃣ Auto-increment version/build numbers
CURRENT_VERSION=$(node -p "require('./package.json').version")
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

if [ "$ENV_NAME" == "preview" ]; then
  patch=$((patch + 1))  # Increment patch for preview
else
  minor=$((minor + 1))  # Increment minor for production
  patch=0
fi

NEW_VERSION="$major.$minor.$patch"
echo "🔢 New version: $NEW_VERSION"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Update app.config.ts build numbers
IOS_BUILD_NUMBER=$(($(date +%s) % 100000))
ANDROID_VERSION_CODE=$((major * 10000 + minor * 100 + patch))

sed -i.bak "s/version: \".*\"/version: \"$NEW_VERSION\"/" app.config.ts
sed -i.bak "s/buildNumber: \".*\"/buildNumber: \"$IOS_BUILD_NUMBER\"/" app.config.ts || echo "No previous iOS buildNumber found"
sed -i.bak "s/versionCode: .*/versionCode: $ANDROID_VERSION_CODE/" app.config.ts || echo "No previous Android versionCode found"

# 5️⃣ Commit version bump
git add package.json package-lock.json app.config.ts
git commit -m "[$ENV_NAME] Build version bump: $NEW_VERSION" || echo "No changes to commit"

# 6️⃣ Trigger Android build with EAS
echo "📱 Triggering Android build ($ENV_NAME)..."
BUILD_JSON=$(eas build --platform android --profile "$EAS_PROFILE" --non-interactive --json)

# Extract build ID safely
BUILD_ID=$(echo "$BUILD_JSON" | jq -r 'if type=="array" then .[0].id else .id end')
echo "✅ Build triggered! Build ID: $BUILD_ID"

# 7️⃣ Check if URL is available (Free tier may not return immediately)
BUILD_URL=$(echo "$BUILD_JSON" | jq -r 'if type=="array" then .[0].webAppUrl else .webAppUrl end // empty')

if [[ -n "$BUILD_URL" ]]; then
  DOWNLOAD_PATH="./${ENV_NAME}-app.apk"
  echo "⬇️ Downloading APK to $DOWNLOAD_PATH..."
  curl -L "$BUILD_URL" -o "$DOWNLOAD_PATH"
  echo "🎉 APK ready: $DOWNLOAD_PATH"
  echo "Install on device using: adb install -r $DOWNLOAD_PATH"
else
  echo "⚠️ Build URL not available yet (Free tier). Check Expo dashboard to download APK:"
  echo "https://expo.dev/accounts/smartengineer/projects/merath_mobile/builds/$BUILD_ID"
fi
