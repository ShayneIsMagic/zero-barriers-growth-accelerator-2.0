# B2B Bain Pyramid Taxonomy — Canonical Reference

**Status:** LOCKED — do not re-derive from archived docs or memory.  
**Last verified:** June 2026 against [Bain interactive pyramid](https://media.bain.com/b2b-eov/) and HBR March–April 2018 exhibit.  
**Element count:** **40** (4 + 5 + 21 + 7 + 3). Not 41. Not 42.

---

## Read this first

This document is the **structural authority** for the B2B Elements of Value pyramid: which elements exist, which tier they belong to, which subcategory groups them, and how scores roll up.

| Question | Answer |
|----------|--------|
| How do we score? | [`B2B-Elements-Value-Flat-Scoring.md`](./B2B-Elements-Value-Flat-Scoring.md) — flat 0.0–1.0, equal weight |
| What is the pyramid shape? | **This file** — Bain categories, subcategories, slugs |
| Where are definitions/synonyms? | [`B2B_ELEMENTS_OF_VALUE_COMPLETE.md`](../archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md) — **definitions only**, not structure |
| Where is the code SSOT? | See [Code single source of truth](#code-single-source-of-truth) below |
| FE / BE / UI impact? | [`B2B-FE-BE-IMPACT-NOTE.md`](./B2B-FE-BE-IMPACT-NOTE.md) — display, prompts, persistence gaps |
| B2C (flat, no subcategories)? | [`B2C-CATEGORY-TAXONOMY.md`](./B2C-CATEGORY-TAXONOMY.md) — same value-first logic, one level shorter |
| API / enrich / UI read order? | [`docs/guides/README.md`](../guides/README.md#documentation-authority-prevent-conflicts) + root `API_DOCUMENTATION.md` |

**If any file disagrees with this taxonomy, this file wins for structure. The flat-scoring doc wins for bands and formulas. Archived docs and `ACCURATE-PROMPTS.md` do not override either.**

---

## Value-first principle

**Categories and subcategories are defined by the values they contain — not the other way around.**

| Level | What it is | How it is defined |
|-------|------------|-------------------|
| **Element** | A single B2B value type (e.g. Marketability) | Scored 0.0–1.0 from website evidence |
| **Subcategory** | A named cluster of related values (e.g. Career) | **Exactly** the list of elements under it — nothing more |
| **Category (tier)** | A Bain pyramid level (e.g. Individual Value) | **Exactly** the union of its subcategories’ elements (or flat elements for Table Stakes) |

Implications:

1. **Career** means Network expansion + Marketability + Reputational assurance — the label is shorthand for those three values.
2. **Individual Value** means all Career values plus all Personal values — the tier score represents that combined value set (via subcategory rollups).
3. You never invent a category or subcategory without assigning concrete elements. If an element moves, the group’s definition moves with it.
4. **Purpose** is not a value element — it is the subcategory that holds Vision, Hope, and Social responsibility.

Code helpers: `getElementsForSubcategory()`, `getElementsForCategory()`, `getAllB2BElementSlugs()` in `src/lib/framework/b2b-taxonomy.ts`.

---

## The monumental discoveries (June 2026)

These mistakes cost multiple realignment passes. **Do not repeat them.**

### 1. Purpose is a subcategory, not an element

Bain’s inspirational tier has subcategory **Purpose** containing three **elements**: Vision, Hope, Social responsibility.

- ❌ `purpose` as a scored element slug → **41 elements**
- ✅ `purpose` as `subcategoryKey` under `inspirational` → **40 elements**

### 2. Flexibility and Component quality live under Ease → Strategic

The Bain interactive pyramid and HBR exhibit place **Flexibility** and **Component quality** under **Ease of Doing Business → Strategic**, alongside Risk reduction and Reach.

- ❌ Under Functional → Performance (old flat-scoring drift)
- ✅ Under `ease_of_business` → `strategic`

### 3. There is no `access` element

Bain has subcategory **Access** with three elements: Availability, Variety, Configurability. There is no standalone “Access” scored element.

- ❌ Slug `access` as a 41st pseudo-element
- ✅ Subcategory key `access` with elements `availability`, `variety`, `configurability`

### 4. Table Stakes has no subcategories

Every other tier has subcategories with rolled-up `subcategoryScore`. Table Stakes is flat: `categoryScore` = average of its 4 elements directly.

### 5. Information and Transparency are under Productivity

Not a separate “Information” subcategory in Bain. Both elements roll up under **Productivity**.

### 6. Never duplicate the chunk list inline

`buildB2BOptions()` must import `B2B_CHUNK_CONFIG`. Inline copies caused 42-element drift (`purpose` + duplicate inspirational slugs).

---

## Official Bain sources

| Ref | Resource | URL |
|-----|----------|-----|
| Bain-1 | Interactive pyramid (primary visual SSOT) | https://media.bain.com/b2b-eov/ |
| Bain-2 | HBR article (March–April 2018) | https://hbr.org/2018/03/the-b2b-elements-of-value |
| Bain-3 | Bain research hub | https://www.bain.com/insights/b2b-elements-of-value/ |

---

## Full pyramid (main → sub → elements)

Slugs are **snake_case** in JSON/API. Display names match Bain labels.

### Tier 1: Table Stakes — 4 elements, **no subcategories**

| Slug | Bain display name |
|------|-------------------|
| `meeting_specifications` | Meeting specifications |
| `acceptable_price` | Acceptable price |
| `regulatory_compliance` | Regulatory compliance |
| `ethical_standards` | Ethical standards |

---

### Tier 2: Functional Value — 5 elements

#### Subcategory: Economic (2)

| Slug | Bain display name |
|------|-------------------|
| `improved_top_line` | Improved top line |
| `cost_reduction` | Cost reduction |

#### Subcategory: Performance (3)

| Slug | Bain display name |
|------|-------------------|
| `product_quality` | Product quality |
| `scalability` | Scalability |
| `innovation` | Innovation |

---

### Tier 3: Ease of Doing Business — 21 elements

#### Subcategory: Productivity (5)

| Slug | Bain display name |
|------|-------------------|
| `time_savings` | Time savings |
| `reduced_effort` | Reduced effort |
| `decreased_hassles` | Decreased hassles |
| `information` | Information |
| `transparency` | Transparency |

#### Subcategory: Operational (4)

| Slug | Bain display name |
|------|-------------------|
| `organization` | Organization |
| `simplification` | Simplification |
| `connection` | Connection |
| `integration` | Integration |

#### Subcategory: Access (3)

| Slug | Bain display name |
|------|-------------------|
| `availability` | Availability |
| `variety` | Variety |
| `configurability` | Configurability |

#### Subcategory: Relationship (5)

| Slug | Bain display name |
|------|-------------------|
| `responsiveness` | Responsiveness |
| `expertise` | Expertise |
| `commitment` | Commitment |
| `stability` | Stability |
| `cultural_fit` | Cultural fit |

#### Subcategory: Strategic (4)

| Slug | Bain display name |
|------|-------------------|
| `risk_reduction` | Risk reduction |
| `reach` | Reach |
| `flexibility` | Flexibility |
| `component_quality` | Component quality |

---

### Tier 4: Individual Value — 7 elements

#### Subcategory: Career (3)

| Slug | Bain display name |
|------|-------------------|
| `network_expansion` | Network expansion |
| `marketability` | Marketability |
| `reputational_assurance` | Reputational assurance |

#### Subcategory: Personal (4)

| Slug | Bain display name |
|------|-------------------|
| `design_aesthetics_b2b` | Design & aesthetics |
| `growth_development` | Growth & development |
| `reduced_anxiety_b2b` | Reduced anxiety |
| `fun_perks` | Fun & perks |

---

### Tier 5: Inspirational Value — 3 elements

#### Subcategory: Purpose (3)

| Slug | Bain display name |
|------|-------------------|
| `vision` | Vision |
| `hope_b2b` | Hope |
| `social_responsibility` | Social responsibility |

---

## Element count proof

```
Table Stakes:     4
Functional:       5  (2 Economic + 3 Performance)
Ease of Business: 21 (5 + 4 + 3 + 5 + 4)
Individual:       7  (3 Career + 4 Personal)
Inspirational:    3  (Purpose subcategory)
────────────────────
TOTAL:           40
```

---

## Scoring rollup rules

All scores are flat 0.0–1.0. **AI and Flask score elements only**; subcategories and tiers are computed by `rollupB2BCategoryBreakdown()` (Next.js) and `enrich_b2b_categories()` (Flask).

| Level | JSON field | Who computes it | Formula |
|-------|------------|-----------------|---------|
| Element | `elements.*.score` | AI or deterministic matcher | 0.0–1.0 from evidence |
| Subcategory | `subcategories.*.subcategoryScore` | Runtime rollup | ÷ element count in subcategory |
| Category (tier) | `categoryScore` | Runtime rollup | Table Stakes: ÷ 4 elements; else ÷ subcategory count |
| Overall | `overallScore` | Runtime merge | ÷ **40** (all elements — not ÷ 5 tiers) |

```
element score (evidence-based)
    ↓ simple average per Bain subcategory
subcategoryScore
    ↓ simple average of subcategory scores (Table Stakes skips this layer)
categoryScore
    ↓ simple average of all 40 element scores
overallScore
```

### Equal-weight rules

- **Within a subcategory:** every element counts equally
- **Within a tier (except Table Stakes):** every **subcategory** counts equally (Career and Personal each contribute 50% to Individual, even though Personal has 4 elements and Career has 3)
- **Overall:** every **element** counts equally across the full pyramid

### Worked example — Individual tier

```
Career elements:     0.60, 0.50, 0.45  →  subcategoryScore = 0.517
Personal elements:   0.40, 0.50, 0.35, 0.50  →  subcategoryScore = 0.438
Individual categoryScore = (0.517 + 0.438) ÷ 2 = 0.478
```

Do **not** compute Individual as (sum of 7 elements) ÷ 7 = 0.486 — that ignores the Bain subcategory structure.

### Table Stakes (flat tier)

```json
"table_stakes": {
  "categoryName": "Table Stakes",
  "categoryScore": 0.55,
  "elementCount": 4,
  "elements": {
    "meeting_specifications": { "score": 0.7, "evidence": "...", "recommendation": "..." }
  }
}
```

### Tiers with subcategories (example: Individual)

```json
"individual": {
  "categoryName": "Individual Value",
  "categoryScore": 0.48,
  "elementCount": 7,
  "subcategories": {
    "career": {
      "subcategoryName": "Career",
      "subcategoryScore": 0.52,
      "elementCount": 3,
      "elements": {
        "network_expansion": { "score": 0.6, "evidence": "...", "recommendation": "..." },
        "marketability": { "score": 0.5, "evidence": "...", "recommendation": "..." },
        "reputational_assurance": { "score": 0.45, "evidence": "...", "recommendation": "..." }
      }
    },
    "personal": {
      "subcategoryName": "Personal",
      "subcategoryScore": 0.44,
      "elementCount": 4,
      "elements": {
        "design_aesthetics_b2b": { "score": 0.4, "evidence": "...", "recommendation": "..." },
        "growth_development": { "score": 0.5, "evidence": "...", "recommendation": "..." },
        "reduced_anxiety_b2b": { "score": 0.35, "evidence": "...", "recommendation": "..." },
        "fun_perks": { "score": 0.5, "evidence": "...", "recommendation": "..." }
      }
    }
  }
}
```

### Diagnostic drill-down (all tiers)

**Universal rule:** A weak score at any level is diagnosed by evaluating the **values that define the level below**. Categories and subcategories are labels for element groups — remediation always targets **elements**.

| Step | Action |
|------|--------|
| 1 | Weak **overall** → find weakest **tier** (`categoryScore`) |
| 2 | Weak **tier** → find weakest **subcategory** (`subcategoryScore`), or elements if Table Stakes |
| 3 | Weak **subcategory** → find weakest **elements** in that group |
| 4 | Fix copy/evidence for the specific element slugs — not the group label alone |

**Single-subcategory tiers:** When a tier has only one subcategory, `categoryScore` **equals** `subcategoryScore`. The subcategory’s elements **are** the entire tier (Inspirational → Purpose).

Code: `getB2BCategoryDiagnosticGuide()`, `resolveB2BDrillDownTarget()` in `b2b-taxonomy.ts`.

#### Tier 1: Table Stakes (flat — no subcategory layer)

Weak **Table Stakes** → evaluate all four defining values directly:

`meeting_specifications` · `acceptable_price` · `regulatory_compliance` · `ethical_standards`

#### Tier 2: Functional Value (2 subcategories)

Weak **Functional** → weakest of **Economic** vs **Performance** → then:

| Subcategory | Elements to evaluate |
|-------------|---------------------|
| **Economic** | `improved_top_line`, `cost_reduction` |
| **Performance** | `product_quality`, `scalability`, `innovation` |

#### Tier 3: Ease of Doing Business (5 subcategories)

Weak **Ease of Doing Business** → weakest of five value groups → then:

| Subcategory | Elements to evaluate |
|-------------|---------------------|
| **Productivity** | `time_savings`, `reduced_effort`, `decreased_hassles`, `information`, `transparency` |
| **Operational** | `organization`, `simplification`, `connection`, `integration` |
| **Access** | `availability`, `variety`, `configurability` |
| **Relationship** | `responsiveness`, `expertise`, `commitment`, `stability`, `cultural_fit` |
| **Strategic** | `risk_reduction`, `reach`, `flexibility`, `component_quality` |

#### Tier 4: Individual Value (2 subcategories)

Weak **Individual** → weakest of **Career** vs **Personal** → then:

| Subcategory | Elements to evaluate |
|-------------|---------------------|
| **Career** | `network_expansion`, `marketability`, `reputational_assurance` |
| **Personal** | `design_aesthetics_b2b`, `growth_development`, `reduced_anxiety_b2b`, `fun_perks` |

#### Tier 5: Inspirational Value (1 subcategory = entire tier)

Weak **Inspirational** → **Purpose** (same score as tier) → evaluate:

`vision` · `hope_b2b` · `social_responsibility`

There is no second subcategory to compare. Purpose **is** Inspirational for scoring and diagnosis.

**Example:** Inspirational `categoryScore` 0.42 → Purpose `subcategoryScore` 0.42 → `hope_b2b` 0.30 is the gap → strengthen hope/optimism copy, not a generic “purpose” message.

---

## Code single source of truth

**Change taxonomy in this order. Never edit downstream files alone.**

| Priority | File | Role |
|----------|------|------|
| 1 | `src/lib/framework/b2b-taxonomy.ts` | **Pyramid SSOT** — categories, subcategories, slugs, display names, rollup logic |
| 2 | `src/lib/framework/chunk-definitions.ts` | `B2B_CHUNK_CONFIG` — AI chunk element lists (must sum to 40) |
| 3 | `src/lib/elements/element-definitions.ts` | `B2B_ELEMENTS` — keywords/descriptions per subcategory |
| 4 | `backend/src/util/b2b_taxonomy.py` | Flask mirror of TS taxonomy + `enrich_b2b_categories()` |
| 5 | `docs/frameworks/B2B-Elements-Value-Flat-Scoring.md` | Scoring bands + tier element lists (keep in sync) |
| 6 | **This file** | Human-readable canonical reference |

### After TS changes, rebuild backend catalog

```bash
cd backend && pipenv run python scripts/build_framework_catalog.py
cd backend && pipenv run python app.py demo-data   # re-seed if DB is in use
```

### API routes must import chunks — never inline

```typescript
import { B2B_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';
// chunks: B2B_CHUNK_CONFIG.chunks
```

Files that consume taxonomy (do not duplicate lists):

- `src/lib/chunked-framework-analysis.ts` — `rollupB2BCategoryBreakdown()` on merge
- `src/app/api/analyze/elements-value-b2b-standalone/route.ts` — `buildB2BOptions()`
- `backend/src/util/evaluation_engine.py` — `enrich_b2b_categories()` after scoring

---

## Validation checklist

Run before any B2B taxonomy PR merges:

```bash
npm run test -- src/test/framework/element-completeness.test.ts src/test/framework/b2b-taxonomy.test.ts
```

Tests assert:

- Exactly **40** elements in `B2B_CHUNK_CONFIG`
- Chunk slugs match `B2B_ELEMENTS` definitions
- No duplicate slugs across chunks
- Individual Career/Personal match Bain
- Flexibility + component_quality under Ease → Strategic
- Table Stakes has no subcategories in rollup output

---

## Historical drift register (resolved)

| Bug | Symptom | Resolution |
|-----|---------|------------|
| `purpose` as element slug | 41–42 elements in API | Purpose is subcategory only |
| Inline `buildB2BOptions()` chunks | Route diverged from `B2B_CHUNK_CONFIG` | Import `B2B_CHUNK_CONFIG` |
| `access` element slug | Extra non-Bain element | Removed; Access is subcategory only |
| Flexibility/Component quality in Functional | Wrong Bain tier | Moved to Ease → Strategic |
| Risk reduction/Reach in Functional | Wrong Bain tier | Under Ease → Strategic |
| Inspirational missing `social_responsibility` | 2 elements instead of 3 | Added under Purpose |
| Archived doc “Tier 5 (4 Elements)” | Confusion about Purpose | Archived doc is definitions-only; ignore its element counts |

---

## Related documentation

| Document | Role |
|----------|------|
| [`B2B-Elements-Value-Flat-Scoring.md`](./B2B-Elements-Value-Flat-Scoring.md) | Scoring scale, formulas, AI prompt injection |
| [`B2B_ELEMENTS_ASSESSMENT_GUIDE.md`](../guides/B2B_ELEMENTS_ASSESSMENT_GUIDE.md) | Full implementation guide, API, pipeline |
| [`B2B_ELEMENTS_OF_VALUE_COMPLETE.md`](../archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md) | Bain definitions, examples, synonyms — **not** structure authority |

---

## Quick reference diagram

```
INSPIRATIONAL VALUE
  └── Purpose ────────── vision, hope_b2b, social_responsibility

INDIVIDUAL VALUE
  ├── Career ─────────── network_expansion, marketability, reputational_assurance
  └── Personal ───────── design_aesthetics_b2b, growth_development, reduced_anxiety_b2b, fun_perks

EASE OF DOING BUSINESS
  ├── Productivity ───── time_savings, reduced_effort, decreased_hassles, information, transparency
  ├── Operational ────── organization, simplification, connection, integration
  ├── Access ─────────── availability, variety, configurability
  ├── Relationship ───── responsiveness, expertise, commitment, stability, cultural_fit
  └── Strategic ──────── risk_reduction, reach, flexibility, component_quality

FUNCTIONAL VALUE
  ├── Economic ───────── improved_top_line, cost_reduction
  └── Performance ────── product_quality, scalability, innovation

TABLE STAKES (flat — no subcategories)
  meeting_specifications, acceptable_price, regulatory_compliance, ethical_standards
```

**You never have to figure this out again. Change `b2b-taxonomy.ts` first, run the tests, rebuild the catalog.**

---

## Strength-first diagnostics (standalone UI — implemented)

Standalone B2B/B2C pages use **`ElementsValueResultsPanel`** — lead with `topStrengths`, then categories/elements ranked by score. Low scores surface in hierarchy and recommendations without a separate gap-hunt UX.

| Principle | Detail |
|-----------|--------|
| **Lead with strengths** | `topStrengths` + highest-scoring tiers/categories first |
| **Low score = enough evidence** | Scores below threshold already signal gaps |
| **Implemented** | `B2BElementsPage`, `B2CElementsPage`, `elements-value-display.ts`, markdown export |
| **Still pending** | `AssessmentResultsView`, `ReportsViewer`, Prisma nested B2B persistence — see `B2B-FE-BE-IMPACT-NOTE.md` |
