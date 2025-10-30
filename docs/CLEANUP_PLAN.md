# Cleanup Plan: Keep Only Essential Pages

## 🎯 Goal

Keep only code for these three pages:
1. **Home**: `/` → `src/app/page.tsx`
2. **Dashboard**: `/dashboard` → `src/app/dashboard/page.tsx`
3. **Content Comparison**: `/dashboard/content-comparison` → `src/app/dashboard/content-comparison/page.tsx`

Plus global styling and navigation.

---

## ✅ FILES TO KEEP (Essential)

### Pages
- `src/app/page.tsx` ✅ (Home)
- `src/app/dashboard/page.tsx` ✅ (Dashboard)
- `src/app/dashboard/content-comparison/page.tsx` ✅ (Content Comparison)
- `src/app/layout.tsx` ✅ (Root layout with Header/Footer)

### Global Styling & Navigation
- `src/app/globals.css` ✅
- `src/components/layout/header.tsx` ✅
- `src/components/layout/footer.tsx` ✅
- `src/components/providers.tsx` ✅
- `src/components/DevToolsInitializer.tsx` ✅
- `src/components/error/ErrorBoundary.tsx` ✅ (used by Providers)

### Content Comparison Component
- `src/components/analysis/ContentComparisonPage.tsx` ✅

### Content Comparison APIs
- `src/app/api/analyze/compare/route.ts` ✅
- `src/app/api/analyze/enhanced/route.ts` ✅ (for framework dropdown)

### UI Components (All - Used by pages)
- `src/components/ui/**` ✅ (all UI components)

### Contexts
- `src/contexts/auth-context.tsx` ✅ (used by Header)

### Storage Libraries
- `src/lib/shared/client-storage.ts` ✅
- `src/lib/shared/report-aggregator.ts` ✅

### Core Services
- `src/lib/universal-puppeteer-scraper.ts` ✅ (used by compare API)
- `src/lib/free-ai-analysis.ts` ✅ (used by compare API)
- `src/lib/ai-engines/enhanced-analysis.service.ts` ✅ (used by enhanced API)
- `src/lib/prisma.ts` ✅ (graceful degradation)

### Configuration
- `package.json` ✅
- `package-lock.json` ✅
- `tsconfig.json` ✅
- `next.config.js` ✅
- `tailwind.config.js` ✅
- `postcss.config.js` ✅
- `.eslintrc.cjs` ✅
- `vercel.json` ✅

### Documentation
- `README.md` ✅
- `docs/STORAGE_ARCHITECTURE.md` ✅
- `docs/SUPABASE_CLEANUP_GUIDE.md` ✅
- `docs/CODEBASE_AUDIT.md` ✅
- `docs/CLEANUP_PLAN.md` ✅

---

## 🗑️ FILES TO ARCHIVE/MOVE

