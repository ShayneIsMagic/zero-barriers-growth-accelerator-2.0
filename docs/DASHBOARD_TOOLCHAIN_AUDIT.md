# Dashboard Toolchain Audit

Last updated: 2026-03-09

This audit maps each dashboard page to:
- scraping path (Puppeteer vs fetch-based extractor),
- AI path (Ollama-first vs legacy),
- Google Tools usage,
- current break status,
- remediation steps.

## Executive Summary

- Live app currently reports `ollama.available: false` at `/api/health`.
- Ollama-dependent analyses return structurally valid responses but with zeroed results and chunk errors when Ollama is unreachable.
- Several legacy dashboard pages call API routes that do not exist in production (`404`).
- Puppeteer is local-first for most framework pages; production routes intentionally use `ProductionContentExtractor` (fetch-based) instead.

## Page Capability Matrix (Primary Dashboard Flows)

| Page | Primary API Path | Puppeteer | Google Tools | AI Path | Ollama Dependency | Current Status |
|---|---|---|---|---|---|---|
| `/dashboard/content-comparison` | `useAnalysisData('compare')` -> `/api/scrape/content` + `/api/analyze/compare` | Local: yes, Prod: no (`ProductionContentExtractor`) | No | `analyzeWithAI` in compare route | Yes (Ollama-first) | Works for scrape; AI quality degraded if Ollama down |
| `/dashboard/elements-value-b2c` | `/api/analyze/elements-value-b2c-standalone` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Returns output, but chunk errors/zero scores when Ollama down |
| `/dashboard/elements-value-b2b` | `/api/analyze/elements-value-b2b-standalone` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Same degradation as B2C |
| `/dashboard/clifton-strengths-simple` | `/api/analyze/clifton-strengths-standalone` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Same degradation when Ollama unavailable |
| `/dashboard/golden-circle-standalone` | `/api/analyze/golden-circle-standalone` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Same degradation when Ollama unavailable |
| `/dashboard/brand-archetypes-standalone` | `/api/analyze/brand-archetypes-standalone` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Same degradation when Ollama unavailable |
| `/dashboard/revenue-trends` | `/api/analyze/revenue-trends` | Local: compare/Puppeteer path, Prod: `ProductionContentExtractor` | No | Chunked -> `analyzeWithAI` | Yes | Same degradation when Ollama unavailable |
| `/dashboard/multi-page-scraping` | `/api/scrape-multi-page` | Local: yes (`PuppeteerComprehensiveCollector`), Prod: no (fetch-based HTML parsing) | No | None (scrape utility) | No | Works as scraper utility; not AI-dependent |
| `/dashboard/google-tools` | `/api/analyze/google-tools-ollama` | Not a website Puppeteer scrape flow | Yes (manual data interpretation) | Direct `analyzeWithOllama` | Yes | Fails with clear error when Ollama unreachable |
| `/dashboard/automated-google-tools` | `/api/scrape-google-tools` + `/api/analyze/google-tools-ollama` | Yes for Google tools scraper route, then Ollama analysis | Yes | Direct `analyzeWithOllama` | Yes | Scrape may work; analysis fails if Ollama unreachable |
| `/dashboard/unified-analysis` | `/api/analyze/unified` | Uses `reliable-content-scraper` (not standalone Puppeteer protocol route) | No | `EnhancedAnalysisService` -> `analyzeWithGemini` alias -> centralized AI | Effectively yes in current config | Currently returns "All analyses failed" in production |

## Legacy / Broken Dashboard Routes

| Page | Broken Dependency | Evidence | Why It Breaks | Remedy |
|---|---|---|---|---|
| `/dashboard/clifton-strengths` | `/api/analyze/phase-new` | POST returns `404` | Page still uses retired phase pipeline | Replace page with `clifton-strengths-simple` component or update to standalone route |
| `/dashboard/seo-analysis` | `/api/analyze/seo` | POST returns `404` | UI exists but API route missing | Implement route or remove page/links until route exists |
| `/dashboard/page-analysis` | `/api/analyze/page` | POST returns `404` | UI exists but API route missing | Implement route or remove page/links |
| `/dashboard/progressive-analysis` | `/api/analyze/progressive` | POST returns `404` | UI exists but API route missing | Implement route or remove page/links |
| `/dashboard/elements-value-standalone` | Page intentionally removed | Route renders "This page has been removed" message | Dashboard still advertises it as ready | Remove from dashboard card list and API surface, or restore complete implementation |

## Root Cause: Ollama Chain on Production

Current production health:
- `/api/health` shows `ai: "unhealthy"` and `ollama.available: false`.

Observed behavior:
- Framework routes still return JSON envelopes, but all chunk element scores collapse to `0` with chunk-level errors stating Ollama is unreachable.
- Google Tools Ollama route returns explicit reachability error.

Likely production causes:
1. Upstream Ollama host in proxy chain is not actually reachable/resolving from Vercel.
2. Proxy auth mismatch (`OLLAMA_API_KEY` in app vs `PROXY_API_KEY` in proxy) can produce authorization failures.
3. Proxy may be healthy itself, but upstream host/TLS/DNS remains the failing hop.

## Remediation Plan (Order Matters)

1. **Stabilize Ollama reachability**
   - Ensure `UPSTREAM_OLLAMA_URL` in proxy points to a real DNS-resolvable HTTPS Ollama host.
   - Verify app/proxy key agreement: app `OLLAMA_API_KEY` must match proxy expected key (`PROXY_API_KEY`) when proxy auth is enabled.
   - Validate end-to-end:
     - `GET /api/health` -> `ollama.available: true`
     - `POST /api/analyze/google-tools-ollama` returns success JSON.

2. **Fail fast on AI unavailability for framework pages**
   - When all chunk calls fail due provider reachability, return `success: false` (or explicit degraded status) instead of silently presenting all-zero scores as a normal result.
   - This prevents false confidence in reports.

3. **Clean dashboard route hygiene**
   - Remove or hide broken pages tied to missing APIs (`seo`, `page`, `progressive`, legacy `clifton-strengths`).
   - Remove `elements-value-standalone` from "ready" list if intentionally retired.

4. **Clarify Puppeteer expectations in production**
   - Current architecture: Puppeteer local-first, fetch-based extractor in Vercel serverless for most framework pages.
   - If true production Puppeteer is required, move scraping to a browser-capable worker/service and call it from Vercel.

## Quick Verification Checklist

- [ ] `/api/health` reports `ollama.available: true`.
- [ ] `/dashboard/google-tools` returns successful Ollama analysis from pasted data.
- [ ] `/dashboard/automated-google-tools` can scrape and analyze in one pass.
- [ ] B2C/B2B/Clifton/Golden/Archetypes routes return non-zero evidence-backed scoring.
- [ ] Legacy pages with missing APIs are removed or fully implemented.
