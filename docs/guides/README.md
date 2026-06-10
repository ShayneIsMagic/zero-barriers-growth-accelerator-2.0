# Assessment Guides — Index

Thorough implementation guides for each framework assessment in Zero Barriers Growth Accelerator. Each guide links **official sources**, **archived reference docs**, **runtime code**, and **per-element/theme catalogs**.

---

## Available guides

| Assessment | Guide | Elements | Keyword hint source |
|------------|-------|----------|---------------------|
| B2C Elements of Value | [B2C_ELEMENTS_ASSESSMENT_GUIDE.md](./B2C_ELEMENTS_ASSESSMENT_GUIDE.md) | 30 / 4 tiers | `B2C_ELEMENTS` |
| B2B Elements of Value | [B2B_ELEMENTS_ASSESSMENT_GUIDE.md](./B2B_ELEMENTS_ASSESSMENT_GUIDE.md) | 40 / 5 tiers | `B2B_ELEMENTS` |
| CliftonStrengths | [CLIFTONSTRENGTHS_ASSESSMENT_GUIDE.md](./CLIFTONSTRENGTHS_ASSESSMENT_GUIDE.md) | 34 / 4 domains | `CLIFTON_STRENGTHS_ELEMENTS` |
| Golden Circle | [GOLDEN_CIRCLE_ASSESSMENT_GUIDE.md](./GOLDEN_CIRCLE_ASSESSMENT_GUIDE.md) | 24 dimensions / 4 circles | `supplementary-element-hints.ts` (`why:clarity`, etc.) |
| Brand Archetypes | [BRAND_ARCHETYPES_ASSESSMENT_GUIDE.md](./BRAND_ARCHETYPES_ASSESSMENT_GUIDE.md) | 12 archetypes | `jambojon-archetypes-framework.json` |
| Revenue Trends | — | 16 elements / 4 categories | `supplementary-element-hints.ts` |

---

## Scoring authority

**All production assessments use flat fractional scoring (0.0–1.0) only.**

| Framework | Scoring authority (tiers, bands, calculations) |
|-----------|--------------------------------------------------|
| B2C | [`B2C-Elements-Value-Flat-Scoring.md`](../frameworks/B2C-Elements-Value-Flat-Scoring.md) |
| B2B | [`B2B-Elements-Value-Flat-Scoring.md`](../frameworks/B2B-Elements-Value-Flat-Scoring.md) |
| CliftonStrengths | [`CliftonStrengths-Flat-Scoring.md`](../frameworks/CliftonStrengths-Flat-Scoring.md) |
| Golden Circle | [`Golden-Circle-Flat-Scoring.md`](../frameworks/Golden-Circle-Flat-Scoring.md) |
| Brand Archetypes | [`Brand-Archetypes-Flat-Scoring.md`](../frameworks/Brand-Archetypes-Flat-Scoring.md) |

Archived `*_COMPLETE.md` files provide **definitions and examples only**. Their 1–10 scoring tables are **not** used by the runtime chunked assessment. The flat-scoring docs are injected into AI prompts.

### Why flat scoring (not the complete reference scales)

| | Flat-scoring `*.md` | Archived `*_COMPLETE.md` |
|---|---------------------|--------------------------|
| Evidence type | **Brand signals** — what the site says, promises, implies | **Behavioral observation** (Clifton) or deep Bain definitions |
| Scale | 0.0–1.0 fractional — honest for sparse website evidence | 1–10 integers — pushes toward round bands |
| Overall formula | Sum of all elements ÷ N — every element equal | Often average of tier/domain scores — distorts weight |
| In AI prompts | ✅ Scoring authority | ❌ Synonyms/cues only (never scoring tables) |

**Layering:** flat-scoring md + Puppeteer evidence protocol + keyword hints from `element-definitions.ts` (via `element-keyword-hints.ts`) in every block prompt; synonyms from complete docs remain supplementary **recognition** references for humans, not alternate scoring.

