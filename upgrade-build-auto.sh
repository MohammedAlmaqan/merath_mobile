#!/bin/bash

# -------------------------------
# MERATH_MOBILE FULL UPGRADE + AUTO BUILD SCRIPT
# -------------------------------

set -e

# -------------------------------
# 0️⃣ Select environment
# -------------------------------
echo "Select environment:"
echo "1) Production"
echo "2) Staging"
read -p "Enter choice [1-2]: " env_choice

if [ "$env_choice" == "1" ]; then
  ENV_NAME="production"
  EAS_PROJECT_ID="2c2de43d-16e9-4c3f-88b6-be678d534494"  # Replace with your production EAS Project ID
elif [ "$env_choice" == "2" ]; then
  ENV_NAME="staging"
  EAS_PROJECT_ID="your-staging-project-id"  # Replace with your staging EAS Project ID
else
  echo "Invalid choice, exiting."
  exit 1
fi

echo "✅ Environment set to $ENV_NAME"
export EAS_PROJECT_ID

# -------------------------------
# 1️⃣ Backup Git state
# -------------------------------
echo "Backing up Git state..."
git add .
git commit -m "Backup before upgrade [$ENV_NAME]" || echo "No changes to commit."

# -------------------------------
# 2️⃣ Update minor/patch dependencies
# -------------------------------
echo "Updating minor/patch packages..."
npm update

# -------------------------------
# 3️⃣ List outdated packages
# -------------------------------
echo "Listing outdated packages..."
npm outdated || true

# -------------------------------
# 4️⃣ Optional major upgrades
# -------------------------------
echo "If needed, upgrade major packages manually."
# Example:
# npm install react@latest react-dom@latest react-native@latest superjson@latest cross-env@latest dotenv@latest

# -------------------------------
# 5️⃣ Audit & fix vulnerabilities
# -------------------------------
echo "Auditing packages..."
npm audit fix || echo "Some issues require manual review."
npm audit fix --force || echo "Force fix applied, please test carefully."

# -------------------------------
# 6️⃣ Increment version/build numbers
# -------------------------------
echo "Incrementing version numbers..."

# Extract current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"

# Increment patch for staging, minor for production
if [ "$ENV_NAME" == "staging" ]; then
  patch=$((patch + 1))
else
  minor=$((minor + 1))
  patch=0
fi

NEW_VERSION="$major.$minor.$patch"
echo "New version: $NEW_VERSION"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Update app.config.ts build numbers
IOS_BUILD_NUMBER=$(($(date +%s) % 100000))      # Example: unique build number based on timestamp
ANDROID_VERSION_CODE=$((major * 10000 + minor * 100 + patch))

echo "iOS build number: $IOS_BUILD_NUMBER"
echo "Android version code: $ANDROID_VERSION_CODE"

# Replace in app.config.ts dynamically (simple sed)
sed -i.bak "s/version: \".*\"/version: \"$NEW_VERSION\"/" app.config.ts
sed -i.bak "s/buildNumber: \".*\"/buildNumber: \"$IOS_BUILD_NUMBER\"/" app.config.ts || echo "No previous iOS buildNumber found, skipping"
sed -i.bak "s/versionCode: .*/versionCode: $ANDROID_VERSION_CODE/" app.config.ts || echo "No previous Android versionCode found, skipping"

# -------------------------------
# 7️⃣ Commit changes
# -------------------------------
echo "Committing upgraded packages and version updates..."
git add package.json package-lock.json app.config.ts
git commit -m "Upgrade + version bump [$ENV_NAME]" || echo "No changes to commit"

# -------------------------------
# 8️⃣ Run EAS build
# -------------------------------
echo "Starting EAS build for $ENV_NAME..."

echo "⚡ Android build..."
eas build --platform android --non-interactive --profile production

echo "⚡ iOS build..."
eas build --platform ios --non-interactive --profile production

echo "✅ All builds finished for $ENV_NAME"
