# B2B Taxonomy Change — Frontend & Backend Impact Note

**Status:** Structural + scoring changes are **implemented in API/runtime**. **UI display, persistence, and some legacy prompts are not yet updated.**  
**Canonical structure:** [`B2B-BAIN-PYRAMID-TAXONOMY.md`](./B2B-BAIN-PYRAMID-TAXONOMY.md)  
**Last updated:** June 2026 (strength-first B2B/B2C standalone UI; archetype/Clifton personality panels documented in assessment guides)

---

## Why this note exists

The Bain-aligned B2B pyramid is not a documentation-only change. It affects:

1. **API response shape** (nested `subcategories`)
2. **Scoring rollups** (element → subcategory → category)
3. **AI prompts** (score elements only; runtime rolls up)
4. **Element definitions** (40 slugs, moved elements, removed `access` / `purpose` slugs)
5. **Frontend display** (must render three levels, not flat tier → elements)
6. **Backend evaluation** (Flask `enrich_b2b_categories()` parity)
7. **Persistence** (Prisma structured storage does not yet model subcategories)

**Read this before building or refactoring any B2B UI, report export, or storage layer.**

---

## What changed (summary)

| Area | Before | After |
|------|--------|-------|
| Element count | Drift (41–42) | **40** locked |
| Inspirational | `vision`, `hope_b2b` only; `purpose` as element | **Purpose** subcategory: `vision`, `hope_b2b`, `social_responsibility` |
| Functional | 9 elements incl. risk/reach/flex/component | **5** (Economic 2 + Performance 3) |
| Ease of Business | 18 elements; `access` slug | **21**; Strategic includes risk, reach, flexibility, component_quality |
| Tier response | Flat `elements` on every category | **Table Stakes** flat; others have `subcategories.*.elements` |
| Tier score | Avg of all elements in tier | Avg of **subcategory scores** (Table Stakes: avg of elements) |
| Grouping model | Labels first | **Value-first** — categories/subcategories defined by their elements |

---

## API contract (FE + BE consumers)

### `analysis.categories` shape

**Table Stakes** — flat (no subcategories):

```json
"table_stakes": {
  "categoryName": "Table Stakes",
  "categoryScore": 0.55,
  "elementCount": 4,
  "elements": { "meeting_specifications": { "score": 0.7, "evidence": "...", "recommendation": "..." } }
}
```

**All other tiers** — nested subcategories:

```json
"individual": {
  "categoryName": "Individual Value",
  "categoryScore": 0.478,
  "elementCount": 7,
  "subcategories": {
    "career": {
      "subcategoryName": "Career",
      "subcategoryScore": 0.517,
      "elementCount": 3,
      "elements": { "network_expansion": { "score": 0.6, "evidence": "...", "recommendation": "..." } }
    },
    "personal": {
      "subcategoryName": "Personal",
      "subcategoryScore": 0.438,
      "elementCount": 4,
      "elements": { "design_aesthetics_b2b": { "score": 0.4, "evidence": "...", "recommendation": "..." } }
    }
  }
}
```

### Display names

Use `B2B_ELEMENT_DISPLAY_NAMES` from `src/lib/framework/b2b-taxonomy.ts` (e.g. `design_aesthetics_b2b` → "Design & aesthetics"). Do not invent labels from slug splitting alone.

### Scores are 0.0–1.0 fractional

Many legacy FE components use `0–100` or `/10` (e.g. `AssessmentResultsView`). B2B chunked + Flask paths return **0.0–1.0**. Multiply by 100 for percentage display if needed.

### Overall score

`overallScore` = mean of **all 40 element scores** — not mean of 5 tier scores.

---

## Implemented (runtime — no FE work required for correctness)

| Layer | File | What it does |
|-------|------|--------------|
| Taxonomy SSOT | `src/lib/framework/b2b-taxonomy.ts` | Bain tree, display names, rollup, `getElementsForCategory()` |
| Chunks | `src/lib/framework/chunk-definitions.ts` | `B2B_CHUNK_CONFIG` — 40 elements |
| Definitions | `src/lib/elements/element-definitions.ts` | Keywords/descriptions per subcategory |
| Merge / API | `src/lib/chunked-framework-analysis.ts` | `rollupB2BCategoryBreakdown()` on merge |
| Route | `src/app/api/analyze/elements-value-b2b-standalone/route.ts` | Imports chunks + `B2B_SCORING_PROMPT_INSTRUCTIONS` |
| Chunk options | `src/lib/framework/build-chunk-options.ts` | B2B scoring instructions for shared builder |
| Flask | `backend/src/util/b2b_taxonomy.py` | Mirror taxonomy + `enrich_b2b_categories()` |
| Flask engine | `backend/src/util/evaluation_engine.py` | Applies enrich after element scoring |
| Catalog | `backend/scripts/build_framework_catalog.py` | Rebuild from TS SSOT |

