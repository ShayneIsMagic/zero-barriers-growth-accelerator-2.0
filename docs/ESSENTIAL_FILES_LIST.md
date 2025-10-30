# Essential Files List - Keep These

## ✅ Core Pages (3)
- `src/app/page.tsx` - Home page
- `src/app/dashboard/page.tsx` - Dashboard
- `src/app/dashboard/content-comparison/page.tsx` - Content Comparison route

## ✅ Layout & Global
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Global styles
- `src/components/layout/header.tsx` - Navigation header
- `src/components/layout/footer.tsx` - Footer
- `src/components/providers.tsx` - React providers
- `src/components/DevToolsInitializer.tsx` - Dev tools
- `src/components/error/ErrorBoundary.tsx` - Error handling

## ✅ Content Comparison
- `src/components/analysis/ContentComparisonPage.tsx` - Main component

## ✅ APIs (2 routes)
- `src/app/api/analyze/compare/route.ts` - Content comparison API
- `src/app/api/analyze/enhanced/route.ts` - Framework analysis API

## ✅ Services (Dependencies)
- `src/lib/free-ai-analysis.ts` - Used by compare route
- `src/lib/ai-engines/enhanced-analysis.service.ts` - Used by enhanced route
- `src/lib/universal-puppeteer-scraper.ts` - Used by compare route
- `src/lib/shared/client-storage.ts` - Used by ContentComparisonPage
- `src/lib/shared/report-aggregator.ts` - Used by ContentComparisonPage
- `src/lib/prisma.ts` - Database (graceful degradation)

## ✅ UI Components (All)
- `src/components/ui/**/*` - All UI components (used by all pages)

## ✅ Contexts
- `src/contexts/auth-context.tsx` - Used by Header

## ✅ Config Files
- `package.json`, `package-lock.json`
- `tsconfig.json`, `next.config.js`, `tailwind.config.js`
- `postcss.config.js`, `.eslintrc.cjs`, `vercel.json`

## ✅ Documentation
- `README.md`
- `docs/STORAGE_ARCHITECTURE.md`
- `docs/SUPABASE_CLEANUP_GUIDE.md`
- `docs/CODEBASE_AUDIT.md`
- `docs/CLEANUP_PLAN.md`
- `docs/ESSENTIAL_FILES_LIST.md`

---

## 🗑️ Everything Else → Archive or Delete

