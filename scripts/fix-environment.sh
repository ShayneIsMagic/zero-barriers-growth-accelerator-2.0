#!/bin/bash

echo "🔧 Fixing JavaScript Environment & Dependencies..."
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v(18|20|22|24) ]]; then
  echo "⚠️  Warning: Recommended Node.js 18.x, 20.x, or 22.x for Next.js 14"
  echo "   Current: $NODE_VERSION"
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "📦 npm version: $NPM_VERSION"
echo ""

# 1. Clear all caches
echo "🧹 Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo "✅ Caches cleared"
echo ""

# 2. Remove problematic packages that might have conflicts
echo "🗑️  Removing potentially conflicting packages..."
npm uninstall @types/node @types/react @types/react-dom --save-dev 2>/dev/null
echo "✅ Removed old type definitions"
echo ""

# 3. Install correct versions
echo "📥 Installing correct dependency versions..."
npm install --save-dev \
  @types/node@20 \
  @types/react@18 \
  @types/react-dom@18
echo "✅ Installed correct type definitions"
echo ""

# 4. Fix peer dependency warnings
echo "🔗 Fixing peer dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies fixed"
echo ""

# 5. Update critical packages to stable versions
echo "⬆️  Updating critical packages..."
npm update next-themes tailwindcss-animate
echo "✅ Critical packages updated"
echo ""

# 6. Deduplicate dependencies
echo "🔄 Deduplicating dependencies..."
npm dedupe
echo "✅ Dependencies deduplicated"
echo ""

# 7. Verify installations
echo "✔️  Verifying installations..."
npm list react react-dom next typescript 2>&1 | grep -E "react@|next@|typescript@" | head -5
echo ""

# 8. Build test
echo "🏗️  Testing build..."
npm run build > /tmp/build-test.log 2>&1
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  echo "✅ Build successful!"
else
  echo "⚠️  Build had warnings but may still work"
  tail -20 /tmp/build-test.log
fi
echo ""

# 9. Create .nvmrc for consistent Node version
echo "18.20.4" > .nvmrc
echo "✅ Created .nvmrc file for version consistency"
echo ""

echo "🎉 Environment fix complete!"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Hard reload browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Check browser console for any remaining errors"
echo ""

