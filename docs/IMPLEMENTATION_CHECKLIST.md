# Implementation Checklist (Ollama-First, Framework Pages)

Use this checklist for all framework assessment pages.

Locked pages (no workflow changes):  
- `/dashboard/content-comparison`  
- `/dashboard/multi-page-scraping`

## 0) Guardrails

1. Do not modify collection or execution paths for locked pages.
2. Keep analysis Ollama-first.
3. Keep flat scoring strict: every framework element scored `0.0` to `1.0`.
4. Store and reuse raw payloads by `snapshotId`.

## 1) Stage 1 - Collect

1. Input required: `url`, `frameworkType`.
2. Input optional: `proposedContent`.
3. Build one canonical payload:
   - `snapshotId`
   - `url`
   - `frameworkType`
   - `collectedAt`
   - `rawEvidence`
   - `proposedContent` (optional)
4. Normalize evidence streams (headlines, CTAs, testimonials, claims, mission/purpose, navigation labels, image alt/caption).

## 2) Stage 2 - Persist

1. Save canonical payload to LocalForage keyed by `snapshotId`.
2. Write traceability hashes:
   - `existingContentHash`
   - `proposedContentHash` (or `null`)
   - `analysisHash` (after analysis)
3. Reuse rule: if `snapshotId` exists and user did not request refresh, do not re-scrape.

## 3) Stage 3 - Analyze (Chunking Process)

1. Use Ollama-first analysis.
2. Choose chunk size:
   - Use `1` category per chunk if framework/input is large.
   - Use `2` categories per chunk if framework/input is moderate.
3. Large-input rule (treat as large if any is true):
   - framework has 4 or more major categories, or
   - extracted text is long, or
   - previous run timed out on larger chunk size.
4. Run chunk sequence:
   - Start chunk -> score all elements in that chunk (`0.0-1.0`) -> emit chunk report.
5. Merge all chunk outputs.
6. Run unified synthesis pass with Ollama over merged JSON.
7. Validate completeness:
   - every required element exists,
   - all scores are numeric `0.0-1.0`,
   - category averages + overall average are present.

## 4) Stage 4 - Report

1. Persist outputs using the same `snapshotId`:
   - `chunkedReport`
   - `unifiedReport`
   - `readableMarkdown`
2. UI shows three tabs:
   - Raw Payload
   - Analyzed Output
   - Traceability / Version

## 5) Reuse Patterns (Do This by Default)

1. Re-run same framework from same `snapshotId` without recollection.
2. Run different frameworks from same `snapshotId`.
3. Compare multiple proposed-content versions against one snapshot.
4. Regenerate markdown/unified report without new scraping.

