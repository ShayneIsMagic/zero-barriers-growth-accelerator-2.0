# Cleanup Execution Guide

Step-by-step guide to safely eliminate files from the cleanup branch.

## 📋 Prerequisites

1. ✅ All changes committed to current branch
2. ✅ Backup created (git branch backup-before-cleanup)
3. ✅ Reviewed `FILES_TO_ELIMINATE.md`

## 🔍 Step 1: Check Dependencies

Before deleting anything, verify what's actually being used.

### Run Dependency Check Script

```bash
# From project root
./scripts/check-dependencies.sh
```

This will:
- Check all files marked for elimination
- Find any imports/references to those files
- Generate `docs/DEPENDENCY_CHECK_RESULTS.md`

### Review Results

```bash
# View the results
cat docs/DEPENDENCY_CHECK_RESULTS.md
```

**Action Required:**
- Files listed as "Still Referenced" should NOT be deleted
- Either update those files to remove dependencies OR keep the referenced files
- Re-run the check until all dependencies are cleared

## 📦 Step 2: Archive Files (Safe Removal)

Archive files first before permanent deletion. This preserves them in case you need to restore.

### Dry Run First

```bash
# See what would be archived (no actual changes)
./scripts/archive-files.sh --dry-run
```

### Archive for Real

```bash
# Actually move files to archive directories
./scripts/archive-files.sh
```

This will:
- Create `src/archived/` directory structure
- Move files (preserving git history with `git mv`)
- Organize by category (dashboard-pages, analysis-components, etc.)

### Manual Archive (If Needed)

If scripts don't cover everything, manually move files:

```bash
# Create archive structure
mkdir -p src/archived/{dashboard-pages,analysis-components,api-routes,services}

# Move files (example)
git mv src/app/dashboard/analysis src/archived/dashboard-pages/
```

## ✅ Step 3: Test Essential Pages

After archiving, verify the essential pages still work:

```bash
# Start dev server
npm run dev
```

**Test These Pages:**
1. ✅ Home page: `http://localhost:3000/`
2. ✅ Dashboard: `http://localhost:3000/dashboard`
3. ✅ Content Comparison: `http://localhost:3000/dashboard/content-comparison`
4. ✅ Reports: `http://localhost:3000/dashboard/reports`

**Verify Functionality:**
- ✅ Content comparison can scrape and analyze
- ✅ Framework dropdown works
- ✅ Reports page shows saved analyses
- ✅ No console errors

## 🧹 Step 4: Clean Up Empty Directories

After archiving, remove empty directories:

```bash
# Find empty directories
find src/app/dashboard -type d -empty
find src/components/analysis -type d -empty
find src/app/api -type d -empty

# Remove empty directories (be careful!)
find src/app/dashboard -type d -empty -delete
find src/components/analysis -type d -empty -delete
find src/app/api -type d -empty -delete
```

## 🗑️ Step 5: Permanent Deletion (Optional)

**⚠️ Only after thorough testing and you're certain you won't need these files.**

### Option A: Keep Archived (Recommended)

Keep archived files for now. They're out of the way but restorable if needed.

### Option B: Delete Archived Files

```bash
# WARNING: This is permanent!
rm -rf src/archived/
```

## 📊 Step 6: Verify Cleanup

Check the reduction:

```bash
# Count files before/after
echo "Files remaining in essential directories:"
find src/app/dashboard -name "*.tsx" -o -name "*.ts" | wc -l
find src/components/analysis -name "*.tsx" | wc -l
find src/app/api -name "route.ts" | wc -l
find src/lib/services -name "*.ts" | wc -l
```

## 🔄 Step 7: Commit Changes

```bash
# Commit archive moves
git add src/archived/
git add docs/DEPENDENCY_CHECK_RESULTS.md
git commit -m "chore: archive unused dashboard pages, components, and API routes"

# If deleting permanently
git rm -r src/archived/
git commit -m "chore: permanently remove archived files"
```

## 🚨 Troubleshooting

### "File not found" errors
- Some files may have already been deleted
- Check if paths in `FILES_TO_ELIMINATE.md` are correct

### "Still referenced" warnings
- Review `DEPENDENCY_CHECK_RESULTS.md`
- Remove or update the referencing code
- Re-run dependency check

### Broken imports after archiving
- Check `DEPENDENCY_CHECK_RESULTS.md` for missed references
- Restore specific files from archive if needed:
  ```bash
  cp src/archived/services/myservice.ts src/lib/services/
  ```

### Essential pages not working
- Check browser console for errors
- Verify imports in kept files
- Restore from archive if necessary

## 📝 Checklist

Before considering cleanup complete:

- [ ] Dependency check run and reviewed
- [ ] All references resolved or files kept
- [ ] Files archived successfully
- [ ] Essential pages tested and working
- [ ] No console errors
- [ ] Empty directories cleaned up
- [ ] Changes committed to git
- [ ] Pushed to cleanup branch

## 🎯 Expected Results

**After cleanup:**
- ~29 dashboard pages archived → 3 remaining (dashboard, content-comparison, reports)
- ~37 analysis components archived → 1 remaining (ContentComparisonPage)
- ~80+ API routes archived → 2 remaining (compare, enhanced)
- ~32 services archived → ~4-5 remaining (essential dependencies)

**Total reduction:** ~180-200 files archived/deleted

