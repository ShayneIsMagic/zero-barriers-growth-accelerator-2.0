# Rollback Reference — Pre-Merge Safety Snapshot

**Documented:** 2026-06-08  
**Purpose:** Record known-good commits before merging `shayne-agents-v6` into `main`, so production or local dev can be restored quickly.

> **Read this before any merge to `main`.** Update this file after each checkpoint commit or production deploy.

---

## At a glance

| Role | Branch / ref | Commit | Remote |
|------|--------------|--------|--------|
| **Production (`origin/main`)** | `main` | `43a29a1` | pushed 2026-06-08 ✅ |
| **Local `main`** | `main` | `43a29a1` | in sync with `origin/main` |
| **Feature branch (`origin/shayne-agents-v6`)** | `shayne-agents-v6` | `ab5afec` | 1 commit behind `main` (rollback doc only) |
| **Pre-merge production rollback** | commit | `bf6b824` | use if Vercel deploy from new `main` fails |

**Merge completed:** 2026-06-08 — fast-forward `main` ← `shayne-agents-v6` (15 commits including checkpoint `ab5afec`).

---

## 1. Production rollback target (`main`)

Use this to restore what is on **`origin/main`** today (likely Vercel production if auto-deploy from `main`).

| Field | Value |
|-------|-------|
| **Commit (full)** | `bf6b82400104de688ea1e28693ecec73f54a1bd6` |
| **Commit (short)** | `bf6b824` |
| **Date** | 2026-03-08 (per git) |
| **Subject** | `security: Remove exposed .env.local.backup, block all env backup patterns in .gitignore` |
| **Author** | ShayneIsMagic |

### Rollback commands (production / clean tree)

```bash
# Inspect
git fetch origin
git log -1 origin/main

# Hard reset local main to remote (destructive to local main-only changes)
git checkout main
git reset --hard origin/main   # lands on bf6b824

# Vercel: redeploy this commit from the dashboard, or:
git push origin bf6b824:main   # only if you intend to move main back — coordinate first
```

---

## 2. Feature branch checkpoint (last committed, pushed)

Use this to restore the **last committed** state of the agents v6 work **without** local WIP.

| Field | Value |
|-------|-------|
| **Branch** | `shayne-agents-v6` |
| **Commit (full)** | `8dd7017ba66539af55af21bed63dee6f22b058f5` |
| **Commit (short)** | `8dd7017` |
| **Date** | 2026-03-13 10:29:29 -0600 |
| **Subject** | `fix: improve Ollama endpoint reachability and fallback key support` |
| **Body** | Multi-endpoint Ollama resolution, `ANTHROPIC_API_KEY` fallback alias, health output |

### Rollback commands (feature branch commit only)

```bash
git fetch origin
git checkout shayne-agents-v6
git reset --hard 8dd7017
# or
git reset --hard origin/shayne-agents-v6
```

### Optional tag (recommended before merge)

Create a local or remote tag so this commit is easy to find later:

```bash
git tag -a pre-merge-shayne-agents-v6-8dd7017 8dd7017 -m "Checkpoint before merge to main (2026-06-08)"
git push origin pre-merge-shayne-agents-v6-8dd7017   # optional, when ready
```

---

## 3. Local dev server — important