### Dashboard Pages (Remove - Not Used)
Move to `src/archived/dashboard-pages/`:
- `src/app/dashboard/analysis/page.tsx`
- `src/app/dashboard/analyze/page.tsx`
- `src/app/dashboard/automated-google-tools/page.tsx`
- `src/app/dashboard/clifton-strengths/page.tsx`
- `src/app/dashboard/clifton-strengths-simple/page.tsx`
- `src/app/dashboard/coming-soon/page.tsx`
- `src/app/dashboard/comprehensive-analysis/page.tsx`
- `src/app/dashboard/controlled-analysis/page.tsx`
- `src/app/dashboard/elements-of-value/page.tsx`
- `src/app/dashboard/elements-value-b2b/page.tsx`
- `src/app/dashboard/elements-value-b2c/page.tsx`
- `src/app/dashboard/elements-value-standalone/page.tsx`
- `src/app/dashboard/enhanced-analysis/page.tsx`
- `src/app/dashboard/evaluation-guide/page.tsx`
- `src/app/dashboard/executive-reports/page.tsx`
- `src/app/dashboard/golden-circle-standalone/page.tsx`
- `src/app/dashboard/google-tools/page.tsx`
- `src/app/dashboard/multi-page-scraping/page.tsx`
- `src/app/dashboard/page-analysis/page.tsx`
- `src/app/dashboard/phase2/page.tsx`
- `src/app/dashboard/phase3/page.tsx`
- `src/app/dashboard/phased-analysis/page.tsx`
- `src/app/dashboard/progressive-analysis/page.tsx`
- `src/app/dashboard/reports/page.tsx` (Keep? Or archive - it's new but not essential)
- `src/app/dashboard/revenue-trends/page.tsx`
- `src/app/dashboard/seo-analysis/page.tsx`
- `src/app/dashboard/step-by-step-analysis/page.tsx`
- `src/app/dashboard/step-by-step-execution/page.tsx`
- `src/app/dashboard/unified-analysis/page.tsx`
- `src/app/dashboard/website-analysis/page.tsx`
- `src/app/dashboard/clean/page.tsx`

### Analysis Components (Archive)
Move to `src/archived/analysis-components/`:
- All `src/components/analysis/*.tsx` EXCEPT:
  - `ContentComparisonPage.tsx` ✅ (Keep)

### API Routes (Archive)
Move to `src/archived/api-routes/`:
- All `src/app/api/**` EXCEPT:
  - `src/app/api/analyze/compare/route.ts` ✅ (Keep)
  - `src/app/api/analyze/enhanced/route.ts` ✅ (Keep)

### Services (Archive - Not Used by Essential Pages)
Move to `src/archived/services/`:
- All `src/lib/services/**` EXCEPT those imported by kept APIs
- All `src/lib/ai-engines/**` EXCEPT:
  - `src/lib/ai-engines/enhanced-analysis.service.ts` ✅ (Keep)

### Other App Routes (Archive)
Move to `src/archived/app-routes/`:
- `src/app/auth/**` (signin, signup, forgot-password)
- `src/app/profile/page.tsx`
- `src/app/test/**`
- `src/app/analysis/**`
- `src/app/*.txt` (blog.txt, docs.txt, signin.txt, signup.txt, forgot-password.txt)

### Working Directory (Archive)
- `src/working/**` (entire directory)

### Test Files (Archive)
- `src/test/**`
- `tests/**`
- `test-*.sh`
- `test-results.txt`

---

## 📋 Cleanup Execution Steps

### Step 1: Create Archive Directories
```bash
mkdir -p src/archived/dashboard-pages
mkdir -p src/archived/analysis-components
mkdir -p src/archived/api-routes
mkdir -p src/archived/services
mkdir -p src/archived/app-routes
mkdir -p src/archived/working
```

### Step 2: Move Files to Archive
- Use `git mv` to preserve history
- Or move manually and commit

### Step 3: Update Imports
- Check for broken imports
- Update any cross-references

### Step 4: Test Essential Pages
- Verify home page loads
- Verify dashboard loads
- Verify content comparison works

### Step 5: Clean Up Empty Directories
- Remove empty directories after archiving

---

## ⚠️ Edge Cases to Handle

1. **Dashboard `/reports` page**: New feature, but not essential. Decide: Keep or archive?
2. **Auth routes**: Header links to `/auth/signin` and `/auth/signup`. Options:
   - Keep minimal auth pages
   - Or remove auth links from header temporarily
3. **Enhanced Analysis Service**: May have dependencies. Check before archiving.

---

## 🎯 Expected Result

**Active Code:**
- 3 pages (home, dashboard, content-comparison)
- 2 API routes (compare, enhanced)
- 1 analysis component (ContentComparisonPage)
- Global layout/navigation
- Essential services and storage

**Archived Code:**
- ~30+ dashboard pages
- ~20+ analysis components
- ~50+ API routes
- All unused services

**Empty After Cleanup:**
- Some `src/app/dashboard/*` directories (moved to archive)
- `src/archived/broken-services/` (already empty - can delete)

