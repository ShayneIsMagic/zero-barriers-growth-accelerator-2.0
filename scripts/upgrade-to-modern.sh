#!/bin/bash

echo "🚀 Comprehensive Upgrade to Modern Code Versions"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current versions
echo "📊 Current Environment:"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Backup package.json
echo "💾 Creating backup..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || true
echo "✅ Backup created: package.json.backup"
echo ""

# 1. Upgrade Next.js to latest stable (v15)
echo "⬆️  Step 1/7: Upgrading Next.js..."
npm install next@latest react@latest react-dom@latest --legacy-peer-deps
echo "✅ Next.js upgraded to latest"
echo ""

# 2. Upgrade TypeScript and types
echo "⬆️  Step 2/7: Upgrading TypeScript..."
npm install --save-dev typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest
echo "✅ TypeScript upgraded"
echo ""

# 3. Upgrade Tailwind CSS
echo "⬆️  Step 3/7: Upgrading Tailwind CSS..."
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest
npm install tailwindcss-animate@latest
echo "✅ Tailwind CSS upgraded"
echo ""

# 4. Upgrade UI dependencies
echo "⬆️  Step 4/7: Upgrading UI libraries..."
npm install lucide-react@latest framer-motion@latest
npm install class-variance-authority@latest clsx@latest tailwind-merge@latest
echo "✅ UI libraries upgraded"
echo ""

# 5. Upgrade AI SDKs
echo "⬆️  Step 5/7: Upgrading AI SDKs..."
npm install @anthropic-ai/sdk@latest @google/generative-ai@latest
npm install openai@latest
echo "✅ AI SDKs upgraded"
echo ""

# 6. Upgrade build tools
echo "⬆️  Step 6/7: Upgrading build tools..."
npm install --save-dev \
  eslint@latest \
  eslint-config-next@latest \
  prettier@latest \
  vitest@latest \
  @playwright/test@latest
echo "✅ Build tools upgraded"
echo ""

# 7. Clean and rebuild
echo "⬆️  Step 7/7: Cleaning and rebuilding..."
rm -rf .next
rm -rf node_modules/.cache
npm dedupe
echo "✅ Cleanup complete"
echo ""

# Test build
echo "🏗️  Testing build with new versions..."
npm run build > /tmp/upgrade-build.log 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
  echo ""
  echo "📦 New versions installed:"
  npm list next react typescript | grep -E "next@|react@|typescript@" | head -3
else
  echo -e "${RED}⚠️  Build had issues. Check /tmp/upgrade-build.log${NC}"
  echo ""
  echo "You can restore with:"
  echo "  mv package.json.backup package.json"
  echo "  npm install"
fi

echo ""
echo "🎉 Upgrade complete!"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff package.json"
echo "2. Test the app: npm run dev"
echo "3. If issues, restore: mv package.json.backup package.json && npm install"
echo ""

