# User Flow & Site Map - Enhanced Requirements

## 🗺️ Updated Site Map

### **Landing Page** (`/`)
- **First page users see**
- Hero section with "Start Analysis" CTA
- Overview of frameworks (Golden Circle, Elements of Value, CliftonStrengths)
- Links to dashboard

### **Dashboard** (`/dashboard`)
- **Content Comparison** is now **FIRST** (most important)
- All other analysis pages listed below
- Each page supports:
  - ✅ URL input (Puppeteer scraping)
  - ✅ File upload (JSON/Markdown/Text)
  - ✅ Data reuse from Local Forage

---

## 📊 Analysis Pages & User Flows

### **1. Content Comparison** (`/dashboard/content-comparison`) ⭐ **PRIMARY**

#### **User Flow:**
```
1. User lands on Content Comparison page
   ↓
2. Choose input method:
   ├─ Option A: Website URL
   │  └─ Enter URL → Puppeteer scrapes with enhanced collector
   │     └─ Collects: Meta tags, SEO data, GA4/GTM IDs, Keywords
   │
   └─ Option B: Upload File
      └─ Upload JSON/Markdown/Text file
         └─ Stored in Local Forage for reuse
   ↓
3. (Optional) Enter proposed content
   ↓
4. Click "Compare Existing vs. Proposed"
   ↓
5. System checks Local Forage cache first
   ├─ If cached: Uses stored data (faster)
   └─ If not cached: Scrapes with Puppeteer
   ↓
6. AI Analysis (Gemini API)
   ├─ Uses framework-specific prompts
   ├─ Analyzes SEO, meta tags, keywords
   ├─ Detects keyword stuffing
   └─ Compares existing vs proposed
   ↓
7. Results displayed in 3 tabs:
   ├─ Tab 1: AI Comparison Analysis (Side-by-side)
   ├─ Tab 2: Existing Content (Full details)
   └─ Tab 3: Proposed Content (If provided)
   ↓
8. Data automatically stored:
   ├─ Puppeteer data → Local Forage (for reuse)
   ├─ Analysis report → Local Forage (Markdown + JSON)
   └─ Server-side → Database (ContentSnapshot)
   ↓
9. User can:
   ├─ Download Markdown report
   ├─ Print report
   ├─ Copy JSON
   └─ Clear cache (if needed)
```

#### **Data Reuse:**
- **Same URL analyzed again?** → Uses cached Puppeteer data
- **Want to run different analysis?** → Reuses stored Puppeteer data
- **Want to compare different proposed content?** → Reuses existing data

---

### **2. B2C Elements of Value** (`/dashboard/elements-value-b2c`)

#### **User Flow:**
```
1. Enter URL OR upload file
   ↓
2. System checks Local Forage for stored Puppeteer data
   ├─ If found: Uses cached data
   └─ If not: Scrapes with Puppeteer
   ↓
3. AI Analysis with B2C Framework
   ├─ Loads B2C-Elements-Value-Flat-Scoring.md framework
   ├─ Uses framework-specific prompt
   └─ Scores all 30 elements (0.0-1.0)
   ↓
4. Results displayed with:
   ├─ Overall score (average of 30 elements)
   ├─ Tier scores (Functional, Emotional, Life-Changing, Social Impact)
   ├─ Individual element scores
   └─ Recommendations
   ↓
5. Report stored in Local Forage
   └─ Can be downloaded/printed/reused
```

#### **Framework Integration:**
- Uses `B2C-Elements-Value-Flat-Scoring.md` for prompt structure
- Flat fractional scoring (all elements equal weight)
- No mock data - only real collected data

---

### **3. B2B Elements of Value** (`/dashboard/elements-value-b2b`)

#### **User Flow:**
```
1. Enter URL OR upload file
   ↓
2. Check Local Forage cache
   ↓
3. AI Analysis with B2B Framework
   ├─ Loads B2B-Elements-Value-Flat-Scoring.md
   ├─ Scores all 40 elements (0.0-1.0)
   └─ 5 tiers: Table Stakes, Functional, Ease of Business, Individual, Inspirational
   ↓
4. Results + Report stored
```

---

### **4. Golden Circle** (`/dashboard/golden-circle-standalone`)

#### **User Flow:**
```
1. Enter URL OR upload file
   ↓
2. Check Local Forage cache
   ↓
3. AI Analysis with Golden Circle Framework
   ├─ Loads Golden-Circle-Flat-Scoring.md
   ├─ Scores WHY, HOW, WHAT, WHO (each with 6 dimensions)
   └─ Flat scoring (all components equal)
   ↓
4. Results + Report stored
```

---

### **5. CliftonStrengths** (`/dashboard/clifton-strengths-simple`)

#### **User Flow:**
```
1. Enter URL OR upload file
   ↓
2. Check Local Forage cache
   ↓
3. AI Analysis with CliftonStrengths Framework
   ├─ Loads CliftonStrengths-Flat-Scoring.md
   ├─ Scores all 34 themes (0.0-1.0)
   └─ 4 domains: Strategic Thinking, Executing, Influencing, Relationship Building
   ↓
4. Results + Report stored
```

---

## 🔄 Data Reuse Flow

### **How Data is Stored:**

