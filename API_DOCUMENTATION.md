# API Documentation

Source of truth for **Next.js** HTTP endpoints in Zero Barriers Growth Accelerator 2.0.  
Base URL: `http://localhost:3000` (dev) or your Vercel deployment URL (prod).

**Python evaluation backend** (Flask, separate dev server): see [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md). Base URL: `http://localhost:5001`.

### Documentation authority (avoid conflicts)

| Topic | Authoritative doc | Code SSOT |
|-------|-------------------|-----------|
| Next.js API contracts | **This file** | `src/app/api/**/route.ts` |
| Flask evaluate API | `backend/API_DOCUMENTATION.md` | `backend/src/` |
| B2B structure (40 slugs, subcategories) | `docs/frameworks/B2B-BAIN-PYRAMID-TAXONOMY.md` | `src/lib/framework/b2b-taxonomy.ts` |
| B2C structure (30 slugs, flat categories) | `docs/frameworks/B2C-CATEGORY-TAXONOMY.md` | `src/lib/framework/b2c-taxonomy.ts` |
| Scoring bands & formulas (all frameworks) | `docs/frameworks/*-Flat-Scoring.md` | Injected into chunked prompts |
| Pipeline, enrich fields, UI read order | `docs/guides/*_ASSESSMENT_GUIDE.md` | See guide § API / § Implementation |
| B2B/B2C FE display & persistence gaps | `docs/frameworks/B2B-FE-BE-IMPACT-NOTE.md` | — |
| Agent workflow | `AGENTS-app.md` | — |

**Do not use for production structure:** `docs/archived/*`, `docs/frameworks/ACCURATE-PROMPTS.md` (legacy prompt snapshots), `docs/FLOW_AUDIT_AND_FIXES.md` (pre-Bain audit). Archived docs are **definitions/synonyms only**.

**Next.js vs Flask:** Chunked standalone routes enrich Brand Archetypes and CliftonStrengths with `top_three_archetypes`, `not_archetypes`, `personality_profile`, `top_five_strengths`, and `domain_rankings`. Flask currently returns `primary_archetype` / `secondary_archetypes` for archetypes and category rollups for B2B/B2C — see backend API doc for parity notes.

### Flask ↔ frontend integration (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_EVALUATION_API_URL` | `http://localhost:5001` | Flask base URL for `POST /api/evaluate` |
| `NEXT_PUBLIC_ENABLE_FLASK_EVALUATION` | unset (`false`) | When `true`, standalone pages show **Deterministic (Flask)** button and Content Comparison → Framework Analysis runner offers **Deterministic (Flask — no AI)** engine |

Client: `src/lib/services/flask-evaluation.service.ts`. Hook: `useFrameworkPageAnalysis().runDeterministicAnalysis`. Content Comparison runner: `FrameworkAnalysisRunner` (analysis engine select when Flask enabled).

**Smoke tests:** `npm run smoke:flask` · `npm run smoke:frameworks:quick` · `npm run smoke:frameworks` (full AI).

**Flask catalog rebuild (after synonym enrichment):** `npm run build:catalog` then `cd backend && pipenv run python app.py demo-data`.

## Conventions

### Authentication

Protected routes require:

```
Authorization: Bearer <jwt>
```

JWT is issued by `POST /api/auth/signin`. Payload uses `userId`, `email`, and `role`.  
Signed with `NEXTAUTH_SECRET`.

| Auth level | Description |
|---|---|
| **None** | Default — auth open until `ENABLE_AUTH=true` or `DISABLE_AUTH=false` |
| **Bearer** | Valid JWT required when auth is enabled (`ENABLE_AUTH=true`, `REQUIRE_API_AUTH=true`, or `DISABLE_AUTH=false`) — middleware enforces on `/api/analyze`, `/api/scrape`, `/api/content`, `/api/reports`, `/api/analysis`, `/api/generate-*`, `/api/tools` |
| **Bearer (route)** | Some routes also require auth at handler level (`/api/content/snapshots`, `GET /api/analysis`) |
| **Dev only** | Returns `404` in production (`NODE_ENV !== 'development'` and `TEST_MODE !== 'true'`) |

