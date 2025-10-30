# Documentation Cleanup: Keep vs Eject

## ✅ KEEP - Essential Documentation (Referenced in README)

### 1. **FRAMEWORK_COMPREHENSIVE_MAP.md** ⭐ **REQUIRED**
- **Status:** ✅ **KEEP** - Linked from README line 448
- **Purpose:** Complete framework reference with all elements, categories, subcategories, counts
- **Why Keep:** Essential reference for framework knowledge, used by developers

### 2. **STORAGE_ARCHITECTURE.md** ⭐ **REQUIRED**
- **Status:** ✅ **KEEP** - Linked from README line 449
- **Purpose:** Hybrid storage strategy (LocalForage + Supabase/Prisma)
- **Why Keep:** Documents critical architecture decision

### 3. **SUPABASE_CLEANUP_GUIDE.md** ⭐ **REQUIRED**
- **Status:** ✅ **KEEP** - Linked from README line 450
- **Purpose:** Database integration and graceful degradation patterns
- **Why Keep:** Essential for understanding database setup

### 4. **CONTENT_COMPARISON_FLOW.md** ⭐ **RECOMMENDED**
- **Status:** ✅ **KEEP** - Just created, documents core feature
- **Purpose:** Complete flow diagram and essential code for Content Comparison
- **Why Keep:** Critical for understanding how Puppeteer works with the page

### 5. **PUPPETEER_USAGE.md** ⭐ **RECOMMENDED**
- **Status:** ✅ **KEEP** - Just created, documents essential service
- **Purpose:** Puppeteer service documentation and troubleshooting
- **Why Keep:** Documents essential scraping service

---

## 📋 KEEP - Operational Documentation (Useful for Development)

### 6. **CLEANUP_EXECUTION_GUIDE.md**
- **Status:** ✅ **KEEP** - Useful reference
- **Purpose:** Step-by-step cleanup instructions
- **Why Keep:** May need to reference for future cleanups

### 7. **CLEANUP_SUMMARY.md**
- **Status:** ✅ **KEEP** - Historical record
- **Purpose:** What was done during cleanup
- **Why Keep:** Documents cleanup actions for future reference

---

## 🗑️ EJECT - One-Time Cleanup Docs (Can Archive/Remove)

### 8. **CLEANUP_PLAN.md**
- **Status:** ❌ **EJECT** - Planning doc, cleanup complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** Planning document, cleanup already done

### 9. **FINAL_CLEANUP_CHECKLIST.md**
- **Status:** ❌ **EJECT** - Checklist, cleanup complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** One-time checklist, no longer needed

### 10. **CODEBASE_AUDIT.md**
- **Status:** ❌ **EJECT** - Audit complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** One-time audit, cleanup complete

### 11. **FILES_TO_ELIMINATE.md**
- **Status:** ❌ **EJECT** - Cleanup complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** List already executed, files archived/removed

### 12. **ESSENTIAL_FILES_LIST.md**
- **Status:** ❌ **EJECT** - Reference only, cleanup complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** One-time reference, cleanup done

### 13. **USEFUL_CODE_TO_KEEP.md**
- **Status:** ❌ **EJECT** - Decision made, cleanup complete
- **Action:** Move to `docs/archived/` or delete
- **Reason:** Decision document, choices already made

### 14. **DEPENDENCY_CHECK_RESULTS.md**
- **Status:** ❌ **EJECT** - Results outdated
- **Action:** Move to `docs/archived/` or delete
- **Reason:** Old dependency check results, can regenerate if needed

---

## 🗑️ EJECT - Framework Coverage Docs (Redundant with Comprehensive Map)

### 15. **FRAMEWORK_COVERAGE_AUDIT.md**
- **Status:** ❌ **EJECT** - Superseded by Comprehensive Map
- **Action:** Move to `docs/archived/` or delete
- **Reason:** Framework Comprehensive Map is the source of truth

### 16. **FRAMEWORK_COVERAGE_SUMMARY.md**
- **Status:** ❌ **EJECT** - Superseded by Comprehensive Map
- **Action:** Move to `docs/archived/` or delete
- **Reason:** Framework Comprehensive Map is the source of truth

### 17. **FRAMEWORK_INTEGRITY_MEASURES.md**
- **Status:** ❌ **EJECT** - Check if used
- **Action:** Review first, then archive if not essential
- **Reason:** May be redundant or outdated

---

## ❓ CONDITIONAL - Cursor-Specific Docs (Review Needed)

### 18. **CURSOR_AGILE_WORKFLOW.md**
- **Status:** ❓ **REVIEW** - Cursor-specific workflow
- **Action:** Keep if you use Cursor workflows, else eject
- **Reason:** Only needed if following Cursor-specific processes

