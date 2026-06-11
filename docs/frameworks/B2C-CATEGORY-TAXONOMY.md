# B2C Category Taxonomy — Canonical Reference

**Status:** LOCKED — flat categories only, **no subcategories**.  
**Element count:** **30** (14 + 10 + 5 + 1).  
**Code SSOT:** `src/lib/framework/b2c-taxonomy.ts` (derived from `B2C_CHUNK_CONFIG`).

---

## Read this first

| Question | Answer |
|----------|--------|
| How do we score? | [`B2C-Elements-Value-Flat-Scoring.md`](./B2C-Elements-Value-Flat-Scoring.md) |
| What is the structure? | **This file** — 4 categories, 30 elements, no subcategories |
| B2B comparison | B2B has subcategories; B2C is flat like B2B Table Stakes at every tier |
| Standalone UI | `B2CElementsPage` + `ElementsValueResultsPanel` — see `B2B-FE-BE-IMPACT-NOTE.md` |
| Doc authority | [`docs/guides/README.md`](../guides/README.md#documentation-authority-prevent-conflicts) |

---

## Value-first principle

**Categories are defined by the value elements they contain.** There is no subcategory layer.

| Level | What it is | Formula |
|-------|------------|---------|
| **Element** | One B2C value type | Scored 0.0–1.0 from evidence |
| **Category** | Named group of elements (Functional, Emotional, etc.) | `categoryScore` = average of its element scores |
| **Overall** | Full framework | `overallScore` = average of all **30** element scores |

```
element score → categoryScore (avg elements in category) → overallScore (avg all 30)
```

---

## Categories and elements

### Functional (14)

`saves_time` · `simplifies` · `makes_money` · `reduces_effort` · `reduces_cost` · `reduces_risk` · `organizes` · `integrates` · `connects` · `quality` · `variety` · `informs` · `avoids_hassles` · `sensory_appeal`

### Emotional (10)

`reduces_anxiety` · `rewards_me` · `nostalgia` · `design_aesthetics` · `badge_value` · `wellness` · `therapeutic` · `fun_entertainment` · `attractiveness` · `provides_access`

### Life-Changing (5)

`provides_hope` · `self_actualization` · `motivation` · `heirloom` · `affiliation`

### Social Impact (1)

`self_transcendence`

---

## Diagnostic drill-down (all categories)

**Universal rule:** Weak category → evaluate the **elements that define that category**. No subcategory step.

| Step | Action |
|------|--------|
| 1 | Weak **overall** → find weakest **category** (`categoryScore`) |
| 2 | Weak **category** → find weakest **elements** in that category |
| 3 | Fix copy for specific element slugs |

### Examples

| Weak category | Evaluate |
|---------------|----------|
| **Functional** | 14 functional elements (e.g. weak `saves_time`, `reduces_cost`) |
| **Emotional** | 10 emotional elements (e.g. weak `nostalgia`, `wellness`) |
| **Life-Changing** | 5 elements (e.g. weak `provides_hope`, `motivation`) |
| **Social Impact** | `self_transcendence` only — category score = element score |

**Social Impact note:** With one element, `categoryScore` always equals that element’s score (same pattern as single-subcategory B2B Inspirational → Purpose).

Code: `getB2CCategoryDiagnosticGuide()`, `resolveB2CDrillDownTarget()` in `b2c-taxonomy.ts`.

---

## API response shape

Every category is flat:

```json
"emotional": {
  "categoryName": "Emotional",
  "categoryScore": 0.52,
  "elementCount": 10,
  "elements": {
    "nostalgia": { "score": 0.45, "evidence": "...", "recommendation": "..." }
  }
}
```

No `subcategories` key on B2C responses.

---

## Code single source of truth

| Priority | File |
|----------|------|
| 1 | `src/lib/framework/b2c-taxonomy.ts` |
| 2 | `src/lib/framework/chunk-definitions.ts` → `B2C_CHUNK_CONFIG` |
| 3 | `src/lib/elements/element-definitions.ts` → `B2C_ELEMENTS` (keywords; internal subcategories for hints only — **not** scored) |
| 4 | `backend/src/util/b2c_taxonomy.py` |

`element-definitions.ts` uses subcategories for keyword organization only. **Runtime scoring and API shape use flat categories.**

---

## Verification

```bash
npm run test -- src/test/framework/b2c-taxonomy.test.ts src/test/framework/element-completeness.test.ts
```

---

## Strength-first diagnostics (standalone UI — implemented)

Standalone B2C page uses **`ElementsValueResultsPanel`** — `topStrengths` first, categories ranked by score, recommendations sorted by ascending score. See [`B2B-BAIN-PYRAMID-TAXONOMY.md`](./B2B-BAIN-PYRAMID-TAXONOMY.md#strength-first-diagnostics-standalone-ui--implemented). Comparison/report views still pending in `B2B-FE-BE-IMPACT-NOTE.md`.
