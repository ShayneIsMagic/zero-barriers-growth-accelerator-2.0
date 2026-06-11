# Backend API Documentation — Content Evaluation Engine

Source of truth for the Python Flask evaluation service.  
Base URL (dev): `http://localhost:5001`

The Next.js frontend integrates with this service via HTTP only. Collection remains in Next.js (`POST /api/content/collect`); evaluation is performed here.

**Related docs (do not duplicate scoring rules here):**

| Topic | Authoritative doc |
|-------|-------------------|
| Next.js standalone APIs + enrich fields | [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md) at repo root |
| B2B pyramid structure | [`docs/frameworks/B2B-BAIN-PYRAMID-TAXONOMY.md`](../docs/frameworks/B2B-BAIN-PYRAMID-TAXONOMY.md) |
| B2C categories | [`docs/frameworks/B2C-CATEGORY-TAXONOMY.md`](../docs/frameworks/B2C-CATEGORY-TAXONOMY.md) |
| Assessment pipelines | [`docs/guides/README.md`](../docs/guides/README.md) |

**Parity note (June 2026):** Flask mirrors B2B/B2C category rollups (`enrich_b2b_categories`, `enrich_b2c_categories`) and Brand Archetypes `primary_archetype` / `secondary_archetypes`. **Not yet in Flask:** `top_three_archetypes`, `not_archetypes`, `personality_profile`, Clifton `top_five_strengths`, `domain_rankings` — those are added by Next.js `enrichAnalysisWithArchetypeRanking()` / `enrichAnalysisWithCliftonRanking()` on standalone routes only.

## Testing without AI

The Flask evaluation engine is **fully deterministic** — pattern/synonym matching against the seeded `ce_*` catalog tables. No Gemini, Ollama, or other LLM is called.

| Step | Command / endpoint |
|------|-------------------|
| Seed catalog + patterns | `cd backend && pipenv run python app.py demo-data` |
| Smoke all 6 frameworks | `cd backend && pipenv run python scripts/smoke_evaluate_all.py` |
| HTTP evaluate (single framework) | `POST http://localhost:5001/api/evaluate` — see Postman collection |
| Inspect persisted runs | `GET http://localhost:5001/api/evaluate/{runId}` |

**Golden Circle** is included: 24 composite element keys (`why:clarity`, etc.), corpus sections mapped in `corpus_arranger.py`, catalog in `framework_catalog.json`.

**Next.js standalone pages** (`/api/analyze/*-standalone`) still use **Gemini** for chunked analysis. To test tables and scoring without AI, use Flask `:5001` or the smoke script above — not the dashboard standalone UI.

**Collection (no AI):** `POST /api/content/collect` on Next.js `:3000` scrapes content only; pass the payload to Flask `POST /api/evaluate` as `payload.rawEvidence`.


| Endpoint | Auth |
|----------|------|
| `GET /api/health` | None |
| `POST /api/evaluate` | None (dev) — document Bearer when auth is enabled |
| `GET /api/evaluate/{runId}` | None (dev) |

## Standard response shapes

**Success:**

```json
{
  "success": true,
  "runId": "uuid",
  "frameworkKey": "b2c-elements",
  "overallScore": 0.62,
  "message": "Evaluation completed successfully"
}
```

**Error:**

```json
{
  "success": false,
  "error": "Human-readable message",
  "details": "Optional debug detail"
}
```

---

## GET /api/health

Health check for the evaluation engine and database connectivity.

**Response 200:**

```json
{
  "success": true,
  "status": "healthy",
  "engineVersion": "1.0.0",
  "database": "ok"
}
```

---

## POST /api/evaluate

Run a full deterministic evaluation: persist collection → arrange corpus per framework → match patterns/synonyms → score elements → return FE-compatible payload.

**Request body (Marshmallow-validated):**

