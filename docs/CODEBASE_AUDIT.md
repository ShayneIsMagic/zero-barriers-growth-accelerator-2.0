# Codebase Audit: Active vs Inactive Code

## 🟢 Active Code (Used in Production)

### Production Dashboard Features (from `/dashboard` page)

**Status: "ready" - All active and working:**

1. **Content Comparison** (`/dashboard/content-comparison`)
   - Component: `src/components/analysis/ContentComparisonPage.tsx` ✅
   - API: `src/app/api/analyze/compare/route.ts` ✅
   - Storage: LocalForage + Supabase sync ✅
   - **Active**

2. **B2C Elements of Value** (`/dashboard/elements-value-b2c`)
   - Component: `src/components/analysis/B2CElementsPage.tsx` ✅
   - API: `src/app/api/analyze/elements-value-b2c-standalone/route.ts` ✅
   - Service: `src/lib/services/elements-value-b2c.service.ts` ✅
   - **Active**

3. **B2B Elements of Value** (`/dashboard/elements-value-b2b`)
   - Component: `src/components/analysis/B2BElementsPage.tsx` ✅
   - API: `src/app/api/analyze/elements-value-b2b-standalone/route.ts` ✅
   - Service: `src/lib/services/elements-value-b2b.service.ts` ✅
   - **Active**

4. **Unified Analysis** (`/dashboard/unified-analysis`)
   - Component: `src/components/analysis/UnifiedAnalysisPage.tsx` ✅
   - API: `src/app/api/analyze/unified/route.ts` ✅
   - **Active**

5. **Multi-Page Scraping** (`/dashboard/multi-page-scraping`)
   - Component: `src/components/analysis/MultiPageScrapingPage.tsx` ✅
   - **Active**

6. **Google Tools** (`/dashboard/google-tools`)
   - Component: `src/components/analysis/GoogleToolsPage.tsx` ✅
   - **Active**

7. **Automated Google Tools** (`/dashboard/automated-google-tools`)
   - Component: `src/components/analysis/AutomatedGoogleToolsPage.tsx` ✅
   - Service: `src/lib/services/puppeteer-google-tools.service.ts` ✅
   - **Active**

8. **CliftonStrengths** (`/dashboard/clifton-strengths-simple`)
   - Component: `src/components/analysis/CliftonStrengthsPage.tsx` or `SimpleCliftonStrengthsPage.tsx` ✅
   - API: `src/app/api/analyze/clifton-strengths-standalone/route.ts` ✅
   - Service: `src/lib/services/clifton-strengths-detailed.service.ts` ✅
   - **Active**

9. **Golden Circle** (`/dashboard/golden-circle-standalone`)
   - Component: `src/components/analysis/GoldenCirclePage.tsx` ✅
   - API: `src/app/api/analyze/golden-circle-standalone/route.ts` ✅
   - Service: `src/lib/services/golden-circle-detailed.service.ts` ✅
   - **Active**

10. **Revenue-Focused Elements** (`/dashboard/elements-value-standalone`)
    - API: `src/app/api/analyze/elements-value-standalone/route.ts` ✅
    - **Active**

11. **Revenue Trends** (`/dashboard/revenue-trends`)
    - Component: `src/components/analysis/RevenueTrendsPage.tsx` ✅
    - API: `src/app/api/analyze/revenue-trends/route.ts` ✅
    - **Active**

12. **Reports Dashboard** (`/dashboard/reports`)
    - Page: `src/app/dashboard/reports/page.tsx` ✅
    - Storage: `src/lib/shared/client-storage.ts` ✅
    - **Active (New Feature)**

### Core Infrastructure (Active)

- **Storage**: `src/lib/shared/client-storage.ts` ✅
- **Report Aggregator**: `src/lib/shared/report-aggregator.ts` ✅
- **Unified Storage**: `src/lib/storage/unified-storage.ts` ✅
- **Safe Prisma Wrapper**: `src/lib/storage/prisma-safe-wrapper.ts` ✅
- **Universal Scraper**: `src/lib/universal-puppeteer-scraper.ts` ✅
- **Prisma Client**: `src/lib/prisma.ts` ✅ (with graceful degradation)

---

## 🟡 Inactive/Unused Code (Not Linked in Dashboard)

### Dashboard Pages Not in "ready" Status

1. **Phase Pages** (Testing/Coming Soon)
   - `src/app/dashboard/phase2/page.tsx` - Status unclear
   - `src/app/dashboard/phase3/page.tsx` - Status unclear
   - `src/app/dashboard/phased-analysis/page.tsx` - May be duplicate
   - **Action**: Verify if used, else archive

2. **Enhanced/Duplicate Pages**
   - `src/app/dashboard/enhanced-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/controlled-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/comprehensive-analysis/page.tsx` - Not in dashboard list
   - **Action**: Archive if unused

3. **Step-by-Step Variants**
   - `src/app/dashboard/step-by-step-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/step-by-step-execution/page.tsx` - Only linked from home
   - **Action**: Verify usage

4. **Analysis Pages**
   - `src/app/dashboard/analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/analyze/page.tsx` - Not in dashboard list
   - `src/app/dashboard/page-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/seo-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/website-analysis/page.tsx` - Not in dashboard list
   - `src/app/dashboard/progressive-analysis/page.tsx` - Not in dashboard list
   - **Action**: Archive if unused

5. **Coming Soon Pages**
   - `src/app/dashboard/coming-soon/page.tsx` - Linked from dashboard ✅
   - `src/app/dashboard/clean/page.tsx` - Alternative dashboard variant
   - **Action**: Keep coming-soon, verify clean