---

## Frontend — needs update (display)

Standalone B2B/B2C framework pages now use **`ElementsValueResultsPanel`** (`src/components/analysis/ElementsValueResultsPanel.tsx`) with strength-first layout (top strengths → ranked categories → recommendations). Helpers: `src/lib/framework/elements-value-display.ts`.

These components **still need** the nested pyramid contract:

| File | Current behavior | Required change |
|------|------------------|-----------------|
| `src/components/analysis/B2BElementsPage.tsx` | **Done** — uses `ElementsValueResultsPanel` | — |
| `src/components/analysis/B2CElementsPage.tsx` | **Done** — uses `ElementsValueResultsPanel` | — |
| `src/components/analysis/AssessmentResultsView.tsx` | `b2b-elements` overview uses `table_stakes_score`, `%` fields; details = "coming soon" | Read `analysis.categories`; nested subcategories; 0.0–1.0 scale |
| `src/components/analysis/ContentComparisonEnhancedPage.tsx` | B2B tab — generic results | Same hierarchy as B2BElementsPage |
| `src/components/analysis/WebsiteAnalysisResults.tsx` | B2B tab — legacy shape | Parse new `categories` contract |
| `src/components/shared/ReportsViewer.tsx` | B2B tab | Support nested subcategories in saved reports |
| `src/components/ReportViewer.tsx` | `elementsOfValueB2B` | Type + render nested shape |
| `generateB2BMarkdown()` in `B2BElementsPage.tsx` | **Done** — `generateElementsValueMarkdown()` | — |

### Recommended UI hierarchy

```
Overall 0.62
├── Table Stakes 0.55
│   ├── Meeting specifications 0.70
│   └── …
├── Individual Value 0.48
│   ├── Career 0.52
│   │   ├── Network expansion 0.60
│   │   └── …
│   └── Personal 0.44
│       └── …
└── …
```

### Shared component (implemented)

`ElementsValueResultsPanel` + `elements-value-display.ts`:

- Uses `B2B_ELEMENT_DISPLAY_NAMES` / `B2C_ELEMENT_DISPLAY_NAMES` for labels
- Handles B2B Table Stakes flat vs nested `subcategories`
- Strength-first: `topStrengths` first; categories/elements ranked by score; no dedicated `criticalGaps` panel
- Formats scores as 0.0–1.0 with percentage display helpers
- Taxonomy helpers `getB2BCategoryDiagnosticGuide()` / `resolveB2BDrillDownTarget()` exist for **optional** analyst drill-down — **not** the primary standalone UI path

---

## Prompts — impacted files

| File | Status | Notes |
|------|--------|-------|
| `src/lib/framework/b2b-taxonomy.ts` | ✅ Updated | `B2B_SCORING_PROMPT_INSTRUCTIONS` — score elements only |
| `src/app/api/analyze/elements-value-b2b-standalone/route.ts` | ✅ Injects instructions | |
| `src/lib/framework/build-chunk-options.ts` | ✅ B2B branch added | |
| `docs/frameworks/B2B-Elements-Value-Flat-Scoring.md` | ✅ Injected into AI blocks | Three-level rollup documented |
| `src/lib/prompts/gemini-prompts.ts` | ⚠️ Legacy | Still lists old inspirational slugs (`purpose` as element) — **not** production chunked path |
| `src/lib/framework-fallback-generator.ts` | ⚠️ Legacy | Fallback markdown may list wrong element counts |
| `src/lib/services/elements-value-b2b.service.ts` | ⚠️ Legacy enhanced path | 0–100 schema; separate from chunked production |
| `src/lib/ai-engines/assessment-rules/elements-value-b2b-rules.json` | ⚠️ Legacy | Enhanced/individual routes only |

**Production chunked path** uses flat-scoring markdown + `B2B_SCORING_PROMPT_INSTRUCTIONS`. Legacy paths should be aligned or explicitly marked deprecated.

