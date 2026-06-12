#!/usr/bin/env node
/**
 * Smoke test all six Next.js framework analyze endpoints.
 * Usage: node scripts/smoke-analyze-all-frameworks.mjs [--base http://localhost:3000] [--quick]
 *
 * --quick  POST each route with existingContent only; skip full AI run (validates route + 400 handling).
 */

const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : process.env.TEST_BASE_URL || 'http://localhost:3000';

const QUICK = process.argv.includes('--quick');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

const SAMPLE_CONTENT = {
  title: 'Zero Barriers — Remove Growth Barriers',
  metaDescription:
    'We help businesses identify and remove growth barriers through proven frameworks.',
  wordCount: 420,
  cleanText: `Zero Barriers helps organizations remove growth barriers and accelerate revenue.
Our WHY: We believe every business deserves to thrive without artificial limits.
Our HOW: CliftonStrengths, Golden Circle, and Bain Elements of Value analysis.
Our WHAT: Growth accelerator assessments and actionable recommendations.
We serve visionary founders with wisdom, empathy, and strategic discipline.
Keywords: wisdom, guide, transform, breakthrough, community, purpose, innovation, trust, demand, partnership.`,
  extractedKeywords: ['growth', 'barriers', 'wisdom', 'strategic', 'demand'],
  headings: {
    h1: ['Remove Growth Barriers'],
    h2: ['Our Purpose', 'How We Help'],
    h3: ['Framework Assessments'],
  },
  url: 'https://zerobarriers.io',
  seo: {
    metaTitle: 'Zero Barriers',
    metaDescription: 'Growth frameworks',
    extractedKeywords: ['growth', 'barriers'],
    headings: { h1: ['Remove Growth Barriers'], h2: [], h3: [] },
  },
};

const FRAMEWORK_TESTS = [
  { name: 'b2c-elements', endpoint: '/api/analyze/elements-value-b2c-standalone', elements: 30 },
  { name: 'b2b-elements', endpoint: '/api/analyze/elements-value-b2b-standalone', elements: 40 },
  { name: 'clifton-strengths', endpoint: '/api/analyze/clifton-strengths-standalone', elements: 34 },
  { name: 'golden-circle', endpoint: '/api/analyze/golden-circle-standalone', elements: 24 },
  { name: 'brand-archetypes', endpoint: '/api/analyze/brand-archetypes-standalone', elements: 12 },
  { name: 'revenue-trends', endpoint: '/api/analyze/revenue-trends', elements: 16 },
];

async function checkAppHealth() {
  const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`App health HTTP ${res.status}`);
  return res.json();
}

async function quickContractCheck(name, endpoint) {
  const noUrl = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(15000),
  });
  const noUrlBody = await noUrl.json();
  const rejectsMissingUrl = noUrl.status === 400 || noUrlBody.success === false;

  const missingContent = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: SAMPLE_CONTENT.url }),
    signal: AbortSignal.timeout(15000),
  });
  const missingContentBody = await missingContent.json();
  const rejectsMissingContent =
    missingContent.status === 400 || missingContentBody.success === false;

  return {
    name,
    ok: rejectsMissingUrl && rejectsMissingContent,
    mode: 'quick',
    rejectsMissingUrl,
    rejectsMissingContent,
    missingContentStatus: missingContent.status,
    error: missingContentBody.error,
  };
}

async function fullAssessment(name, endpoint, expectedElements) {
  const started = Date.now();
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: SAMPLE_CONTENT.url,
      existingContent: SAMPLE_CONTENT,
      stream: false,
      analysisType: 'full',
    }),
    signal: AbortSignal.timeout(900_000),
  });
  const elapsedMs = Date.now() - started;
  const body = await res.json();

  if (!res.ok || !body.success) {
    return {
      name,
      ok: false,
      elapsedMs,
      error: body.error || `HTTP ${res.status}`,
      details: body.details,
    };
  }

  const analysis = body.analysis || body.comparison || {};
  const verification = analysis.verification || {};
  const analyzed = verification.total_elements_analyzed ?? countElements(analysis);
  const expectedTotal = verification.total_elements_in_framework ?? expectedElements;

  return {
    name,
    ok:
      (verification.completeness_check === 'pass' || verification.completeness_check === undefined) &&
      (verification.all_elements_accounted_for !== false) &&
      analyzed === expectedTotal &&
      !analysis._isFallback &&
      typeof analysis.overallScore === 'number',
    elapsedMs,
    elapsedSec: (elapsedMs / 1000).toFixed(1),
    overallScore: analysis.overallScore,
    analyzed,
    expectedTotal,
    isFallback: Boolean(analysis._isFallback),
  };
}

function countElements(analysis) {
  let total = 0;
  const categories = analysis.categories || {};
  for (const cat of Object.values(categories)) {
    const els = cat?.elements || {};
    total += Object.keys(els).length;
    if (cat?.subcategories) {
      for (const sub of Object.values(cat.subcategories)) {
        total += Object.keys(sub?.elements || {}).length;
      }
    }
  }
  return total;
}

function formatResult(r) {
  if (r.mode === 'quick') {
    const status = r.ok ? 'PASS' : 'FAIL';
    return `  ${status}  ${r.name} (quick) — rejects missing url: ${r.rejectsMissingUrl}, rejects missing content: ${r.rejectsMissingContent}${r.error ? ` (${r.error})` : ''}`;
  }
  if (!r.ok && r.error) {
    return `  FAIL  ${r.name} (${(r.elapsedMs / 1000).toFixed(1)}s)\n        ${r.error}${r.details ? ` — ${r.details}` : ''}`;
  }
  const status = r.ok ? 'PASS' : 'FAIL';
  return `  ${status}  ${r.name} — ${r.elapsedSec}s, score=${r.overallScore?.toFixed?.(3) ?? 'n/a'}, elements=${r.analyzed}/${r.expectedTotal}${r.isFallback ? ' [FALLBACK]' : ''}`;
}

async function main() {
  console.log(`=== Next.js Framework Smoke Test (${QUICK ? 'quick' : 'full'}) ===\n`);
  const health = await checkAppHealth();
  console.log(`App: ${BASE} — status ${health.status ?? 'unknown'}\n`);

  const results = [];
  for (const test of FRAMEWORK_TESTS) {
    console.log(`Running ${test.name}...`);
    const result = QUICK
      ? await quickContractCheck(test.name, test.endpoint)
      : await fullAssessment(test.name, test.endpoint, test.elements);
    results.push(result);
    console.log(formatResult(result));
    console.log('');
  }

  const allPass = results.every((r) => r.ok);
  console.log(allPass ? 'All framework routes passed.' : 'One or more framework routes failed.');
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error('Smoke test failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
