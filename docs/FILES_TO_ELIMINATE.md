# Files to Eliminate from Cleanup Branch

Based on `CLEANUP_PLAN.md`, `ESSENTIAL_FILES_LIST.md`, `CODEBASE_AUDIT.md`, and `USEFUL_CODE_TO_KEEP.md`.

## 🗑️ Dashboard Pages to Archive/Delete (29 files)

Keep only: `content-comparison`, `reports`, `page.tsx` (main dashboard)

### Remove These:
```
src/app/dashboard/analysis/page.tsx
src/app/dashboard/analyze/page.tsx
src/app/dashboard/automated-google-tools/page.tsx
src/app/dashboard/clean/page.tsx
src/app/dashboard/clifton-strengths/page.tsx
src/app/dashboard/clifton-strengths-simple/page.tsx
src/app/dashboard/coming-soon/page.tsx
src/app/dashboard/comprehensive-analysis/page.tsx
src/app/dashboard/controlled-analysis/page.tsx
src/app/dashboard/elements-of-value/page.tsx
src/app/dashboard/elements-value-b2b/page.tsx
src/app/dashboard/elements-value-b2c/page.tsx
src/app/dashboard/elements-value-standalone/page.tsx
src/app/dashboard/enhanced-analysis/page.tsx
src/app/dashboard/evaluation-guide/page.tsx
src/app/dashboard/executive-reports/page.tsx
src/app/dashboard/golden-circle-standalone/page.tsx
src/app/dashboard/google-tools/page.tsx
src/app/dashboard/multi-page-scraping/page.tsx
src/app/dashboard/page-analysis/page.tsx
src/app/dashboard/phase2/page.tsx
src/app/dashboard/phase3/page.tsx
src/app/dashboard/phased-analysis/page.tsx
src/app/dashboard/progressive-analysis/page.tsx
src/app/dashboard/revenue-trends/page.tsx
src/app/dashboard/seo-analysis/page.tsx
src/app/dashboard/step-by-step-analysis/page.tsx
src/app/dashboard/step-by-step-execution/page.tsx
src/app/dashboard/unified-analysis/page.tsx
src/app/dashboard/website-analysis/page.tsx
```

---

## 🗑️ Analysis Components to Archive (37 files)

Keep only: `ContentComparisonPage.tsx`

### Remove These:
```
src/components/analysis/AnalysisResults.tsx
src/components/analysis/AssessmentResultsView.tsx
src/components/analysis/AutomatedGoogleToolsPage.tsx
src/components/analysis/B2BElementsPage.tsx
src/components/analysis/B2CElementsPage.tsx
src/components/analysis/CliftonStrengthsPage.tsx
src/components/analysis/ContentComparisonEnhancedPage.tsx
src/components/analysis/ControlledAnalysisPage.tsx
src/components/analysis/GoldenCirclePage.tsx
src/components/analysis/GoogleToolsButtons.tsx
src/components/analysis/GoogleToolsPage.tsx
src/components/analysis/IndividualReportsView.tsx
src/components/analysis/LighthouseAnalysisResults.tsx
src/components/analysis/MultiPageScrapingPage.tsx
src/components/analysis/PageAnalysisForm.tsx
src/components/analysis/Phase1DataCollection.tsx
src/components/analysis/Phase1DataUpload.tsx
src/components/analysis/Phase2Button.tsx
src/components/analysis/PhasedAnalysisPage.tsx
src/components/analysis/ProgressiveAnalysisPage.tsx
src/components/analysis/ProgressTracker.tsx
src/components/analysis/ReadableReportSection.tsx
src/components/analysis/ReportExportButtons.tsx
src/components/analysis/RevenueTrendsPage.tsx
src/components/analysis/SEOAnalysisForm.tsx
src/components/analysis/SEOAnalysisResults.tsx
src/components/analysis/SimpleCliftonStrengthsPage.tsx
src/components/analysis/SimpleGoogleToolsPage.tsx
src/components/analysis/SimpleProgressTracker.tsx
src/components/analysis/StandardizedAssessmentPage.tsx
src/components/analysis/StepByStepAnalysisPage.tsx
src/components/analysis/StepByStepExecutionPage.tsx
src/components/analysis/UnifiedAnalysisPage.tsx
src/components/analysis/UnifiedDataCollection.tsx
src/components/analysis/WebsiteAnalysisForm.tsx
src/components/analysis/WebsiteAnalysisPage.tsx
src/components/analysis/WebsiteAnalysisResults.tsx
```