```json
{
  "payload": {
    "url": "https://example.com",
    "snapshotId": "snap-example-com-1710000000000",
    "collectedAt": "2025-06-08T12:00:00.000Z",
    "collectorType": "content-collect-api",
    "rawEvidence": {
      "title": "Example",
      "cleanText": "We help teams save time with simple, affordable software.",
      "wordCount": 12,
      "headings": { "h1": ["Save time"], "h2": [], "h3": [] },
      "extractedKeywords": [],
      "url": "https://example.com",
      "seo": {}
    },
    "proposedContent": null
  },
  "frameworkKey": "b2c-elements",
  "comprehensivePayload": null,
  "analysisId": null,
  "persistCollection": true
}
```

### frameworkKey values

| Key | Elements | Notes |
|-----|----------|-------|
| `b2c-elements` | 30 | B2C Elements of Value |
| `b2b-elements` | 40 | B2B Elements of Value |
| `clifton` | 34 | CliftonStrengths — flat `categories` per domain; no `top_five_strengths` / `personality_profile` in Flask yet |
| `golden-circle` | 24 | Composite element keys (`why:clarity`, etc.) |
| `brand-archetypes` | 12 | `primary_archetype`, `secondary_archetypes`, `dominant_cluster` (see below) |
| `revenue-trends` | 16 | Revenue and growth signals |

**Response 200** (Marshmallow-serialized, FE-compatible):

```json
{
  "success": true,
  "runId": "uuid",
  "collectionId": "uuid",
  "corpusId": "uuid",
  "frameworkKey": "b2c-elements",
  "framework": "B2C Elements of Value",
  "url": "https://example.com",
  "overallScore": 0.45,
  "totalElements": 30,
  "categories": {
    "functional": {
      "categoryName": "Functional",
      "categoryScore": 0.52,
      "elementCount": 14,
      "elements": {
        "saves_time": {
          "score": 0.65,
          "evidence": "We help teams save time...",
          "recommendation": "..."
        }
      }
    }
  },
  "topStrengths": [],
  "criticalGaps": [],
  "coreSignals": [
    {
      "signalType": "value_theme",
      "signalText": "Save time",
      "confidence": 0.8,
      "sourceSectionKey": "hero"
    }
  ],
  "analysisMethod": "deterministic-flask",
  "chunksCompleted": 4,
  "chunksTotal": 4,
  "blockCount": 4,
  "verification": {
    "total_elements_in_framework": 30,
    "total_elements_analyzed": 30,
    "completeness_check": "pass",
    "all_elements_accounted_for": true,
    "breakdown": { "present": 5, "partial": 10, "missing": 15, "total": 30 }
  },
  "chunkedReport": "# B2C Elements of Value Chunked Report\n\n...",
  "message": "Evaluation completed successfully"
}
```

**Brand archetypes** responses additionally include (Flask `result_formatter._rank_archetypes`):

```json
{
  "primary_archetype": { "name": "The Hero", "slug": "hero", "score": 0.72, "strength": "Strong", "group": "ego", "evidence": "..." },
  "secondary_archetypes": [],
  "dominant_cluster": [],
  "archetype_ranking": { "overallScore": 0.41, "allRanked": [] }
}
```

When multiple archetypes tie within 0.05 of the top score, `primary_archetype` is an array.

**Next.js standalone only** (not Flask yet): `top_three_archetypes`, `not_archetypes` (score < 0.4), `personality_profile`. See root [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md).

**CliftonStrengths** (Flask): per-theme scores in `categories.{domain}.elements`. **Next.js standalone only:** `top_five_strengths`, `domain_rankings`, `signature_themes`, `dominant_domain`, `personality_profile`.

**B2B elements** (`frameworkKey: "b2b-elements"`) use nested subcategories on all tiers except Table Stakes. Enriched fields include `strengthLabel`, `presentCount`, `weakCount`, `rank` (subcategories), and `weakestSubcategoryKey` / `weakestSubcategoryName` (tiers):

