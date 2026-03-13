# Dashboard Workflows (Ollama-First)

This is the quick reference for framework pages.  
Do not change these two pages:
- `/dashboard/content-comparison`
- `/dashboard/multi-page-scraping`

## Canonical Pipeline Diagram

This SVG is the canonical process map for framework assessment pages:

![Framework Page Analysis Pipeline](./framework_page_analysis_pipeline.svg)

Use this diagram as the primary reference for:
- stage sequence
- chunking process
- persistence and reuse behavior
- report and traceability display pattern

## Common 4-Stage Pattern

1. **Collect** -> canonical raw payload + `snapshotId`
2. **Persist** -> LocalForage + traceability hashes
3. **Analyze** -> Ollama-first chunking + unified synthesis
4. **Report** -> chunked + unified + readable markdown + tabs

<details>
<summary><strong>Stage 1 - Collect (click)</strong></summary>

- Inputs: `url`, optional `proposedContent`, `frameworkType`
- Output: one canonical JSON payload with `snapshotId` (primary key)
- Evidence streams: headlines, CTAs, testimonials, claims, mission/purpose, navigation labels, image alt/caption text

</details>

<details>
<summary><strong>Stage 2 - Persist (click)</strong></summary>

- Save canonical payload to LocalForage by `snapshotId`
- Write traceability hashes:
  - existing
  - proposed
  - analysis
- Reuse gate: once saved, do not re-scrape unless explicitly requested

</details>

<details>
<summary><strong>Stage 3 - Analyze (Chunking Process, click)</strong></summary>

- Ollama-first for all framework analysis pages
- Chunk size rules:
  - **1 category per chunk** for long/large inputs or timeout-prone runs
  - **2 categories per chunk** for shorter/medium inputs
- Process:
  1. Run chunk/block scoring
  2. Merge all chunk outputs
  3. Run unified synthesis over merged JSON
  4. Validate complete coverage and score bounds (`0.0` to `1.0`)

</details>

<details>
<summary><strong>Stage 4 - Report (click)</strong></summary>

- Save all report artifacts under the same `snapshotId`:
  - chunked
  - unified
  - readable markdown
- UI tabs always expose:
  - Raw payload
  - Analyzed output
  - Traceability/version

</details>

## Page-by-Page Quick Mapping

### `/dashboard/elements-value-b2c`
- Collect: language evidence streams for B2C elements
- Analyze: B2C category chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/elements-value-b2b`
- Collect: enterprise value/proof/compliance/process signals
- Analyze: B2B category chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/golden-circle-standalone`
- Collect: WHY/HOW/WHAT/WHO cues
- Analyze: component chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/clifton-strengths-simple`
- Collect: strategic/executing/influencing/relationship signals
- Analyze: domain chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/brand-archetypes-standalone`
- Collect: archetype narrative, emotional promise, social proof
- Analyze: archetype-group chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/revenue-trends`
- Collect: demand, offer, pricing, intent signals
- Analyze: market/revenue chunking -> unified synthesis
- Report: raw vs analyzed + traceability

### `/dashboard/google-tools`
- Collect: manual Google metrics payload
- Analyze: Ollama on normalized Google payload
- Report: raw metrics vs analyzed recommendations

### `/dashboard/automated-google-tools`
- Collect: automated Google-tool extraction + optional overrides
- Analyze: Ollama on normalized payload
- Report: raw extraction vs analyzed recommendations

---
**Reuse Patterns (keep front-of-mind)**

1. Re-run same framework on same `snapshotId` without recollection
2. Run multiple frameworks on one `snapshotId`
3. Compare multiple proposed versions against one base snapshot
4. Regenerate unified/markdown reports without re-scraping
