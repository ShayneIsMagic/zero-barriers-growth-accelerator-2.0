# Content Comparison Page Flow & Essential Code

## 🔄 How Puppeteer Works with Content Comparison

### Flow Diagram

```
User Input (URL + optional proposed content)
    ↓
ContentComparisonPage.tsx (client)
    ↓
POST /api/analyze/compare
    ↓
Step 1: UniversalPuppeteerScraper.scrapeWebsite(url)
    ├─ Uses Puppeteer to launch browser (browserless.io or local)
    ├─ Extracts: title, meta, content, SEO data, headings, links
    └─ Returns: UniversalScrapedData
    ↓
Step 2: Process proposed content (if provided)
    └─ Extracts metadata from text input
    ↓
Step 3: generateComparisonReport()
    ├─ Uses analyzeWithGemini() from free-ai-analysis.ts
    ├─ Sends prompt with existing + proposed data
    └─ Returns: competitor analysis JSON
    ↓
Response sent back to client
    ├─ existing: scraped data
    ├─ proposed: processed proposed data (if any)
    └─ comparison: AI analysis results
    ↓
Client saves to LocalForage via ClientStorage
```

## ✅ Essential Code Files (ALL KEPT)

### 1. Client Component
**File:** `src/components/analysis/ContentComparisonPage.tsx`
- **Status:** ✅ **ESSENTIAL** - Main UI component
- **Purpose:** User interface for content comparison
- **Key Actions:**
  - Takes URL and optional proposed content input
  - Calls `/api/analyze/compare` endpoint
  - Displays results and saves to LocalForage
  - Allows framework dropdown for additional analysis

**Key Code Block (lines 40-100):**
```typescript
const runComparison = async () => {
  // ... validation ...
  
  const response = await fetch('/api/analyze/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url.trim(),
      proposedContent: proposedContent.trim(),
      analysisType: 'full'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Save to LocalForage
    await ClientStorage.saveScrapeBundle(bundle);
  }
};
```

### 2. API Route
**File:** `src/app/api/analyze/compare/route.ts`
- **Status:** ✅ **ESSENTIAL** - Core API endpoint
- **Purpose:** Orchestrates scraping + AI analysis
- **Key Steps:**
  1. Scrapes website using Puppeteer (line 34)
  2. Processes proposed content (lines 37-54)
  3. Runs AI comparison analysis (line 58)

**Key Code Block (lines 32-63):**
```typescript
// Step 1: Scrape real website data using universal scraper
console.log('📊 Step 1: Scraping website content...');
const existingData = await UniversalPuppeteerScraper.scrapeWebsite(url);

// Step 2: Process proposed content (if provided)
let proposedData = null;
if (proposedContent && proposedContent.trim().length > 0) {
  // ... process proposed content ...
}

// Step 3: Run AI comparison analysis
console.log('🤖 Step 3: Running AI comparison analysis...');
const comparisonReport = await generateComparisonReport(
  existingData,
  proposedData,
  url,
  _analysisType || 'full'
);
```

### 3. Puppeteer Scraper
**File:** `src/lib/universal-puppeteer-scraper.ts`
- **Status:** ✅ **ESSENTIAL** - Web scraping service
- **Purpose:** Extracts content from websites
- **Method Used:** `UniversalPuppeteerScraper.scrapeWebsite(url)`
- **Returns:** `UniversalScrapedData` with comprehensive website data

**Key Features:**
- Serverless compatible (browserless.io fallback)
- Anti-bot detection measures
- Comprehensive data extraction

### 4. AI Analysis Service
**File:** `src/lib/free-ai-analysis.ts`
- **Status:** ✅ **ESSENTIAL** - AI analysis orchestration
- **Purpose:** Calls Google Gemini API for competitor analysis
- **Method Used:** `analyzeWithGemini(prompt, type)`
- **Required:** `GEMINI_API_KEY` environment variable

### 5. Storage Services
**Files:**
- `src/lib/shared/client-storage.ts` - LocalForage wrapper
- `src/lib/shared/report-aggregator.ts` - Report building

**Status:** ✅ **ESSENTIAL** - Data persistence

---

## 🔑 Required Environment Variables (.env)

### **Required for Content Comparison:**

```bash
# Google Gemini API (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# Browserless.io (OPTIONAL - for serverless scraping)
BROWSERLESS_TOKEN=your_browserless_token_here
BROWSERLESS_WS_ENDPOINT=wss://chrome.browserless.io  # Optional custom endpoint

# Next.js Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or your production URL
```

### **Environment Variable Details:**

1. **GEMINI_API_KEY** ⚠️ **REQUIRED**
   - **Used by:** `src/lib/free-ai-analysis.ts`
   - **Purpose:** Google Gemini API authentication
   - **Where:** `.env.local` (local) or Vercel Environment Variables (production)
   - **Get from:** https://makersuite.google.com/app/apikey

2. **BROWSERLESS_TOKEN** ✅ **OPTIONAL** (Recommended for Vercel)
   - **Used by:** `src/lib/universal-puppeteer-scraper.ts` (lines 252-265)
   - **Purpose:** Remote browser service for serverless environments
   - **Fallback:** Uses local Chrome if not configured
   - **Get from:** https://www.browserless.io/

3. **BROWSERLESS_WS_ENDPOINT** ✅ **OPTIONAL**
   - **Default:** `wss://chrome.browserless.io`
   - **Purpose:** Custom browserless endpoint (if using custom setup)

4. **NEXT_PUBLIC_APP_URL** ⚠️ **REQUIRED**
   - **Used by:** Internal API client (if used)
   - **Purpose:** Base URL for API calls

---

## 📋 File Checklist

✅ **All Essential Files Present:**

- [x] `src/components/analysis/ContentComparisonPage.tsx` - UI component
- [x] `src/app/api/analyze/compare/route.ts` - API endpoint
- [x] `src/lib/universal-puppeteer-scraper.ts` - Puppeteer scraper
- [x] `src/lib/free-ai-analysis.ts` - Gemini API client
- [x] `src/lib/shared/client-storage.ts` - LocalForage wrapper
- [x] `src/lib/shared/report-aggregator.ts` - Report builder

---

## 🔧 Troubleshooting

### Issue: Scraping Fails
**Symptoms:** Empty content or timeout errors

**Solutions:**
1. Check `BROWSERLESS_TOKEN` is set (for Vercel)
2. Verify website is not blocking bots
3. Check scraper logs for specific errors

### Issue: AI Analysis Fails
**Symptoms:** "AI comparison failed" error

**Solutions:**
1. Verify `GEMINI_API_KEY` is set correctly
2. Check API key has proper permissions
3. Verify API quota hasn't been exceeded

### Issue: Content Comparison Page Not Loading
**Symptoms:** 404 or component not found

**Check:**
1. File exists: `src/components/analysis/ContentComparisonPage.tsx`
2. Route exists: `src/app/dashboard/content-comparison/page.tsx`
3. Imports are correct

---

## 📊 Summary

**Essential Code:** ✅ All captured and working

**Required .env Variables:**
1. ✅ `GEMINI_API_KEY` - **REQUIRED**
2. ✅ `BROWSERLESS_TOKEN` - **OPTIONAL** (recommended for Vercel)
3. ✅ `NEXT_PUBLIC_APP_URL` - **REQUIRED**

**Flow Status:** ✅ Complete and functional

The Content Comparison page is fully operational with all essential code in place!

