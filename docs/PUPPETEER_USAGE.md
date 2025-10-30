# Puppeteer Usage Documentation

## ✅ Essential Puppeteer Code (KEEP)

### `src/lib/universal-puppeteer-scraper.ts`

**Status:** ✅ **ESSENTIAL** - Used by Content Comparison feature

**Purpose:**
- Primary web scraping service for content extraction
- Used by `/api/analyze/compare` route
- Serverless-compatible (Vercel) using browserless.io or local Chrome
- Handles modern SPAs, CORS, bot detection

**Key Features:**
- Universal scraping for all assessment types
- Serverless compatible with browserless.io fallback
- Anti-bot detection measures (stealth mode)
- Comprehensive data extraction:
  - SEO metadata
  - Content structure (headings, links, images)
  - Performance metrics
  - Accessibility data
  - Social media tags

**Usage:**
```typescript
import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';

const data = await UniversalPuppeteerScraper.scrapeWebsite(url);
```

**Configuration:**
- `BROWSERLESS_TOKEN` - Optional, for browserless.io service
- `BROWSERLESS_WS_ENDPOINT` - Optional, custom browserless endpoint
- Falls back to local Chrome if browserless not configured

---

## 🗑️ Archived Puppeteer Code (Can Remove Later)

### `src/archived/services/puppeteer-google-tools.service.ts`

**Status:** ❌ **ARCHIVED** - Not used by essential pages

**Purpose:**
- Google Tools automation (Trends, PageSpeed, Search Console)
- Was used for automated data collection

**Why Archived:**
- Not imported by essential API routes (compare, enhanced)
- Google Tools often require manual data entry due to bot detection
- README documents fallback to manual entry

---

## 📚 Documentation References

### In README.md

The README already documents Puppeteer usage in:
- **Section: "SCRAPING, PUPPETEER & TOOLS (Detailed)"**
  - Documents serverless-compatible scraping
  - Notes Google Tools workaround with manual fallback
  - References `UniversalPuppeteerScraper`

### Archived Historical Docs

These are in `docs/archived/` and can remain as historical reference:
- `CORRECT_EXECUTION_ORDER.md` - Contains Puppeteer setup examples (historical)
- Other archived docs mentioning Puppeteer (for reference only)

---

## 🎯 Recommendations

### Keep:
1. ✅ `src/lib/universal-puppeteer-scraper.ts` - Essential code
2. ✅ README section on Puppeteer - Already documented
3. ✅ This file (`docs/PUPPETEER_USAGE.md`) - Quick reference

### Archive/Remove (Already Done):
1. ✅ `puppeteer-google-tools.service.ts` - Already archived
2. ✅ Historical docs in `docs/archived/` - Can stay for reference

### Optional Enhancement:
Consider adding inline JSDoc comments to `UniversalPuppeteerScraper` class methods for better IDE documentation.

---

## 🔧 Troubleshooting

### Common Issues

**1. Scraping Fails on Vercel**
- Solution: Configure `BROWSERLESS_TOKEN` environment variable
- Fallback: Uses local Chrome with graceful degradation

**2. Bot Detection**
- Solution: Already includes stealth measures
- User agent rotation, plugin mocking, webdriver property hiding

**3. Timeout Errors**
- Solution: Built-in 30s timeout with retry logic
- Adjust timeout in scraper if needed for slow sites

---

## 📊 Summary

**Active Puppeteer Usage:**
- 1 essential file: `universal-puppeteer-scraper.ts`
- Used by: Content Comparison API route
- Purpose: Web content extraction for analysis

**Documentation:**
- README covers Puppeteer usage ✅
- This file provides detailed reference ✅
- No additional standalone docs needed