```json
"individual": {
  "categoryName": "Individual Value",
  "categoryScore": 0.478,
  "strengthLabel": "Moderate",
  "elementCount": 7,
  "weakestSubcategoryKey": "personal",
  "weakestSubcategoryName": "Personal",
  "weakestSubcategoryScore": 0.35,
  "subcategories": {
    "career": {
      "subcategoryName": "Career",
      "subcategoryScore": 0.517,
      "strengthLabel": "Moderate",
      "elementCount": 3,
      "presentCount": 1,
      "weakCount": 2,
      "rank": 1,
      "elements": {
        "network_expansion": {
          "score": 0.6,
          "displayName": "Network expansion",
          "strengthLabel": "Strong",
          "evidence": "...",
          "recommendation": "..."
        }
      }
    }
  }
}
```

**B2B pyramid drill-down** (`pyramidDiagnostics` on B2B evaluate responses):

```json
"pyramidDiagnostics": {
  "weakestTier": { "categoryKey": "inspirational", "categoryName": "Inspirational Value", "categoryScore": 0.42, "strengthLabel": "Moderate" },
  "primaryDrillDown": {
    "categoryKey": "inspirational",
    "categoryName": "Inspirational Value",
    "subcategoryKey": "purpose",
    "subcategoryName": "Purpose",
    "elementSlugs": ["hope_b2b"],
    "elementDisplayNames": ["Hope"],
    "reason": "Weak Inspirational Value — Purpose defines the entire tier"
  },
  "tierDrillDowns": [],
  "categoryRanking": [],
  "subcategoryRanking": []
}
```

`topStrengths` and `criticalGaps` include `subcategory` when applicable. Scoring hierarchy: element → subcategory average → tier average (Table Stakes: element average only). Code: `backend/src/util/b2b_taxonomy.py` (mirrors `src/lib/framework/b2b-taxonomy.ts`).

Table Stakes has flat `elements` only (no `subcategories`). See [`docs/frameworks/B2B-FE-BE-IMPACT-NOTE.md`](../docs/frameworks/B2B-FE-BE-IMPACT-NOTE.md) for FE display and persistence impact.

**Response 422** — validation error or missing catalog:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": { "frameworkKey": ["Must be one of: ..."] }
}
```

---

## GET /api/evaluate/{runId}

Retrieve a completed evaluation run by ID.

**Response 200:**

```json
{
  "success": true,
  "runId": "uuid",
  "frameworkKey": "b2c-elements",
  "status": "completed",
  "overallScore": 0.45,
  "result": { }
}
```

**Response 404:**

```json
{
  "success": false,
  "error": "Evaluation run not found"
}
```

---

## Database tables (ce_* prefix)

| Table | Purpose |
|-------|---------|
| `ce_content_collection` | CanonicalFrameworkPayload persistence |
| `ce_assessment_corpus` | Framework-specific arranged content |
| `ce_corpus_section` | Sections (hero, purpose, cta, body, etc.) |
| `ce_core_signal` | Uncovered core messaging |
| `ce_synonym_group` / `ce_synonym_term` | Synonym tracking |
| `ce_framework_element` | Element catalog per framework (156 total) |
| `ce_framework_section_map` | Per-framework section priority map |
| `ce_assessment_pattern` | Scoring patterns |
| `ce_scoring_band` | Recommendation templates by score band |
| `ce_evaluation_run` | Evaluation execution record (`analysis_id` optional) |
| `ce_element_score` | Per-element 0.0–1.0 scores |
| `ce_evidence_match` | Pattern/synonym match audit trail |

## CLI commands

```bash
pipenv shell
python app.py demo-data    # seed all 6 frameworks (156 elements), patterns, synonyms, section maps
alembic upgrade head       # apply migrations
python scripts/build_framework_catalog.py  # regenerate framework_catalog.json from Next.js SSOT
```

## Postman

Import `backend/postman/content-evaluation-api.postman_collection.json`. Set `baseUrl` to `http://localhost:5001`. After a successful evaluate request, copy `runId` into the collection variable for the GET run request.
