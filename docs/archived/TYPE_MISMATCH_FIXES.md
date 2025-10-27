# 🔧 Type Mismatch Fixes - Complete Summary

**Problem:** Existing Prisma tables use `TEXT` for IDs, new schema used `UUID` for foreign keys

**Solution:** Changed ALL foreign key columns from `UUID` to `TEXT`

---

## ✅ FIXED COLUMNS

### **User References (TEXT, not UUID)**

```sql
user_id TEXT REFERENCES "User"(id)
created_by TEXT REFERENCES "User"(id)
updated_by TEXT REFERENCES "User"(id)
```

**Tables affected:** ~25 tables

---

### **Analysis References (TEXT, not UUID)**

```sql
analysis_id TEXT REFERENCES "Analysis"(id)
analysis_id_old TEXT REFERENCES "Analysis"(id)
analysis_id_new TEXT REFERENCES "Analysis"(id)
```

**Tables affected:** ~60 tables

---

### **Function Parameters**

```sql
-- Before:
p_user_id UUID
p_analysis_id UUID

-- After:
p_user_id TEXT
p_analysis_id TEXT
```

**Functions affected:**

- `deduct_credits()`
- `calculate_overall_score()`

---

## 📊 VERIFICATION

All foreign keys now match Prisma schema:

```sql
-- Existing Prisma tables
CREATE TABLE "User" (
  id TEXT PRIMARY KEY ...  ✅
);

CREATE TABLE "Analysis" (
  id TEXT PRIMARY KEY ...  ✅
);

-- New tables reference with TEXT
CREATE TABLE websites (
  created_by TEXT REFERENCES "User"(id) ...  ✅
);

CREATE TABLE golden_circle_analyses (
  analysis_id TEXT REFERENCES "Analysis"(id) ...  ✅
);
```

---

## 🎯 REMAINING UUID COLUMNS

These are **correct** as-is (they reference tables that use UUID):

```sql
-- Internal foreign keys (UUID to UUID)
website_id UUID REFERENCES websites(id)  ✅
golden_circle_id UUID REFERENCES golden_circle_analyses(id)  ✅
lighthouse_id UUID REFERENCES lighthouse_analyses(id)  ✅
... etc
```

**These do NOT need to change** because:

- `websites.id` is UUID
- `golden_circle_analyses.id` is UUID
- All new tables use UUID for their primary keys
- Only references to Prisma tables (`User`, `Analysis`) use TEXT

---

## 🚀 READY TO RUN

SQL is now fully compatible with existing Prisma schema!

**No more type mismatches!** ✅