A dev server has been running with **`npm run dev`** (Next.js on **http://localhost:3001** — port 3000 was in use).

**That process is NOT pinned to a single git commit.** It reflects:

1. Branch `shayne-agents-v6` at commit `8dd7017`, **plus**
2. **~116 uncommitted paths**, including:
   - Assessment guides (`docs/guides/*`)
   - `API_DOCUMENTATION.md`, `AGENTS-app.md`, `postman/`
   - `src/lib/framework/*` (chunk configs, archetype ranking, keyword hints)
   - `src/lib/api-call.ts`, `src/services/*`, `src/middleware.ts`
   - Widespread `apiCall` migration across analysis pages
   - Security tests, content collection APIs, workspace UI

**To roll back local dev to last commit only** (loses uncommitted work):

```bash
git checkout shayne-agents-v6
git reset --hard 8dd7017
git clean -fd   # removes untracked files — destructive; read git clean docs first
```

**To preserve current running behavior before merge** (strongly recommended):

```bash
# Option A: checkpoint commit on the feature branch
git add -A
git status   # review carefully — no .env secrets
git commit -m "chore: checkpoint pre-merge agents v6 + assessment guides"

# Option B: stash (if you are not ready to commit)
git stash push -u -m "pre-merge WIP 2026-06-08"
```

| Checkpoint | Commit | Notes |
|------------|--------|-------|
| Pre-merge WIP checkpoint | `ab5afec` | All guides, apiCall layer, archetype ranking, API docs |
| Merged `main` HEAD | `ab5afec` | Fast-forward merge 2026-06-08 |

---

## 4. Commits that would merge into `main` (14)

Oldest → newest (from `git log main..shayne-agents-v6`):

| # | Short | Date | Subject |
|---|-------|------|---------|
| 1 | `372aa1b` | 2026-02-19 | feat: Add Markdown fallback prompts when AI analysis fails |
| 2 | `6e636a6` | 2026-02-20 | feat: Add Claude API fallback for all analysis routes |
| 3 | `6a9406b` | 2026-02-20 | refactor: Centralize AI provider — Claude primary, Gemini fallback |
| 4 | `a7bb826` | 2026-02-20 | feat: chunk framework analyses by category |
| 5 | `ea62a1e` | 2026-02-20 | feat: add Brand Archetypes standalone analysis route |
| 6 | `f3ef8eb` | 2026-02-20 | security: sanitize all error messages to strip API keys |
| 7 | `8efb48b` | 2026-03-09 | feat: standardize Ollama-first assessments and Brand Archetypes page |
| 8 | `a18587f` | 2026-03-09 | fix: resolve Vercel build type blockers in executive report flow |
| 9 | `7e18c16` | 2026-03-09 | refactor: enforce real AI contracts and isolate Google tools Ollama |
| 10 | `bf18291` | 2026-03-09 | feat: standardize puppeteer evidence protocol and Ollama lifecycle |
| 11 | `c203ddb` | 2026-03-09 | fix: harden Ollama live deployment behavior and diagnostics |
| 12 | `cfd1a89` | 2026-03-13 | chore: checkpoint workflow, traceability, and ollama-first updates |
| 13 | `92ceed8` | 2026-03-13 | feat: standardize canonical framework payload pipeline |
| 14 | `8dd7017` | 2026-03-13 | fix: improve Ollama endpoint reachability and fallback key support |

**Diff stat (committed only, `main..8dd7017`):** 69 files changed, ~6940 insertions, ~1340 deletions.

---

## 5. Pre-merge checklist

- [ ] **Checkpoint uncommitted WIP** — commit or stash (§3); update table in §3 with new hash
- [ ] **Tag** `8dd7017` or checkpoint commit (`pre-merge-shayne-agents-v6-*`)
- [ ] Run `npm run type-check` and `npm run test` on checkpoint commit
- [ ] Confirm Vercel production is still on `origin/main` (`bf6b824`) before merge
- [ ] Merge via PR (review diff `main...shayne-agents-v6`), not blind fast-forward
- [ ] After merge: note new `main` HEAD below in §6
- [ ] Verify production deploy; if broken, rollback to `bf6b824` (§1)

---

## 6. Post-merge log (fill in after merge)

| Event | Date | `main` commit | Notes |
|-------|------|---------------|-------|
| Pre-merge production (`origin/main`) | 2026-06-08 | `bf6b824` | Rollback target if deploy fails |
| Pre-merge feature tip | 2026-06-08 | `8dd7017` | Before WIP checkpoint |
| WIP checkpoint | 2026-06-08 | `ab5afec` | Committed before merge |
| Merge to `main` (local) | 2026-06-08 | `ab5afec` | Fast-forward; **not pushed** |
| Post-merge production (`origin/main`) | 2026-06-08 | `43a29a1` | Pushed; Vercel deploy expected |

---

## 8. Refactor branch (`refactor`) — 2026-06-08

Pre-merge checkpoint for FE refactor phases B–E, vocab Phase 3, reports index (Phase D), and Flask runner integration.

| Role | Branch | Commit (pre-WIP) | Notes |
|------|--------|-------------------|-------|
| **Production (`origin/main`)** | `main` | `7bc9d62` | Last known remote main at doc time |
| **Refactor checkpoint (pushed)** | `refactor` | `2ae7049` | Structured UX + Flask path on standalone pages |
| **Refactor WIP (this commit)** | `refactor` | *(after commit)* | Reports index, runner Flask toggle, `normalizeRawEvidence` fix |

### Rollback (refactor branch only)

```bash
git checkout refactor
git reset --hard 2ae7049   # last pushed checkpoint
```

### Pre-merge checklist (refactor → main)

- [x] `npm run lint:check` · `npm run type-check` · `npm test` (102 tests)
- [x] `npm run smoke:flask` · `npm run smoke:frameworks:quick`
- [ ] Authenticated ReportsViewer manual smoke (Phase D lazy load)
- [ ] Merge via PR; update §6 post-merge log

---

## 7. Related docs

- Agent workflow: [`AGENTS-app.md`](../AGENTS-app.md)
- API contract: [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md)
- Assessment guides index: [`docs/guides/README.md`](./guides/README.md)
- Historical rollback (Oct 2025): [`docs/archived/ROLLBACK_COMPLETE.md`](./archived/ROLLBACK_COMPLETE.md)

---

*Regenerate commit lists:* `git log main..HEAD --oneline` · *Verify remotes:* `git fetch origin && git rev-parse origin/main origin/shayne-agents-v6`