See [CLIFTONSTRENGTHS_ASSESSMENT_GUIDE.md § Why flat scoring](./CLIFTONSTRENGTHS_ASSESSMENT_GUIDE.md#why-flat-scoring-for-website-analysis-design-rationale) for the full rationale.

---

## How each guide is structured

Every guide includes:

1. **What the assessment does** — scope, inputs, outputs
2. **Official & internal references** — numbered bibliography with URLs
3. **Full element/theme catalog** — slugs, tiers/domains, line refs into archived docs
4. **Scoring methodology** — flat 0.0–1.0 rules with source file
5. **Pipeline & prompts** — API route, chunk config, prompt ingredients, AI call labels
6. **API contract & response JSON** — field-by-field
7. **Integrity checks** — completeness tests and runtime verification
8. **Code reference index** — every implementation file
9. **Troubleshooting & testing**

---

## Archived reference docs (deep definitions)

| Framework | Archived doc | Lines | Use for |
|-----------|--------------|-------|---------|
| B2C Elements | [`../archived/B2C_ELEMENTS_OF_VALUE_COMPLETE.md`](../archived/B2C_ELEMENTS_OF_VALUE_COMPLETE.md) | ~1,048 | Bain definitions, industry rankings, official examples |
| B2B Elements | [`../archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md`](../archived/B2B_ELEMENTS_OF_VALUE_COMPLETE.md) | ~1,156 | Bain definitions, official examples, scoring cues |
| CliftonStrengths | [`../archived/CLIFTONSTRENGTHS_COMPLETE.md`](../archived/CLIFTONSTRENGTHS_COMPLETE.md) | ~1,077 | Theme definitions, synonyms, website evidence cues |
| Golden Circle | [`../archived/GOLDEN_CIRCLE_COMPLETE.md`](../archived/GOLDEN_CIRCLE_COMPLETE.md) | ~603 | Sinek definitions, WHO enhancement, website evidence cues |
| Brand Archetypes | [`../JAMBOJON_ARCHETYPES_ENHANCED.md`](../JAMBOJON_ARCHETYPES_ENHANCED.md) | ~748 | Archetype definitions, synonyms, visual/tone cues |
| All frameworks | [`../archived/COMPLETE_FRAMEWORK_INDEX.md`](../archived/COMPLETE_FRAMEWORK_INDEX.md) | 375 | Master index of all framework documentation |

---

## Runtime scoring specs (injected into AI prompts)

| Framework | Flat scoring doc |
|-----------|------------------|
| B2C Elements | [`../frameworks/B2C-Elements-Value-Flat-Scoring.md`](../frameworks/B2C-Elements-Value-Flat-Scoring.md) |
| B2B Elements | [`../frameworks/B2B-Elements-Value-Flat-Scoring.md`](../frameworks/B2B-Elements-Value-Flat-Scoring.md) |
| CliftonStrengths | [`../frameworks/CliftonStrengths-Flat-Scoring.md`](../frameworks/CliftonStrengths-Flat-Scoring.md) |
| Golden Circle | [`../frameworks/Golden-Circle-Flat-Scoring.md`](../frameworks/Golden-Circle-Flat-Scoring.md) |
| Brand Archetypes | [`../frameworks/Brand-Archetypes-Flat-Scoring.md`](../frameworks/Brand-Archetypes-Flat-Scoring.md) |

---

## Canonical chunk configs (completeness tests)

| Framework key | Config constant | File |
|---------------|-----------------|------|
| `b2c-elements` | `B2C_CHUNK_CONFIG` | `src/lib/framework/chunk-definitions.ts` |
| `b2b-elements` | `B2B_CHUNK_CONFIG` | `src/lib/framework/chunk-definitions.ts` |
| `clifton` | `CLIFTON_CHUNK_CONFIG` | `src/lib/framework/chunk-definitions.ts` |
| `golden-circle` | `GOLDEN_CIRCLE_CHUNK_CONFIG` | `src/lib/framework/chunk-definitions.ts` |
| `brand-archetypes` | `BRAND_ARCHETYPES_CHUNK_CONFIG` | `src/lib/framework/chunk-definitions.ts` |

Validated by `src/test/framework/element-completeness.test.ts`.

Keyword hints for prompts: `src/lib/framework/element-keyword-hints.ts` — sources:

- B2C / B2B / Clifton → `element-definitions.ts`
- Golden Circle / Revenue Trends → `supplementary-element-hints.ts`
- Brand Archetypes → `jambojon-archetypes-framework.json` (`keyword_signals`)

Tested by `src/test/framework/element-keyword-hints.test.ts`.