Cookie: `auth_token` (HttpOnly, set by signin). Frontend also stores JWT in `localStorage` key `auth_token` for `Authorization: Bearer` headers via `apiCall` / `authenticatedFetch`.

### Standard response shapes

**Success (analysis and data routes):**

```json
{
  "success": true,
  "existing": {},
  "analysis": {},
  "message": "Analysis completed successfully"
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

**Auth error:**

```json
{
  "error": "Human-readable message"
}
```

**Health:**

```json
{
  "status": "healthy",
  "timestamp": "ISO-8601",
  "services": { "api": "healthy" }
}
```

### Status codes

| Code | Usage |
|---|---|
| `200` | Success |
| `400` | Validation error / missing required field |
| `401` | Missing or invalid auth token |
| `404` | Resource not found (or dev-only route in production) |
| `500` | Server error |

---

## Authentication

### `POST /api/auth/signup`

Register a new user.

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "email": string, "password": string, "name"?: string }` |
| **200** | `{ "user": { id, email, name, role }, "token": string }` |
| **400** | Missing email/password |
| **409** | Email already exists |

### `POST /api/auth/signin`

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "email": string, "password": string }` |
| **200** | `{ "user": { id, email, name, role }, "token": string }` |
| **400** | Missing fields |
| **401** | Invalid credentials |

### `POST /api/auth/signout`

| | |
|---|---|
| **Auth** | None |
| **200** | Clears `auth_token` cookie |

### `GET /api/auth/me`

| | |
|---|---|
| **Auth** | Bearer |
| **200** | `{ "user": { id, email, name, role, createdAt, updatedAt } }` |
| **401** | Not authenticated / invalid token |

### `POST /api/auth/forgot-password`

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "email": string }` |

---

## User

### `GET /api/user/profile`

| | |
|---|---|
| **Auth** | Bearer |
| **200** | User profile object |

### `PUT /api/user/profile`

| | |
|---|---|
| **Auth** | Bearer |
| **Body** | `{ "name"?: string, "email"?: string }` |

### `POST /api/user/change-password`

| | |
|---|---|
| **Auth** | Bearer |
| **Body** | `{ "currentPassword": string, "newPassword": string }` |

---

## System

### `GET /api/health`

| | |
|---|---|
| **Auth** | None |
| **200** | Health status with uptime, memory, service checks (sanitized in production) |

### `GET /api/system/status`

Workspace status panel — Ollama, AI keys, auth mode, current user.

| | |
|---|---|
| **Auth** | Bearer |
| **200** | `{ api, ollama, ai, user }` status object |

### `GET /api/workflow/status`

| | |
|---|---|
| **Auth** | None |
| **200** | Workflow pipeline status |

---

## Content scraping

### `POST /api/scrape-content`

Scrape a single URL.

| | |
|---|---|
| **Auth** | Bearer (when API auth enforced) |
| **Body** | `{ "url": string }` |
| **400** | Missing URL |

### `POST /api/scrape/content`

