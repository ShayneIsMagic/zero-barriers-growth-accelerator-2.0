# Gemini API Connection & Fallback Issues

## 🔍 Current Status

### **1. Gemini API Connection** ✅ **WORKING**

**Location:** `src/lib/free-ai-analysis.ts`

**Status:**
- ✅ API connection works via `GoogleGenerativeAI`
- ✅ Model: `gemini-2.5-flash`
- ✅ Error handling for API key, rate limits
- ⚠️ **PROBLEM**: Uses generic `createAnalysisPrompt()` for all analysis types
- ❌ **MISSING**: Framework-specific prompts from markdown files

**Current Flow:**
```typescript
// In analyzeWithGemini():
const prompt = createAnalysisPrompt(content, analysisType);
// ❌ This uses a generic prompt, not framework-specific
```

**What Should Happen:**
```typescript
// Should use FrameworkLoaderService:
const frameworkContent = await FrameworkLoaderService.loadFramework('b2c');
const prompt = FrameworkLoaderService.buildPromptWithFramework(
  'b2c',
  content,
  frameworkContent
);
// ✅ Uses actual framework markdown file
```

---

### **2. Fallback to Manual Prompts** ❌ **MISSING**

**Current Behavior:**
- ❌ If Gemini fails → Throws error
- ❌ No fallback UI shown
- ❌ No manual prompt option
- ❌ User can't copy/paste prompt to Gemini manually

**What Should Happen:**
```
Gemini API fails
  ↓
Show error message
  ↓
Display "Manual Analysis" option
  ↓
Show framework-specific prompt ready to copy
  ↓
User copies → Pastes in Gemini → Gets analysis
```

**Missing Components:**
- Fallback UI component
- Framework-specific prompt display
- Copy-to-clipboard button
- Direct link to Gemini chat

---

### **3. Report Generation & Download** ✅ **WORKING**

**Location:** `src/lib/services/unified-report-generator.service.ts`

**How It Works:**
```typescript
// 1. Generate report from stored data
const report = await UnifiedReportGenerator.generateFromPuppeteerData(
  url,
  'content-comparison'
);

// 2. Print
UnifiedReportGenerator.printReport(report);

// 3. Download
UnifiedReportGenerator.downloadReport(report, 'filename', 'html');
UnifiedReportGenerator.downloadReport(report, 'filename', 'markdown');
UnifiedReportGenerator.downloadReport(report, 'filename', 'json');
```

**Current Implementation:**
- ✅ Reports stored in Local Forage (Markdown + JSON)
- ✅ `downloadMarkdown()` function exists
- ✅ `printReport()` function exists
- ⚠️ **ISSUE**: Download buttons may not be visible enough

**Report Storage:**
- **Markdown**: Human-readable format
- **JSON**: Machine-readable format
- **Both**: Stored in `UnifiedLocalForageStorage`

---

### **4. Data Reuse** ✅ **WORKING**

**Location:** `src/lib/services/unified-localforage-storage.service.ts`

**How It Works:**
```typescript
// 1. Store Puppeteer data (after scraping)
await UnifiedLocalForageStorage.storePuppeteerData(url, puppeteerData);

// 2. Retrieve for reuse (before scraping)
const cached = await UnifiedLocalForageStorage.getPuppeteerData(url);

if (cached) {
  // ✅ Use cached data - no scraping needed!
} else {
  // Scrape and store
}
```

**Current Flow:**
1. User analyzes URL → Puppeteer scrapes
2. Data stored in Local Forage (IndexedDB)
3. User analyzes same URL again → Uses cached data
4. User runs different analysis → Reuses same cached data

**Storage Structure:**
- **Puppeteer Data**: Full scraped content (meta tags, SEO, GA4, keywords)
- **Reports**: Analysis results (Markdown + JSON)
- **Imported Files**: Uploaded JSON/Markdown files

---

## 🔧 Issues to Fix

### **Issue 1: Generic Prompts Instead of Framework-Specific**

**Problem:**
- `createAnalysisPrompt()` uses generic framework list
- Not using framework markdown files
- Not using `FrameworkLoaderService`

**Fix:**
```typescript
// Update analyzeWithGemini to use FrameworkLoaderService
import { FrameworkLoaderService } from '@/lib/services/framework-loader.service';

export async function analyzeWithGemini(
  content: string,
  analysisType: string
): Promise<any> {
  // Map analysisType to framework
  const frameworkMap: Record<string, 'b2c' | 'b2b' | 'golden-circle' | 'clifton-strengths'> = {
    'elements-value-b2c': 'b2c',
    'elements-value-b2b': 'b2b',
    'golden-circle': 'golden-circle',
    'clifton-strengths': 'clifton-strengths',
  };
  
  const frameworkType = frameworkMap[analysisType];
  
  if (frameworkType) {
    // Load framework markdown
    const frameworkContent = await FrameworkLoaderService.loadFramework(frameworkType);
    const prompt = FrameworkLoaderService.buildPromptWithFramework(
      frameworkType,
      content,
      frameworkContent
    );
    // Use framework-specific prompt
  } else {
    // Fallback to generic prompt
    const prompt = createAnalysisPrompt(content, analysisType);
  }
}
```

---

### **Issue 2: No Fallback UI When AI Fails**

**Problem:**
- Error thrown, no manual option
- User can't proceed if API fails

**Fix:**
```typescript
// Add fallback UI component
<ErrorFallback
  error={error}
  frameworkType="b2c"
  content={content}
  onRetry={handleRetry}
/>
```

**Fallback UI Should Show:**
1. Error message
2. "Try Manual Analysis" button
3. Framework-specific prompt (ready to copy)
4. "Copy Prompt" button
5. Direct link to Gemini chat

---

### **Issue 3: Report Download Not Prominent**

**Problem:**
- Download buttons exist but may be hidden
- User may not know reports are stored

**Fix:**
- Make download buttons more visible
- Show "Report Saved" notification
- Add "View All Reports" link

---

## 📋 Recommended Actions

1. **Integrate FrameworkLoaderService into prompts**
2. **Add fallback UI component**
3. **Make report download more prominent**
4. **Show cache status more clearly**
5. **Add "View Stored Reports" page**

---

**Last Updated**: After identifying Gemini API and fallback issues
**Status**: ⚠️ Needs fixes for framework prompts and fallback UI