---

## Definitions — impacted files

| File | Role |
|------|------|
| `src/lib/elements/element-definitions.ts` | `B2B_ELEMENTS` — keywords per Bain subcategory |
| `src/lib/framework/element-keyword-hints.ts` | Reads subcategories from definitions for prompt hints |
| `src/lib/framework/element-extraction.ts` | Flattens definition tree for completeness tests |
| `src/lib/framework/element-completeness.ts` | Validates 40 elements vs `B2B_CHUNK_CONFIG` |
| `docs/archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md` | Definitions/synonyms only — **do not** use for structure |
| `backend/src/lib/demo_data/framework_catalog.json` | Rebuild via `build_framework_catalog.py` after TS changes |

---

## Backend (Flask) — parity

| Item | Status |
|------|--------|
| `POST /api/evaluate` with `frameworkKey: "b2b-elements"` | ✅ Returns nested `subcategories` |
| `backend/API_DOCUMENTATION.md` | ⚠️ Should document nested category example (see note below) |
| `backend/postman/content-evaluation-api.postman_collection.json` | ⚠️ Verify example response includes subcategories |
| Prisma `ce_*` tables | ✅ 40 elements seeded from catalog |
| Next.js Prisma structured storage | ⚠️ See persistence gap |

---

## Persistence gap (FE + BE)

`src/lib/services/structured-storage.service.ts`:

- `extractCategories()` — passes through `results.categories` ✅
- `extractElements()` — reads **only** `categoryInfo.elements` at tier level ❌
- `extractElementCounts()` — same top-level assumption ❌

**Impact:** When saving chunked B2B results to Prisma, tiers with `subcategories` will show **0 elements** at category level unless storage is updated to:

1. Flatten subcategory elements into `frameworkElement` rows with a `subcategoryKey` column, **or**
2. Add a `frameworkSubcategory` model between category and element

**Until fixed:** persisted reports may not match live API JSON for Individual, Functional (sub view), Ease, Inspirational.

---

## TypeScript types (recommended FE follow-up)

Add to `src/types/` or colocate with taxonomy:

```typescript
interface B2BElementResult {
  score: number;
  evidence: string;
  recommendation: string;
}

interface B2BSubcategoryResult {
  subcategoryName: string;
  subcategoryScore: number;
  elementCount: number;
  elements: Record<string, B2BElementResult>;
}

interface B2BCategoryResult {
  categoryName: string;
  categoryScore: number;
  elementCount: number;
  elements?: Record<string, B2BElementResult>;
  subcategories?: Record<string, B2BSubcategoryResult>;
}
```

Import shapes from `b2b-taxonomy.ts` interfaces where possible.

---

## Verification checklist (before shipping FE work)

```bash
# Structure + rollups
npm run test -- src/test/framework/b2b-taxonomy.test.ts src/test/framework/element-completeness.test.ts

# Manual: run B2B standalone analysis and confirm JSON has:
# - individual.subcategories.career.subcategoryScore
# - table_stakes.elements (no subcategories)
# - exactly 40 elements across all tiers
# - no slug "purpose" or "access" as elements

# Backend catalog in sync
cd backend && pipenv run python scripts/build_framework_catalog.py
```

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [`B2B-BAIN-PYRAMID-TAXONOMY.md`](./B2B-BAIN-PYRAMID-TAXONOMY.md) | Structure, value-first principle, drift register |
| [`B2B-Elements-Value-Flat-Scoring.md`](./B2B-Elements-Value-Flat-Scoring.md) | Scoring bands + rollup formulas |
| [`B2B_ELEMENTS_ASSESSMENT_GUIDE.md`](../guides/B2B_ELEMENTS_ASSESSMENT_GUIDE.md) | Full pipeline, API §10 |
| [`backend/API_DOCUMENTATION.md`](../../backend/API_DOCUMENTATION.md) | Flask evaluate contract |

---

## Phase 5 reminder (Option C)

Frontend wiring to Flask `:5001` was out of scope for backend build. When connecting:

- Use the **same** `categories` nested shape from Flask `format_evaluation_result`
- Reuse `b2b-taxonomy.ts` rollup types for display — do not duplicate parsing logic
- Reuse `ElementsValueResultsPanel` / `elements-value-display.ts` for Flask-sourced reports when Option C FE wiring ships