1. **Puppeteer Collection** → `UnifiedLocalForageStorage.storePuppeteerData()`
   - Stores: Full Puppeteer data (meta tags, SEO, GA4, keywords)
   - Key: URL
   - Format: JSON
   - Location: Local Forage (IndexedDB)

2. **Analysis Reports** → `UnifiedLocalForageStorage.storeReport()`
   - Stores: Analysis results
   - Formats: Markdown + JSON
   - Key: URL + Assessment Type
   - Location: Local Forage

3. **Server-Side** → `ContentStorageService.storeComprehensiveData()`
   - Stores: Full comprehensive data
   - Location: PostgreSQL (ContentSnapshot table)
   - Key: URL + User ID

### **How Data is Reused:**

```typescript
// Step 1: Check Local Forage first
const cached = await UnifiedLocalForageStorage.getPuppeteerData(url);

if (cached) {
  // ✅ Use cached data - no scraping needed!
  // Run analysis with cached data
} else {
  // Scrape with Puppeteer
  // Store for future use
}
```

### **Reuse Across Different Analyses:**

```
User analyzes URL with Content Comparison
  ↓
Puppeteer data stored in Local Forage
  ↓
User goes to B2C Elements page
  ↓
System finds cached Puppeteer data
  ↓
Uses cached data (no re-scraping!)
  ↓
Runs B2C analysis
  ↓
Stores B2C report separately
```

---

## 📄 Report Generation & Download

### **Report Storage:**
- **Markdown**: Human-readable format
- **JSON**: Machine-readable format
- **Both stored** in Local Forage

### **Download Options:**

1. **Download Markdown** (`downloadMarkdown()`)
   ```typescript
   const markdown = generateComparisonMarkdown(result);
   // Downloads as .md file
   ```

2. **Print Report** (`UnifiedReportGenerator.printReport()`)
   ```typescript
   const report = await UnifiedReportGenerator.generateFromPuppeteerData(url, 'content-comparison');
   UnifiedReportGenerator.printReport(report);
   // Opens print dialog with formatted HTML
   ```

3. **Download HTML/JSON**
   ```typescript
   UnifiedReportGenerator.downloadReport(report, 'filename', 'html');
   UnifiedReportGenerator.downloadReport(report, 'filename', 'json');
   ```

### **Report Generation Flow:**
```
1. Analysis completes
   ↓
2. Generate Markdown report
   ↓
3. Store in Local Forage (Markdown + JSON)
   ↓
4. User clicks "Download" or "Print"
   ↓
5. UnifiedReportGenerator:
   ├─ Reads from Local Forage
   ├─ Converts to HTML (for printing)
   └─ Downloads or opens print dialog
```

---

## 🤖 Gemini API Connection & Fallback

### **Current Status:**

1. **Gemini API** (`src/lib/free-ai-analysis.ts`)
   - ✅ Connected via `GoogleGenerativeAI`
   - ✅ Model: `gemini-2.5-flash`
   - ✅ Error handling for API key, rate limits
   - ⚠️ **Issue**: Generic prompts, not framework-specific

2. **Prompt Generation** (`createAnalysisPrompt()`)
   - ⚠️ **Issue**: Uses generic prompt for all analysis types
   - ❌ **Missing**: Framework-specific prompts from markdown files
   - ❌ **Missing**: Integration with `FrameworkLoaderService`

### **What Should Happen:**

```typescript
// Current (Generic):
const prompt = createAnalysisPrompt(content, 'comparison');
// Uses generic framework list

// Should Be (Framework-Specific):
const frameworkContent = await FrameworkLoaderService.loadFramework('b2c');
const prompt = FrameworkLoaderService.buildPromptWithFramework(
  'b2c',
  content,
  frameworkContent
);
// Uses actual framework markdown file
```

### **Fallback System:**

**Current:**
- ❌ No fallback to manual prompts
- ❌ Throws error if Gemini fails
- ❌ No framework-specific fallback

**Should Have:**
- ✅ If Gemini fails → Show manual prompt option
- ✅ Framework-specific prompts ready to copy
- ✅ Direct link to Gemini/Claude chat

---

## 🔧 Issues to Fix

### **1. Gemini API Connection**
- ✅ API connection works
- ⚠️ Prompts are generic, not framework-specific
- ❌ Not using `FrameworkLoaderService` for prompts

### **2. Framework-Specific Prompts**
- ❌ `createAnalysisPrompt()` doesn't use framework markdown files
- ❌ Not integrated with `FrameworkLoaderService`
- ❌ Generic prompts for all analysis types

### **3. Fallback to Manual Prompts**
- ❌ No fallback UI when AI fails
- ❌ No copy-paste prompt option
- ❌ No manual analysis instructions

### **4. Report Generation**
- ✅ Works via `UnifiedReportGenerator`
- ✅ Stores in Local Forage
- ✅ Download/Print functions exist
- ⚠️ Could be more visible in UI

### **5. Data Reuse**
- ✅ Works via `UnifiedLocalForageStorage`
- ✅ Checks cache before scraping
- ✅ Stores for reuse
- ⚠️ Could show clearer cache status

---

## 📋 Recommended Fixes

1. **Integrate FrameworkLoaderService into prompts**
2. **Add fallback UI when AI fails**
3. **Show manual prompt option**
4. **Make report download more prominent**
5. **Show cache status more clearly**

---

**Last Updated**: After Content Comparison enhancements
**Status**: ⚠️ Framework prompts need integration