Alternative scrape endpoint with structured extraction.

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "url": string }` |

### `POST /api/scrape/get`

Retrieve previously scraped content.

### `POST /api/scrape-multi-page`

Discover and scrape multiple pages from a site.

| | |
|---|---|
| **Auth** | None |
| **Body** | `{ "url": string, "maxPages"?: number }` |
| **maxDuration** | 120s |

### `POST /api/scrape-google-tools`

Collect Google Tools signals (Trends, PageSpeed, etc.).

---

## Content collection (unified)

### `POST /api/content/collect`

Shared collection protocol used by content-comparison, multi-page-scraping, and all framework pages.

| | |
|---|---|
| **Auth** | Bearer (when API auth enforced) |
| **Body** | `{ "url": string, "mode"?: "comprehensive" \| "multi-page", "options"?: { maxPages?, maxDepth?, includeSubpages?, ... } }` |
| **200** | `{ "success": true, "mode", "existing": CollectedContentPayload, "comprehensive": rawData, "collectedAt" }` |
| **400** | Missing or invalid URL |
| **403** | Website blocked scraper |

- `comprehensive` (default): same as content-comparison (`PuppeteerComprehensiveCollector` locally)
- `multi-page`: same as `/api/scrape-multi-page`

Collected data is cached client-side via `UnifiedLocalForageStorage`.

---

## Content version control

### `POST /api/content/snapshots`

Create a content snapshot.

| | |
|---|---|
| **Auth** | Bearer |
| **Body** | `{ "url": string, "content": object, "title"?: string, "metadata"?: object }` |

### `GET /api/content/snapshots`

List snapshots. Query: `?url=`.

### `POST /api/content/proposed`

Create proposed content version.

### `GET /api/content/proposed`

List proposed versions. Query: `?snapshotId=`.

### `PUT /api/content/proposed`

Update proposed content.

### `POST /api/content/compare`

Create content comparison record.

### `GET /api/content/compare`

Retrieve comparison. Query: `?id=`.

---

## Framework analysis — standalone (primary)

These are the production-ready framework endpoints. All accept:

```json
{
  "url": "https://example.com",
  "proposedContent": "optional string",
  "existingContent": "optional object from LocalForage",
  "stream": true
}
```

| Endpoint | Framework |
|---|---|
| `POST /api/analyze/elements-value-b2c-standalone` | B2C Elements of Value (30) |
| `POST /api/analyze/elements-value-b2b-standalone` | B2B Elements of Value (40) |
| `POST /api/analyze/golden-circle-standalone` | Golden Circle |
| `POST /api/analyze/clifton-strengths-standalone` | CliftonStrengths (34) |
| `POST /api/analyze/brand-archetypes-standalone` | Brand Archetypes (12) — flat 0.0–1.0 scoring per archetype |
| `POST /api/analyze/elements-value-standalone` | Generic elements |
| `POST /api/analyze/revenue-trends` | Revenue trends |

**Auth:** Bearer when API auth enforced (all standalone routes).

**B2B / B2C Elements response shape:** B2B `analysis.categories` uses Bain subcategories (`subcategoryScore` + nested `elements`) on all tiers except Table Stakes. B2C uses flat `categories.{key}.elements` only. Scoring rollups: B2B element → subcategory → category; B2C element → category. Standalone UI: `ElementsValueResultsPanel` (strength-first). See `docs/frameworks/B2B-FE-BE-IMPACT-NOTE.md`, `B2B-BAIN-PYRAMID-TAXONOMY.md`, `B2C-CATEGORY-TAXONOMY.md`.

**Brand Archetypes scoring:** See `docs/frameworks/Brand-Archetypes-Flat-Scoring.md`. Each of 12 archetypes scored `0.0–1.0`; `overallScore = sum of 12 scores ÷ 12`. Chunked into 4 motivational groups (3 archetypes per block). **Strategic read:** top 3 by score + weak/absent (`not_archetypes`). **Site personality** derived at enrich time.

**`analysis` object (Brand Archetypes, key fields):**

| Field | Type | Description |
|---|---|---|
| `overallScore` | number | Mean of 12 archetype scores (`0.0–1.0`) |
| `totalElements` | number | `12` when complete |
| `categories` | object | Keys: `ego`, `order`, `freedom`, `social` — each has `elements.{slug}.score` |
| `top_three_archetypes` | array | **Ranks #1–#3** by score (primary UI read) |
| `not_archetypes` | array | Archetypes with score < `0.4` — what the brand is **not** |
| `personality_profile` | object | Site personality synthesis (headline, tensions, coherence) |
| `topStrengths` | array | Archetypes with score ≥ `0.7` (up to 5) from merge step |
| `criticalGaps` | array | Archetypes with score < `0.4` (up to 5) from merge step |
| `primary_archetype` | object \| array | Highest score; array when co-primary (within `0.05`) — legacy/co-primary |
| `secondary_archetypes` | array | Next strongest with score ≥ `0.6`, excluding primary |
| `dominant_cluster` | array | All archetypes with score ≥ `0.8` |
| `verification.completeness_check` | string | `pass` \| `fail` |
| `unifiedReport` | string | Markdown synthesis |
| `chunkedReport` | string | Deterministic markdown from merged JSON |

**`personality_profile` shape (Brand Archetypes):**

| Field | Type | Description |
|---|---|---|
| `framework` | string | `"brand-archetypes"` |
| `headline` | string | e.g. `"The Sage–The Hero brand voice"` |
| `summary` | string | Narrative interpretation |
| `signalType` | string | `coherent_single` \| `coherent_blend` \| `multi_dominant` \| `conflicting_signals` \| `undefined_identity` \| `generic_messaging` |
| `dominantLabels` | string[] | Top 3 archetype display names |
| `supportingLabels` | string[] | Weak/absent archetype names (up to 3) |
| `tensions` | array | Opposing archetype pairs both ≥ `0.6` |
| `coherenceScore` | number | `0.0–1.0` — higher = more consistent voice |

**Ranking rules:** `top_three_archetypes` = sort all 12 scores descending, take ranks 1–3. `not_archetypes` = all with score < `0.4`. `personality_profile` from `src/lib/framework/brand-personality.ts` via `enrichAnalysisWithArchetypeRanking()` in `src/lib/framework/archetype-ranking.ts`. UI: `BrandArchetypesPage` + `BrandPersonalityPanel`.

**CliftonStrengths scoring:** See `docs/frameworks/CliftonStrengths-Flat-Scoring.md`. 34 themes across 4 domains; `overallScore = sum of 34 scores ÷ 34`. **Strategic read:** domain rankings (themes ranked within each domain) → top 5 across all 34 → full listing.

**`analysis` object (CliftonStrengths, key fields):**

| Field | Type | Description |
|---|---|---|
| `overallScore` | number | Mean of 34 theme scores (`0.0–1.0`) |
| `totalElements` | number | `34` when complete |
| `categories` | object | Keys: `strategic_thinking`, `executing`, `influencing`, `relationship_building` |
| `top_five_strengths` | array | **Top 5 themes** across all 34 by score |
| `domain_rankings` | array | Each domain: `score`, `themes[]` ranked within domain |
| `signature_themes` | array | Themes with score ≥ `0.8` (or co-signature ties) |
| `supporting_themes` | array | Themes `0.6–0.79` excluding signatures |
| `dominant_domain` | object | Highest domain average |
| `theme_ranking.allRanked` | array | All 34 themes ranked |
| `personality_profile` | object | Content personality (same shape as archetypes; `framework: "clifton-strengths"`) |
| `topStrengths` / `criticalGaps` | array | From merge step (≥ `0.7` / < `0.4`, up to 5 each) |
| `verification.completeness_check` | string | `pass` \| `fail` |

**Clifton enrichment:** `enrichAnalysisWithCliftonRanking()` in `src/lib/framework/clifton-theme-ranking.ts` (called from `clifton-strengths-standalone/route.ts`). UI: `CliftonThemeResultsPanel` + `BrandPersonalityPanel`.

**Common responses:**

| Status | Body |
|---|---|
| `400` | `{ "success": false, "error": "URL required" }` |
| `200` | `{ "success": true, "existing": {}, "analysis": {}, "readableMarkdown": "...", "analysisId": "uuid (when authenticated)", "message": "..." }` |
| `500` | `{ "success": false, "error": "...", "details": "..." }` |

When AI is unavailable, standalone routes may return `fallbackMarkdown` for manual analysis.

**maxDuration:** `300` seconds on all standalone framework routes (`export const maxDuration = 300` in each `route.ts`). Streaming progress events may extend perceived client-side wait time.

---

## Framework analysis — other

| Endpoint | Purpose |
|---|---|
| `POST /api/analyze/compare` | Side-by-side existing vs proposed content |
| `POST /api/analyze/controlled` | Controlled analysis with explicit parameters |
| `POST /api/analyze/unified` | Multi-framework unified run |
| `POST /api/analyze/enhanced` | Enhanced multi-signal analysis |
| `POST /api/analyze/website` | Full website analysis (Zod validated) |
| `POST /api/analyze/step-by-step` | Phased step-by-step (Zod validated) |
| `POST /api/analyze/step-by-step-execution` | Execute a specific step |
| `POST /api/analyze/individual/b2c-elements` | Individual B2C report |
| `POST /api/analyze/individual/b2b-elements` | Individual B2B report |
| `POST /api/analyze/individual/golden-circle` | Individual Golden Circle |
| `POST /api/analyze/individual/clifton-strengths` | Individual CliftonStrengths |
| `POST /api/analyze/golden-circle` | Legacy Golden Circle |
| `POST /api/analyze/elements-of-value` | Legacy elements |
| `POST /api/analyze/revenue-golden-circle` | Revenue-focused Golden Circle |
| `POST /api/analyze/revenue-elements-value` | Revenue-focused elements |
| `POST /api/analyze/actionable-report` | Actionable report generation |
| `POST /api/analyze/simple-actionable` | Simplified actionable report |
| `POST /api/analyze/lighthouse` | Lighthouse performance |
| `POST /api/analyze/claude-project` | Claude project integration |
| `POST /api/analyze/phase` | Phase router |
| `POST /api/analyze/phase1-simple` | Phase 1 simple |
| `POST /api/analyze/phase1-complete` | Phase 1 complete |
| `POST /api/analyze/phase2-simple` | Phase 2 simple |
| `POST /api/analyze/phase2-complete` | Phase 2 complete |
| `POST /api/analyze/phase3-complete` | Phase 3 complete |
| `POST /api/analyze/enhanced/b2c-elements` | Enhanced B2C |

---

## Analysis retrieval

| Endpoint | Purpose |
|---|---|
| `GET /api/analysis` | List analyses **for authenticated user only** (Bearer) |
| `GET /api/analysis/report/[id]` | Get report by ID |
| `GET /api/analysis/golden-circle/[id]` | Golden Circle result |
| `GET /api/analysis/elements-value-b2c/[id]` | B2C result |
| `GET /api/analysis/elements-value-b2b/[id]` | B2B result |
| `GET /api/analysis/clifton-strengths/[id]` | CliftonStrengths result |

---

## Reports

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reports` | GET | List reports (paginated) |
| `/api/reports` | POST | Create report |
| `/api/reports/[id]` | GET | Get report |
| `/api/reports/[id]` | DELETE | Delete report |
| `/api/reports/stats` | GET | Report statistics |

