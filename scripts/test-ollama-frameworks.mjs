#!/usr/bin/env node
/**
 * End-to-end Ollama smoke test for Brand Archetypes (12) and CliftonStrengths (34).
 * Usage: node scripts/test-ollama-frameworks.mjs [--base http://localhost:3000]
 */

const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : process.env.TEST_BASE_URL || 'http://localhost:3000';

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

const SAMPLE_CONTENT = {
  title: 'Zero Barriers — Remove Growth Barriers',
  metaDescription:
    'We help businesses identify and remove growth barriers through proven frameworks, strategic thinking, and authentic brand storytelling.',
  wordCount: 420,
  cleanText: `Zero Barriers helps organizations remove growth barriers and accelerate revenue.

Our WHY: We believe every business deserves to thrive without artificial limits. We exist to unlock human potential through clarity, courage, and systematic growth.

Our HOW: We combine CliftonStrengths talent mapping, Golden Circle messaging, and Bain Elements of Value analysis. We guide leaders with wisdom, empathy, and strategic discipline. We challenge the status quo like heroes on a mission — transforming complexity into clarity.

Our WHAT: Growth accelerator assessments, content comparison, framework analysis, and actionable recommendations for B2B and B2C brands.

We serve visionary founders, caring leaders, and analytical strategists who want authentic connection with their audience. We mentor teams, foster belonging, and inspire action.

Keywords throughout our voice: wisdom, guide, transform, breakthrough, community, purpose, innovation, trust, excellence, empower, discover, belonging, strategic, authentic, hero, sage, caregiver, achiever, learner, communication.`,
  extractedKeywords: [
    'growth',
    'barriers',
    'wisdom',
    'strategic',
    'transform',
    'community',
    'purpose',
    'authentic',
    'guide',
    'innovation',
  ],
  headings: {
    h1: ['Remove Growth Barriers'],
    h2: ['Our Purpose', 'How We Help', 'Framework Assessments'],
    h3: ['CliftonStrengths', 'Golden Circle', 'Brand Archetypes'],
  },
  url: 'https://zerobarriers.io',
  seo: {
    metaTitle: 'Zero Barriers — Remove Growth Barriers',
    metaDescription:
      'We help businesses identify and remove growth barriers through proven frameworks.',
    extractedKeywords: ['growth', 'barriers', 'wisdom', 'strategic'],
    headings: {
      h1: ['Remove Growth Barriers'],
      h2: ['Our Purpose', 'How We Help'],
      h3: [],
    },
  },
};

const EXPECTED = {
  'brand-archetypes': { elements: 12, framework: 'brand-archetypes' },
  'clifton-strengths': { elements: 34, framework: 'clifton-strengths' },
};

async function checkOllama() {
  const res = await fetch(`${OLLAMA_URL}/api/tags`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const models = (data.models || []).map((m) => m.name);
  const prefix = OLLAMA_MODEL.split(':')[0];
  const hasModel = models.some(
    (n) => n === OLLAMA_MODEL || n.startsWith(`${prefix}:`)
  );
  if (!hasModel) {
    throw new Error(`Model ${OLLAMA_MODEL} not found. Available: ${models.join(', ')}`);
  }
  return { models, model: OLLAMA_MODEL, baseUrl: OLLAMA_URL };
}

async function checkAppHealth() {
  const res = await fetch(`${BASE}/api/health`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`App health HTTP ${res.status}`);
  return res.json();
}

async function runAssessment(name, endpoint) {
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

  const analysis = body.analysis || {};
  const verification = analysis.verification || {};
  const expected = EXPECTED[name];

  const elementKeys = [];
  const categories = analysis.categories || {};
  for (const cat of Object.values(categories)) {
    const els = cat?.elements || {};
    elementKeys.push(...Object.keys(els));
  }

  const completenessPass = verification.completeness_check === 'pass';
  const allAccounted = verification.all_elements_accounted_for === true;
  const analyzed = verification.total_elements_analyzed ?? elementKeys.length;
  const expectedTotal = verification.total_elements_in_framework ?? expected.elements;

  return {
    name,
    ok:
      completenessPass &&
      allAccounted &&
      analyzed === expectedTotal &&
      !analysis._isFallback,
    elapsedMs,
    elapsedSec: (elapsedMs / 1000).toFixed(1),
    analysisMethod: analysis.analysisMethod,
    overallScore: analysis.overallScore,
    verification,
    elementCount: elementKeys.length,
    blockCount: analysis.blockCount,
    chunksTotal: analysis.chunksTotal,
    hasUnifiedReport: typeof analysis.unifiedReport === 'string' && analysis.unifiedReport.length > 50,
    isFallback: Boolean(analysis._isFallback),
    topStrengths: (analysis.topStrengths || []).slice(0, 3).map((s) => s.element),
  };
}

function formatResult(r) {
  if (!r.ok && r.error) {
    return `  FAIL  ${r.name} (${(r.elapsedMs / 1000).toFixed(1)}s)\n        ${r.error}${r.details ? ` — ${r.details}` : ''}`;
  }
  const status = r.ok ? 'PASS' : 'FAIL';
  return [
    `  ${status}  ${r.name} — ${r.elapsedSec}s`,
    `        method: ${r.analysisMethod}, blocks: ${r.blockCount}, elements: ${r.elementCount}/${r.verification?.total_elements_in_framework}`,
    `        completeness: ${r.verification?.completeness_check}, score: ${typeof r.overallScore === 'number' ? r.overallScore.toFixed(3) : 'n/a'}`,
    `        top strengths: ${(r.topStrengths || []).join(', ') || 'none'}`,
    `        unified report: ${r.hasUnifiedReport ? 'yes' : 'no'}${r.isFallback ? ' [FALLBACK]' : ''}`,
  ].join('\n');
}

async function main() {
  console.log('=== Ollama Framework Assessment Smoke Test ===\n');

  const ollama = await checkOllama();
  console.log(`Ollama: ${ollama.baseUrl} — model ${ollama.model} OK`);

  const health = await checkAppHealth();
  const ollamaSvc = health.services?.ollama;
  console.log(
    `App: ${BASE} — AI ${health.services?.ai} (ollama.available=${ollamaSvc?.available})\n`
  );

  if (!ollamaSvc?.available) {
    console.warn('Warning: /api/health reports Ollama unavailable; tests may use fallbacks.\n');
  }

  const tests = [
    ['brand-archetypes', '/api/analyze/brand-archetypes-standalone'],
    ['clifton-strengths', '/api/analyze/clifton-strengths-standalone'],
  ];

  const results = [];
  for (const [name, endpoint] of tests) {
    console.log(`Running ${name}...`);
    const result = await runAssessment(name, endpoint);
    results.push(result);
    console.log(formatResult(result));
    console.log('');
  }

  const allPass = results.every((r) => r.ok);
  const totalSec = (results.reduce((s, r) => s + r.elapsedMs, 0) / 1000).toFixed(1);
  console.log(`Total wall time: ${totalSec}s`);
  console.log(allPass ? '\nAll assessments passed.' : '\nOne or more assessments failed.');
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error('Test runner failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
