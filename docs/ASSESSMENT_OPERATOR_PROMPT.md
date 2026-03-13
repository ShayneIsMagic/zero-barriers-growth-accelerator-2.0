# Assessment Operator Prompt

Use this runbook prompt before launching framework assessments so Puppeteer, Ollama, and Google-tools analysis paths are ready.

## Step 1: Start Required Local Services

Run from project root:

```bash
npm run dev
```

In another terminal, verify Ollama:

```bash
ollama list
curl -s http://127.0.0.1:11434/api/tags
```

Expected:
- model list includes `llama3.1:8b` (or your configured model)
- `/api/tags` returns JSON successfully

## Step 2: Verify App + AI Health

```bash
curl -s http://localhost:3000/api/health
```

Confirm:
- `status` is healthy
- `services.ollama.available` is `true`
- `services.ollama.configurationIssue` is `null`

## Step 3: Confirm Environment Variables

Required local values:
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=llama3.1:8b`
- `AI_PROVIDER=ollama`

Optional but recommended:
- `OLLAMA_KEEP_ALIVE=6h`
- `OLLAMA_NUM_PREDICT=1000` to `1400` (reduce timeouts)

## Step 4: Use This Execution Prompt

Copy and use this prompt for framework runs:

```text
Run a full framework assessment for {URL} using Puppeteer-collected language evidence and Ollama-first analysis.

Rules:
1) Evaluate all framework elements with flat fractional scoring (0.0-1.0).
2) Use only evidence from language streams: headlines, CTAs, testimonials, claims, mission/purpose text, navigation labels, and image alt/caption text.
3) Do not fabricate evidence; if evidence is weak, score conservatively and state the gap.
4) Return complete coverage checks so total analyzed equals framework total.
5) If Google tools data is supplied, analyze it separately first, then synthesize into final recommendations with explicit evidence sources.

Output:
- element/theme scores
- evidence snippets by stream
- category averages
- overall average
- top strengths, top gaps, and prioritized actions
```

## Step 5: Chunking + Unified Synthesis Mode

For frameworks with long prompts, use blocked analysis:
- Use `1` category per block for long frameworks or large page content.
- Use `2` categories per block for shorter inputs.

Then run one final Ollama synthesis prompt that combines all block outputs into a unified report.

Expected stored outputs:
- `chunked` report (category-level detail)
- `unified` report (single executive narrative)

## Step 6: Quick Functional Checks

1. Open `/dashboard/elements-value-b2c` and run one URL.
2. Open `/dashboard/brand-archetypes-standalone` and run the same URL.
3. Open `/dashboard/google-tools` with sample Google data and run analysis.

If any fail:
- re-check `/api/health`
- verify Ollama is reachable at `OLLAMA_BASE_URL`
- restart `npm run dev` after env changes