---

## Generation

| Endpoint | Purpose |
|---|---|
| `POST /api/generate-pdf` | Generate PDF from analysis |
| `POST /api/generate-executive-report` | Executive report |
| `GET /api/generate-evaluation-guide` | Evaluation guide template |

---

## Tools

| Endpoint | Purpose |
|---|---|
| `POST /api/tools/trends` | Google Trends data |
| `POST /api/tools/lighthouse` | Lighthouse audit |

---

## tRPC (stub)

| Endpoint | Purpose |
|---|---|
| `GET/POST /api/trpc/[trpc]` | Placeholder — returns not-implemented in static builds |

---

## Development & test routes

**All routes below return `404` in production.**

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/test-simple` | GET | Ping test |
| `/api/test-db` | GET | Database connectivity |
| `/api/test-prisma-simple` | GET | Prisma query test |
| `/api/test-simple-analysis` | POST | Gemini smoke test (costs API credits) |
| `/api/test-prompts` | POST | Prompt A/B test (costs API credits) |
| `/api/debug-user` | GET | User lookup by email (dev only) |

Query for debug-user: `?email=user@example.com`

---

## Database (PostgreSQL / Prisma)

**Source of truth:** `prisma/schema.prisma` (75 models). **Production:** Supabase-hosted Postgres. **Never** apply schema changes with ad-hoc SQL outside migrations.

### Schema management

| Command | When to use |
|---|---|
| `npm run db:migrate` | Local dev — create/review migration after `schema.prisma` changes |
| `npm run db:migrate:deploy` | Production / Supabase — apply pending migrations |
| `npm run db:migrate:status` | Verify migration state |
| `npm run db:push` | Quick local prototype only — prefer migrations for shared environments |
| `npm run admin:ensure` | Seed/update `SUPER_ADMIN` from env (not demo data) |

Migrations live in `prisma/migrations/`. Baseline: `20250610120000_baseline`. Legacy SQL in `prisma/migrations/advanced-schema/` is archival — do not run directly.

**Existing Supabase (schema already applied):** mark baseline as applied without re-running DDL:

```bash
npx prisma migrate resolve --applied 20250610120000_baseline
```

### What is persisted server-side

| Data | Table(s) | When |
|---|---|---|
| Users / auth | `User` | Signup, `admin:ensure` |
| Content snapshots | `ContentSnapshot`, `ProposedContent`, `ContentComparison` | `/api/content/*` (Bearer required) |
| Standalone framework runs | `Analysis`, `FrameworkResult`, `FrameworkCategory`, `FrameworkElement` | Standalone `POST /api/analyze/*-standalone` and `revenue-trends` when caller is authenticated |
| Phased / comprehensive reports | `Analysis` (+ related) | Phase routes, `report-storage.ts` |
| Client cache | LocalForage / `localStorage` | Scraped content and UI session — **not** authoritative; see Client storage keys |

Standalone routes return `analysisId` when a valid JWT is present. Unauthenticated local dev (`DISABLE_AUTH=true`) skips DB writes by design.

Retrieve saved runs: `GET /api/analysis` (user-scoped list), `GET /api/analysis/report/[id]`.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection |
| `NEXTAUTH_SECRET` | Yes | JWT signing |
| `NEXTAUTH_URL` | Yes | App base URL |
| `GEMINI_API_KEY` | Yes* | Primary AI provider |
| `CLAUDE_API_KEY` | No | AI fallback |
| `OLLAMA_BASE_URL` | No | Local Ollama (default `http://127.0.0.1:11434`) |
| `OLLAMA_MODEL` | No | Ollama model name |
| `TEST_MODE` | No | Set `true` to enable dev-only routes in non-dev environments |
| `NODE_ENV` | No | `development` enables dev-only routes |
| `REQUIRE_API_AUTH` | No | `true` forces JWT on protected API prefixes (default: true in production) |
| `ALLOW_PUBLIC_SIGNUP` | No | `true` allows self-service signup (default: false in production) |
| `SUPER_ADMIN_EMAIL` | No | Email promoted to `SUPER_ADMIN` on signin |
| `SUPER_ADMIN_PASSWORD` | No | Used by `npm run admin:ensure` only |

\*At least one AI provider must be configured for analysis endpoints to succeed.

---

## Client storage keys

Documented per AGENTS-app state-management rules. All keys are browser-local unless cleared.

| Key / store | Location | Contents | Clear |
|---|---|---|---|
| `auth_token` | `localStorage` | JWT for API calls | Sign out |
| `analysisData` | `localStorage` | Dashboard analysis session | Manual / page reset |
| `simple-analyses` | `localStorage` | Step-by-step progress | `useSimpleProgress` clear |
| `vercel_usage_tracking` | `localStorage` | Usage monitor counters | `usage_last_reset` monthly |
| `ZeroBarriers` / `puppeteer_data` | LocalForage | Scraped content by URL | `UnifiedLocalForageStorage.clearAll()` |
| `ZeroBarriers` / `reports` | LocalForage | Full report payloads (JSON/markdown) | `getReport(id)` |
| `ZeroBarriers` / `reports_index` | LocalForage | Report metadata index (`url`, `domain`, `assessmentType`, `timestamp`, `frameworkKind`) | `getAllReportSummaries()` — list without loading payloads; `rebuildReportsIndex()` repairs drift |
| Framework snapshots | LocalForage | Canonical framework payloads | `snapshot-storage` per snapshotId |

Frontend API calls must use `apiCall` (`src/lib/api-call.ts`) or `useAPICall` / `useTriggeredAPICall` hooks so Bearer auth is attached automatically.

---

## Changelog

| Date | Change |
|---|---|
| 2026-06-08 | Initial contract document; dev-only route gating; shared `api-route.ts` helpers |
| 2026-06-08 | Auth table corrected; system/status + brand-archetypes documented; client storage keys; IDOR fix on GET /api/analysis |
| 2026-06-10 | Database section: Prisma migrations, persistence model, `analysisId` on standalone responses |
| 2026-06-10 | B2B/B2C Bain taxonomy + strength-first standalone UI; archetype `top_three` / `not_archetypes` / `personality_profile`; Clifton `top_five_strengths` / `domain_rankings`; documentation authority section; guides/backend API parity notes |
