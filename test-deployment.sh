#!/bin/bash

echo "🚀 Testing Zero Barriers Growth Accelerator Deployment"
echo "=================================================="
echo ""

# Test 1: Build check
echo "📦 Test 1: Build Check"
echo "----------------------"
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi
echo ""

# Test 2: Type check
echo "🔍 Test 2: TypeScript Check"
echo "---------------------------"
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "✅ TypeScript check passed"
else
    echo "❌ TypeScript errors found"
    npx tsc --noEmit
fi
echo ""

# Test 3: Lint check
echo "🧹 Test 3: ESLint Check"
echo "------------------------"
if npm run lint > /dev/null 2>&1; then
    echo "✅ ESLint check passed"
else
    echo "❌ ESLint warnings found"
    npm run lint
fi
echo ""

# Test 4: Check critical files exist
echo "📁 Test 4: Critical Files Check"
echo "-------------------------------"
files=(
    "src/app/api/analyze/compare/route.ts"
    "src/lib/universal-puppeteer-scraper.ts"
    "src/components/analysis/ContentComparisonPage.tsx"
    "src/lib/api/internal-client.ts"
    "src/app/api/analyze/elements-value-b2c-standalone/route.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done
echo ""

# Test 5: Environment check
echo "🔧 Test 5: Environment Check"
echo "----------------------------"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "⚠️  .env.local missing (may be expected in CI)"
fi

if grep -q "GEMINI_API_KEY" .env.local 2>/dev/null; then
    echo "✅ GEMINI_API_KEY configured"
else
    echo "⚠️  GEMINI_API_KEY not found in .env.local"
fi
echo ""

# Test 6: Package dependencies
echo "📦 Test 6: Package Dependencies"
echo "-------------------------------"
if npm list puppeteer-core > /dev/null 2>&1; then
    echo "✅ puppeteer-core installed"
else
    echo "❌ puppeteer-core missing"
fi

if npm list @sparticuz/chromium > /dev/null 2>&1; then
    echo "✅ @sparticuz/chromium installed"
else
    echo "❌ @sparticuz/chromium missing"
fi
echo ""

echo "🎯 Deployment Test Summary"
echo "========================="
echo "If all tests show ✅, the deployment should work!"
echo "Check Vercel logs if issues persist."
echo ""