---

## 🗑️ API Routes to Archive (~80+ routes)

Keep only: `src/app/api/analyze/compare/route.ts`, `src/app/api/analyze/enhanced/route.ts`

### Remove These Entire Directories:
```
src/app/api/analysis/          (all subdirectories)
src/app/api/auth/              (all routes)
src/app/api/content/           (all routes)
src/app/api/debug-user/
src/app/api/generate-evaluation-guide/
src/app/api/generate-executive-report/
src/app/api/generate-pdf/
src/app/api/health/
src/app/api/reports/           (all routes)
src/app/api/scrape/            (all routes)
src/app/api/scrape-content/
src/app/api/scrape-google-tools/
src/app/api/test-db/
src/app/api/test-prisma-simple/
src/app/api/test-prompts/
src/app/api/test-simple/
src/app/api/test-simple-analysis/
src/app/api/tools/             (all routes)
src/app/api/trpc/
src/app/api/user/              (all routes)
src/app/api/workflow/
```

### Remove These Individual Routes:
```
src/app/api/analyze/actionable-report/route.ts
src/app/api/analyze/claude-project/route.ts
src/app/api/analyze/clifton-strengths-standalone/route.ts
src/app/api/analyze/content-comparison-enhanced/
src/app/api/analyze/controlled/route.ts
src/app/api/analyze/elements-of-value/route.ts
src/app/api/analyze/elements-value-b2b-standalone/route.ts
src/app/api/analyze/elements-value-b2c-standalone/route.ts
src/app/api/analyze/elements-value-standalone/route.ts
src/app/api/analyze/enhanced/b2c-elements/route.ts
src/app/api/analyze/golden-circle/route.ts
src/app/api/analyze/golden-circle-standalone/route.ts
src/app/api/analyze/individual/b2b-elements/route.ts
src/app/api/analyze/individual/b2c-elements/route.ts
src/app/api/analyze/individual/clifton-strengths/route.ts
src/app/api/analyze/individual/golden-circle/route.ts
src/app/api/analyze/lighthouse/route.ts
src/app/api/analyze/phase/route.ts
src/app/api/analyze/phase1-complete/route.ts
src/app/api/analyze/phase1-simple/route.ts
src/app/api/analyze/phase2-complete/route.ts
src/app/api/analyze/phase2-simple/route.ts
src/app/api/analyze/phase3-complete/route.ts
src/app/api/analyze/revenue-elements-value/route.ts
src/app/api/analyze/revenue-golden-circle/route.ts
src/app/api/analyze/revenue-trends/route.ts
src/app/api/analyze/simple-actionable/route.ts
src/app/api/analyze/step-by-step/route.ts
src/app/api/analyze/step-by-step-execution/route.ts
src/app/api/analyze/unified/route.ts
src/app/api/analyze/website/enhanced/route.ts
src/app/api/analyze/website/route.ts
```

---

## 🗑️ Services to Archive (32 files)

Keep only: Services used by kept APIs (check dependencies)