6. **Evaluation/Executive**
   - `src/app/dashboard/evaluation-guide/page.tsx` - Not in dashboard list
   - `src/app/dashboard/executive-reports/page.tsx` - Linked from home page
   - **Action**: Verify if used

### Components Not Linked

1. **ContentComparisonEnhancedPage.tsx**
   - Status: Comment says "Does NOT change or delete the original"
   - **Action**: Archive or consolidate with main version

2. **Components in archived/working directories**
   - `src/archived/broken-services/` - Empty directory
   - `src/working/` - Has subdirectories but not imported
   - **Action**: Review and archive

### API Routes Not Used

1. **Phase APIs** (if phases inactive)
   - `src/app/api/analyze/phase1-complete/route.ts`
   - `src/app/api/analyze/phase2-complete/route.ts`
   - `src/app/api/analyze/phase3-complete/route.ts`
   - `src/app/api/analyze/phase/route.ts`
   - **Action**: Archive if phases not active

2. **Individual Analysis Routes** (may be duplicates)
   - `src/app/api/analyze/individual/b2c-elements/route.ts`
   - `src/app/api/analyze/individual/b2b-elements/route.ts`
   - `src/app/api/analyze/individual/clifton-strengths/route.ts`
   - `src/app/api/analyze/individual/golden-circle/route.ts`
   - **Action**: Compare with standalone routes, archive duplicates

3. **Test/Debug Routes**
   - `src/app/api/test-*/route.ts` - All test routes
   - `src/app/api/debug-user/route.ts`
   - **Action**: Move to `src/app/api/_test/` or archive

4. **Legacy Analysis Routes**
   - `src/app/api/analyze/website/route.ts` - May be superseded
   - `src/app/api/analyze/website/enhanced/route.ts` - Enhanced variant
   - **Action**: Verify if used

---

## 🔴 Empty/Placeholder Files

### Text Files (Placeholders)
- `src/app/blog.txt` - Contains only "Blog Page"
- `src/app/docs.txt` - Contains only "Docs Page"
- `src/app/signin.txt` - Contains only "Sign In Page"
- `src/app/signup.txt` - Contains only "Signup Page"
- `src/app/forgot-password.txt` - Contains only "Forgot Password Page"
- **Action**: Delete or implement

### Empty Directories
- `src/archived/broken-services/` - Empty
- **Action**: Remove if truly empty

### Test/Development Pages
- `src/app/test/page.tsx` - Test page
- `src/app/test-login/page.tsx` - Test login
- **Action**: Move to `src/app/_dev/` or archive

---

## 📁 Files Needing Organization

### 1. Archive These Directories

**Move to `src/archived/` or delete:**
- `src/working/` - Entire directory (not imported anywhere)
  - `src/working/api/`
  - `src/working/components/`
  - `src/working/pages/`
  - `src/working/services/`
  - **Reason**: Not imported, likely old working directory

### 2. Consolidate Duplicate Components

**Merge or choose one:**
- `ContentComparisonPage.tsx` vs `ContentComparisonEnhancedPage.tsx`
  - Enhanced version has comment saying "Does NOT change or delete original"
  - **Action**: Consolidate features, delete duplicate

### 3. Organize API Routes

**Create structure:**
```
src/app/api/
├── analyze/
│   ├── compare/ ✅ Active
│   ├── elements-value-b2c-standalone/ ✅ Active
│   ├── elements-value-b2b-standalone/ ✅ Active
│   ├── golden-circle-standalone/ ✅ Active
│   ├── clifton-strengths-standalone/ ✅ Active
│   ├── enhanced/ ✅ Active (Content Comparison framework reuse)
│   ├── unified/ ✅ Active
│   └── _legacy/ (archive)
│       ├── phase1-complete/
│       ├── phase2-complete/
│       └── individual/
└── _test/ (archive)
    ├── test-*
    └── debug-user/
```

### 4. Remove Placeholder Files

**Delete immediately:**
- `src/app/*.txt` files (5 files)
- Empty `src/archived/broken-services/` directory

---

## 📊 Summary

### Active Code (Keep)
- ✅ 12 production dashboard features
- ✅ Content Comparison with new features
- ✅ Reports Dashboard (new)
- ✅ Core storage/services infrastructure
- ✅ All "ready" status features from dashboard

### Inactive Code (Archive/Remove)
- ⚠️ ~15+ dashboard pages not in "ready" list
- ⚠️ `src/working/` entire directory
- ⚠️ Test/debug API routes
- ⚠️ Phase APIs (if phases inactive)
- ⚠️ Duplicate component variants

### Empty/Placeholder (Delete)
- 🔴 5 `.txt` placeholder files
- 🔴 Empty `broken-services` directory
- 🔴 Test pages (move to `_dev` or archive)

### Files That Will Be Empty After Organizing

**Safe to delete (will be empty):**
- `src/archived/broken-services/` - Already empty
- Possibly `src/working/` subdirectories if no files

**After moving unused code:**
- No files should remain empty - everything will be archived or deleted

---

## 🎯 Recommended Cleanup Actions

1. **Immediate (Safe):**
   - Delete all `.txt` placeholder files
   - Delete empty `broken-services/` directory
   - Move test routes to `src/app/api/_test/`

2. **After Verification:**
   - Archive `src/working/` if confirmed unused
   - Consolidate `ContentComparisonEnhancedPage` into main
   - Archive inactive dashboard pages
   - Archive phase APIs if phases inactive

3. **Documentation:**
   - Update README with only active features
   - Add `ARCHIVED.md` explaining archived code purpose