### 19. **CURSOR_DOCS_REFERENCE.md**
- **Status:** ❓ **REVIEW** - Cursor-specific reference
- **Action:** Keep if you use Cursor-specific features, else eject
- **Reason:** Only needed for Cursor IDE users

### 20. **CURSOR_SECURITY_ADDENDUM.md**
- **Status:** ❓ **REVIEW** - Security rules
- **Action:** Keep if adds value beyond standard security practices, else eject
- **Reason:** May duplicate `.cursorrules` or standard practices

### 21. **INTEGRATION_GUIDE.md**
- **Status:** ❓ **REVIEW** - Cursor docs integration
- **Action:** Keep if Cursor docs are kept, else eject
- **Reason:** Only useful if using other Cursor-specific docs

---

## ❓ CONDITIONAL - AI Prompt Docs (Review Needed)

### 22. **GEMINI_PROMPT_TEMPLATES.md**
- **Status:** ❓ **REVIEW** - Prompt templates
- **Action:** Keep if actively used for prompt engineering, else eject
- **Reason:** Useful for prompt development, but may be outdated

### 23. **GEMINI_PROMPT_USAGE.md**
- **Status:** ❓ **REVIEW** - Prompt usage guide
- **Action:** Keep if actively used, else eject
- **Reason:** May be superseded by actual code implementation

### 24. **STANDARD_AI_PROMPT_TEMPLATE.md**
- **Status:** ❓ **REVIEW** - Template reference
- **Action:** Keep if used as reference, else eject
- **Reason:** May be redundant with actual prompts in code

---

## 📦 Already Archived (No Action)

- `docs/archived/` - 157+ historical docs
- **Action:** ✅ Leave in archive (historical reference)

---

## 📊 Summary

### ✅ Keep (7 files):
1. FRAMEWORK_COMPREHENSIVE_MAP.md ⭐ (README linked)
2. STORAGE_ARCHITECTURE.md ⭐ (README linked)
3. SUPABASE_CLEANUP_GUIDE.md ⭐ (README linked)
4. CONTENT_COMPARISON_FLOW.md ⭐ (just created)
5. PUPPETEER_USAGE.md ⭐ (just created)
6. CLEANUP_EXECUTION_GUIDE.md (useful reference)
7. CLEANUP_SUMMARY.md (historical record)

### 🗑️ Eject (10 files):
1. CLEANUP_PLAN.md
2. FINAL_CLEANUP_CHECKLIST.md
3. CODEBASE_AUDIT.md
4. FILES_TO_ELIMINATE.md
5. ESSENTIAL_FILES_LIST.md
6. USEFUL_CODE_TO_KEEP.md
7. DEPENDENCY_CHECK_RESULTS.md
8. FRAMEWORK_COVERAGE_AUDIT.md
9. FRAMEWORK_COVERAGE_SUMMARY.md
10. FRAMEWORK_INTEGRITY_MEASURES.md (review first)

### ❓ Review Then Decide (7 files):
1. CURSOR_AGILE_WORKFLOW.md
2. CURSOR_DOCS_REFERENCE.md
3. CURSOR_SECURITY_ADDENDUM.md
4. INTEGRATION_GUIDE.md
5. GEMINI_PROMPT_TEMPLATES.md
6. GEMINI_PROMPT_USAGE.md
7. STANDARD_AI_PROMPT_TEMPLATE.md

---

## 🚀 Recommended Action Plan

### Phase 1: Archive One-Time Cleanup Docs (10 files)
```bash
mkdir -p docs/archived/cleanup-docs
mv docs/CLEANUP_PLAN.md docs/archived/cleanup-docs/
mv docs/FINAL_CLEANUP_CHECKLIST.md docs/archived/cleanup-docs/
mv docs/CODEBASE_AUDIT.md docs/archived/cleanup-docs/
mv docs/FILES_TO_ELIMINATE.md docs/archived/cleanup-docs/
mv docs/ESSENTIAL_FILES_LIST.md docs/archived/cleanup-docs/
mv docs/USEFUL_CODE_TO_KEEP.md docs/archived/cleanup-docs/
mv docs/DEPENDENCY_CHECK_RESULTS.md docs/archived/cleanup-docs/
mv docs/FRAMEWORK_COVERAGE_AUDIT.md docs/archived/cleanup-docs/
mv docs/FRAMEWORK_COVERAGE_SUMMARY.md docs/archived/cleanup-docs/
mv docs/FRAMEWORK_INTEGRITY_MEASURES.md docs/archived/cleanup-docs/
```

### Phase 2: Review Cursor & AI Docs (7 files)
Manually review and decide:
- Do you use Cursor-specific workflows? → Keep those docs
- Are AI prompt docs actively referenced? → Keep if yes
- Otherwise → Archive them

### Phase 3: Update README (if needed)
If any docs are archived, update README links if they break.