### Remove These (Not Imported by Enhanced Route):
```
src/lib/services/actionable-report.service.ts
src/lib/services/clifton-strengths-detailed.service.ts
src/lib/services/comprehensive-analysis.service.ts
src/lib/services/comprehensive-parser.service.ts
src/lib/services/comprehensive-report.service.ts
src/lib/services/content-cache.service.ts
src/lib/services/elements-value-b2b.service.ts
src/lib/services/elements-value-b2c.service.ts
src/lib/services/focused-analysis.service.ts
src/lib/services/golden-circle-detailed.service.ts
src/lib/services/google-tools-analysis.service.ts
src/lib/services/google-tools-direct.service.ts
src/lib/services/puppeteer-google-tools.service.ts
src/lib/services/real-google-tools-scraper.service.ts
src/lib/services/recommendations-markdown.service.ts
src/lib/services/revenue-focused-elements-value.service.ts
src/lib/services/revenue-focused-golden-circle.service.ts
src/lib/services/revenue-trends-analysis.service.ts
src/lib/services/seo-actionable-analysis.service.ts
src/lib/services/simple-actionable-report.service.ts
src/lib/services/simple-clifton-strengths.service.ts
src/lib/services/simple-synonym-detection.service.ts
src/lib/services/standalone-clifton-strengths.service.ts
src/lib/services/standalone-elements-value-b2b.service.ts
src/lib/services/standalone-elements-value.service.ts
src/lib/services/standalone-golden-circle.service.ts
src/lib/services/structured-storage.service.ts
src/lib/services/synonym-detection.service.ts
src/lib/services/unified-analysis.service.ts
src/lib/services/value-headlines-extractor.service.ts
```

### ⚠️ Verify Dependencies Before Removing:
Check if these are imported by `enhanced-analysis.service.ts` or `compare/route.ts`:
- `src/lib/free-ai-analysis.ts` (keep if used)
- `src/lib/universal-puppeteer-scraper.ts` (keep - used by compare)

---

## 🗑️ Other App Routes to Archive

### Auth Routes (Remove or Keep Minimal):
```
src/app/auth/** (all signin, signup, forgot-password routes)
```

### Other Pages:
```
src/app/profile/page.tsx
src/app/test/** (all test routes)
src/app/analysis/** (all analysis routes)
```

### Text Files:
```
src/app/*.txt (blog.txt, docs.txt, signin.txt, signup.txt, forgot-password.txt)
```

---

## 🗑️ Test Files to Archive

```
src/test/** (entire directory)
tests/** (entire directory)
test-*.sh (all shell test files)
test-results.txt
```

---

## 🗑️ Working Directory to Archive

```
src/working/** (entire directory)
```

---

## ✅ Files to KEEP (Essential)

### Pages (4):
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/content-comparison/page.tsx`
- `src/app/dashboard/reports/page.tsx`

### Layout & Global:
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/providers.tsx`
- `src/components/DevToolsInitializer.tsx`
- `src/components/error/ErrorBoundary.tsx`

### Components:
- `src/components/analysis/ContentComparisonPage.tsx`
- `src/components/ui/**` (all UI components)

### APIs (2):
- `src/app/api/analyze/compare/route.ts`
- `src/app/api/analyze/enhanced/route.ts`

### Services:
- `src/lib/ai-engines/enhanced-analysis.service.ts`
- `src/lib/ai-engines/framework-integration.service.ts`
- `src/lib/free-ai-analysis.ts` (verify usage)
- `src/lib/universal-puppeteer-scraper.ts`
- `src/lib/shared/client-storage.ts`
- `src/lib/shared/report-aggregator.ts`
- `src/lib/prisma.ts`

### Framework Knowledge:
- `src/lib/ai-engines/framework-knowledge/**/*.json` (all JSON files)
- `src/lib/ai-engines/assessment-rules/**/*.json` (all JSON files)

### Contexts:
- `src/contexts/auth-context.tsx`

### Config:
- All config files (package.json, tsconfig.json, etc.)

---

## 📊 Summary

**Total Files to Eliminate:**
- ~29 dashboard pages
- ~37 analysis components
- ~80+ API routes
- ~32 services
- ~10+ other routes/pages
- Test files and working directory

**Estimated Reduction:** ~180-200 files

---

## ⚠️ Before Deleting

1. **Check Dependencies**: Use `grep -r` to verify files aren't imported elsewhere
2. **Test Essential Pages**: Ensure home, dashboard, content-comparison, and reports still work
3. **Archive First**: Consider moving to `src/archived/` before deleting permanently
4. **Commit Incrementally**: Delete in batches and test after each batch

