# Git Workflow Plan
## Safe Branch Strategy for Production Code + Fixes

**Date:** January 2025  
**Goal:** Push working production code to main, create separate branch for fixes

---

## RECOMMENDED WORKFLOW ✅

This is a **BEST PRACTICE** approach and will **NOT break things**. Here's why:

1. **Main branch** = Stable, working production code
2. **Fix branch** = Isolated changes that don't affect main until merged
3. **Safe workflow** = Can always revert to main if fixes cause issues

---

## STEP-BY-STEP PLAN

### Phase 1: Prepare Main Branch (Production Ready)

1. **Ensure main branch is clean and working**
   ```bash
   git status
   git add .
   git commit -m "feat: Production-ready features - Content Comparison, Puppeteer, Local Forage, Content Exporter"
   ```

2. **Verify build passes**
   ```bash
   npm run build
   npm run type-check
   ```

3. **Push to GitHub main branch**
   ```bash
   git push origin main
   ```

### Phase 2: Create Fix Branch

1. **Create new branch from main**
   ```bash
   git checkout -b fix/audit-issues
   ```

2. **Work on fixes in this branch**
   - Fix TypeScript errors
   - Remove unused dependencies
   - Add missing dependencies
   - Remove deprecated code
   - Update dependencies

3. **Test fixes thoroughly**
   ```bash
   npm run type-check
   npm run build
   npm run lint:check
   ```

4. **Commit fixes incrementally**
   ```bash
   git add .
   git commit -m "fix: Remove unused dependencies and fix TypeScript errors"
   ```

5. **Push fix branch to GitHub**
   ```bash
   git push origin fix/audit-issues
   ```

### Phase 3: Merge When Ready

1. **When fixes are tested and working**
   ```bash
   git checkout main
   git merge fix/audit-issues
   git push origin main
   ```

2. **If fixes cause issues, revert easily**
   ```bash
   git checkout main
   git reset --hard origin/main  # Revert to last known good state
   ```

---

## BENEFITS OF THIS APPROACH

✅ **Main branch stays stable** - Production code always works  
✅ **Fixes are isolated** - Can test without breaking main  
✅ **Easy rollback** - Can revert to main anytime  
✅ **Team collaboration** - Others can review fix branch before merge  
✅ **CI/CD safe** - Main branch deployments continue working  

---

## CURRENT STATUS CHECKLIST

Before pushing main:

- [ ] All TypeScript errors fixed? (2 remaining - need to verify)
- [ ] Build passes? (`npm run build`)
- [ ] Type check passes? (`npm run type-check`)
- [ ] No critical runtime errors?
- [ ] Content Comparison working?
- [ ] Puppeteer collection working?
- [ ] Local Forage storage working?

---

## RECOMMENDED BRANCH NAMES

- **Main branch:** `main` (production-ready)
- **Fix branch:** `fix/audit-issues` or `fix/dependencies-cleanup`
- **Feature branches:** `feat/feature-name`
- **Hotfix branches:** `hotfix/critical-issue`

---

## SAFETY MEASURES

1. **Never force push to main**
   ```bash
   # ❌ DON'T DO THIS
   git push --force origin main
   
   # ✅ DO THIS INSTEAD
   git push origin main
   ```

2. **Always test before merging**
   ```bash
   npm run build
   npm run type-check
   npm run lint:check
   ```

3. **Keep main branch protected** (GitHub settings)
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

---

## QUICK COMMAND REFERENCE

```bash
# Check current status
git status

# See what branch you're on
git branch

# Create and switch to fix branch
git checkout -b fix/audit-issues

# Switch back to main
git checkout main

# See differences between branches
git diff main..fix/audit-issues

# Merge fix branch into main (when ready)
git checkout main
git merge fix/audit-issues
git push origin main
```

---

**Status:** ✅ **SAFE TO PROCEED**  
**Risk Level:** 🟢 **LOW** (Branch isolation protects main)  
**Recommendation:** ✅ **YES, DO THIS**

