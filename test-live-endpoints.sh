#!/bin/bash

echo "🌐 Testing Live Endpoints - Zero Barriers Growth Accelerator"
echo "============================================================"
echo ""

# Get the deployed URL from Vercel or use default
DEPLOYED_URL=${VERCEL_URL:-"https://zero-barriers-growth-accelerator-20.vercel.app"}
echo "🎯 Testing URL: $DEPLOYED_URL"
echo ""

# Test 1: Health check
echo "🏥 Test 1: Health Check"
echo "------------------------"
if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYED_URL" | grep -q "200"; then
    echo "✅ Main page loads successfully"
else
    echo "❌ Main page failed to load"
fi
echo ""

# Test 2: Content Comparison Page
echo "📊 Test 2: Content Comparison Page"
echo "----------------------------------"
COMPARISON_URL="$DEPLOYED_URL/dashboard/content-comparison"
if curl -s -o /dev/null -w "%{http_code}" "$COMPARISON_URL" | grep -q "200"; then
    echo "✅ Content comparison page loads"
else
    echo "❌ Content comparison page failed"
fi
echo ""

# Test 3: API Health Check
echo "🔌 Test 3: API Health Check"
echo "---------------------------"
API_URL="$DEPLOYED_URL/api/analyze/compare"
echo "Testing: $API_URL"

# Test with a simple request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  -w "%{http_code}" \
  --max-time 30)

HTTP_CODE="${RESPONSE: -3}"
RESPONSE_BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ API responds successfully"
    echo "Response preview: ${RESPONSE_BODY:0:100}..."
else
    echo "❌ API failed with code: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 4: B2C Framework Route
echo "🎯 Test 4: B2C Framework Route"
echo "------------------------------"
B2C_URL="$DEPLOYED_URL/api/analyze/elements-value-b2c-standalone"
echo "Testing: $B2C_URL"

B2C_RESPONSE=$(curl -s -X POST "$B2C_URL" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' \
  -w "%{http_code}" \
  --max-time 30)

B2C_HTTP_CODE="${B2C_RESPONSE: -3}"
B2C_RESPONSE_BODY="${B2C_RESPONSE%???}"

if [ "$B2C_HTTP_CODE" = "200" ]; then
    echo "✅ B2C framework route responds successfully"
    echo "Response preview: ${B2C_RESPONSE_BODY:0:100}..."
else
    echo "❌ B2C framework failed with code: $B2C_HTTP_CODE"
    echo "Response: $B2C_RESPONSE_BODY"
fi
echo ""

# Test 5: Check for Puppeteer errors
echo "🤖 Test 5: Puppeteer Functionality"
echo "-----------------------------------"
echo "Testing with a real website..."

PUPPETEER_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://httpbin.org/html"}' \
  -w "%{http_code}" \
  --max-time 45)

PUPPETEER_HTTP_CODE="${PUPPETEER_RESPONSE: -3}"
PUPPETEER_RESPONSE_BODY="${PUPPETEER_RESPONSE%???}"

if [ "$PUPPETEER_HTTP_CODE" = "200" ]; then
    echo "✅ Puppeteer scraping works"
    if echo "$PUPPETEER_RESPONSE_BODY" | grep -q "success.*true"; then
        echo "✅ Scraping returned successful response"
    else
        echo "⚠️  Scraping responded but may have issues"
    fi
else
    echo "❌ Puppeteer scraping failed with code: $PUPPETEER_HTTP_CODE"
    echo "Response: $PUPPETEER_RESPONSE_BODY"
fi
echo ""

# Test 6: Dashboard Pages
echo "📱 Test 6: Dashboard Pages"
echo "--------------------------"
DASHBOARD_PAGES=(
    "/dashboard"
    "/dashboard/b2c-elements"
    "/dashboard/b2b-elements"
    "/dashboard/clifton-strengths"
    "/dashboard/golden-circle"
)

for page in "${DASHBOARD_PAGES[@]}"; do
    PAGE_URL="$DEPLOYED_URL$page"
    if curl -s -o /dev/null -w "%{http_code}" "$PAGE_URL" | grep -q "200"; then
        echo "✅ $page loads"
    else
        echo "❌ $page failed"
    fi
done
echo ""

# Summary
echo "📋 Live Endpoint Test Summary"
echo "============================="
echo "Deployed URL: $DEPLOYED_URL"
echo "Test completed at: $(date)"
echo ""
echo "If you see ❌ errors:"
echo "1. Check Vercel function logs"
echo "2. Verify environment variables"
echo "3. Check Puppeteer Chrome path issues"
echo ""
echo "If you see ✅ success:"
echo "🎉 Your deployment is working perfectly!"
echo ""
