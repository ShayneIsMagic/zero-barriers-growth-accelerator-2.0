/**
 * Chunked Framework Analysis
 *
 * Breaks framework analyses into 1-2 category blocks so every element
 * gets a thorough evaluation within Ollama-friendly prompt budgets.
 *
 * Flow: one API call per block -> merge chunked result -> Ollama unified synthesis.
 */

import { readFile } from 'fs/promises';
import path from 'path';

function sanitizeError(msg: string): string {
  return msg
    .replace(/AIza[A-Za-z0-9_-]{30,}/g, '[REDACTED_KEY]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/api_key:[A-Za-z0-9_-]{20,}/g, 'api_key:[REDACTED_KEY]')
    .replace(/key=[A-Za-z0-9_-]{20,}/g, 'key=[REDACTED_KEY]');
}

export interface FrameworkChunk {
  categoryName: string;
  categoryKey: string;
  elements: string[];
}

export interface ChunkResult {
  categoryScore: number;
  elements: Record<
    string,
    { score: number; evidence: string; recommendation: string }
  >;
}

export interface ChunkProgressEvent {
  type: 'progress';
  chunkIndex: number;
  chunksTotal: number;
  categoryName: string;
  categoryKey: string;
  status: 'started' | 'completed' | 'error';
  percent: number;
  error?: string;
}

export interface ChunkedAnalysisOptions {
  frameworkName: string;
  url: string;
  contentText: string;
  contentTitle: string;
  contentMeta: string;
  contentKeywords: string;
  chunks: FrameworkChunk[];
  scoringInstructions?: string;
  categoriesPerBlock?: 1 | 2;
  frameworkMarkdownPath?: string;
  onProgress?: (event: ChunkProgressEvent) => void;
}

interface BlockResult {
  categories: Record<string, ChunkResult>;
}

interface ChunkedAnalysisMergedResult extends Record<string, unknown> {
  framework: string;
  url: string;
  overallScore: number;
  totalElements: number;
  categories: Record<string, unknown>;
  topStrengths: Array<Record<string, unknown>>;
  criticalGaps: Array<Record<string, unknown>>;
  errors?: string[];
  analysisMethod: string;
  chunksCompleted: number;
  chunksTotal: number;
  blockCount: number;
  verification: Record<string, unknown>;
  chunkedReport: string;
}

/**
 * Run a framework analysis in 1-2 category blocks.
 * Each block gets its own API call so no elements are skipped.
 */
export async function analyzeFrameworkInChunks(
  options: ChunkedAnalysisOptions
): Promise<Record<string, unknown>> {
  const { analyzeWithAI } = await import('@/lib/free-ai-analysis');

  const contentSummary = buildContentSummary(options);
  const frameworkMarkdown = await loadFrameworkMarkdown(options);
  const categoryResults: Record<string, ChunkResult> = {};
  const errors: string[] = [];
  const blockSize = chooseCategoriesPerBlock(options);
  const blocks = toBlocks(options.chunks, blockSize);

  const totalBlocks = blocks.length;

  for (let i = 0; i < totalBlocks; i++) {
    const block = blocks[i];
    const prompt = buildBlockPrompt(block, options, contentSummary, frameworkMarkdown);
    const categoryName = block.map((chunk) => chunk.categoryName).join(' + ');
    const categoryKey = block.map((chunk) => chunk.categoryKey).join('_');

    options.onProgress?.({
      type: 'progress',
      chunkIndex: i,
      chunksTotal: totalBlocks,
      categoryName,
      categoryKey,
      status: 'started',
      percent: Math.round((i / totalBlocks) * 100),
    });

    try {
      const result = await analyzeWithAI(
        prompt,
        `${options.frameworkName}-block-${i + 1}`
      );
      const normalizedBlock = normalizeBlockResult(
        result,
        block
      );
      Object.assign(categoryResults, normalizedBlock.categories);

      options.onProgress?.({
        type: 'progress',
        chunkIndex: i,
        chunksTotal: totalBlocks,
        categoryName,
        categoryKey,
        status: 'completed',
        percent: Math.round(((i + 1) / totalBlocks) * 100),
      });
    } catch (error) {
      const msg = sanitizeError(
        error instanceof Error ? error.message : 'Chunk analysis failed'
      );
      console.error(
        `❌ [${options.frameworkName}] Block "${categoryName}" failed: ${msg}`
      );
      errors.push(`${categoryName}: ${msg}`);

      for (const chunk of block) {
        categoryResults[chunk.categoryKey] = {
          categoryScore: 0,
          elements: Object.fromEntries(
            chunk.elements.map((el) => [
              el,
              { score: 0, evidence: 'Analysis failed', recommendation: msg },
            ])
          ),
        };
      }

      options.onProgress?.({
        type: 'progress',
        chunkIndex: i,
        chunksTotal: totalBlocks,
        categoryName,
        categoryKey,
        status: 'error',
        percent: Math.round(((i + 1) / totalBlocks) * 100),
        error: msg,
      });
    }
  }

  const merged = mergeResults(options, categoryResults, errors, totalBlocks);
  const unifiedReport = await buildUnifiedReportWithOllama(options, merged, analyzeWithAI);
  return {
    ...merged,
    unifiedReport,
  };
}

function buildContentSummary(options: ChunkedAnalysisOptions): string {
  const truncatedContent = (options.contentText || '').substring(0, 1500);
  return [
    `URL: ${options.url}`,
    `Title: ${options.contentTitle || 'Untitled'}`,
    `Meta Description: ${options.contentMeta || 'None'}`,
    `Keywords: ${options.contentKeywords || 'None'}`,
    `Content (first 1500 chars):\n${truncatedContent}`,
  ].join('\n');
}

function buildBlockPrompt(
  block: FrameworkChunk[],
  options: ChunkedAnalysisOptions,
  contentSummary: string,
  frameworkMarkdown: string
): string {
  const scoring =
    options.scoringInstructions ||
    `Score each element 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — clearly present with strong evidence
- 0.6-0.79: Good — present but could be strengthened
- 0.4-0.59: Needs Work — weak or implicit
- 0.0-0.39: Poor — absent or barely detectable`;

  const categoriesInstruction = block
    .map(
      (chunk) =>
        `- ${chunk.categoryName} (${chunk.categoryKey}): ${chunk.elements.join(', ')}`
    )
    .join('\n');

  const categoriesSchema = block
    .map(
      (chunk) => `    "${chunk.categoryKey}": {
      "categoryScore": 0.0,
      "elements": {
${chunk.elements
  .map(
    (el) =>
      `        "${el}": { "score": 0.0, "evidence": "...", "recommendation": "..." }`
  )
  .join(',\n')}
      }
    }`
    )
    .join(',\n');

  return `You are analyzing website content using the ${options.frameworkName} framework.
Evaluate EVERY element listed below. Do not skip any element.

FRAMEWORK MARKDOWN (SOURCE OF TRUTH):
${frameworkMarkdown || 'Framework markdown was not found on disk; use the provided category and element list exactly.'}

WEBSITE CONTENT:
${contentSummary}

CATEGORIES IN THIS BLOCK:
${categoriesInstruction}

SCORING:
${scoring}

For EACH element, provide:
- score: number 0.0-1.0
- evidence: specific quote or observation from content (or "Not found")
- recommendation: one actionable improvement

Return ONLY valid JSON in this exact format:
{
  "categories": {
${categoriesSchema}
  }
}

CRITICAL:
- Evaluate all listed categories and elements.
- Return JSON only.`;
}

function normalizeBlockResult(
  raw: Record<string, unknown>,
  expectedChunks: FrameworkChunk[]
): BlockResult {
  const normalized: BlockResult = {
    categories: {},
  };

  const topLevel = raw as Record<string, unknown>;
  const rawCategories =
    (topLevel.categories as Record<string, unknown> | undefined) || topLevel;

  for (const chunk of expectedChunks) {
    const categoryRaw = (rawCategories[chunk.categoryKey] || {}) as Record<
      string,
      unknown
    >;
    const rawElements = (categoryRaw.elements ||
      categoryRaw) as Record<string, unknown>;

    const elements: ChunkResult['elements'] = {};
    for (const el of chunk.elements) {
      const found = rawElements[el] as
        | { score?: number; evidence?: string; recommendation?: string }
        | undefined;
      elements[el] = {
        score: typeof found?.score === 'number' ? found.score : 0,
        evidence:
          typeof found?.evidence === 'string' ? found.evidence : 'Not evaluated',
        recommendation:
          typeof found?.recommendation === 'string'
            ? found.recommendation
            : 'No recommendation',
      };
    }

    const scores = Object.values(elements).map((e) => e.score);
    const categoryScore =
      typeof categoryRaw.categoryScore === 'number'
        ? categoryRaw.categoryScore
        : scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

    normalized.categories[chunk.categoryKey] = {
      categoryScore,
      elements,
    };
  }

  return normalized;
}

function mergeResults(
  options: ChunkedAnalysisOptions,
  categories: Record<string, ChunkResult>,
  errors: string[],
  blockCount: number
): ChunkedAnalysisMergedResult {
  const allScores: number[] = [];

  const categoryBreakdown: Record<string, unknown> = {};
  for (const chunk of options.chunks) {
    const cat = categories[chunk.categoryKey];
    categoryBreakdown[chunk.categoryKey] = {
      categoryName: chunk.categoryName,
      categoryScore: parseFloat(cat.categoryScore.toFixed(3)),
      elementCount: chunk.elements.length,
      elements: cat.elements,
    };
    allScores.push(
      ...Object.values(cat.elements).map((e) => e.score)
    );
  }

  const overallScore =
    allScores.length > 0
      ? parseFloat(
          (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(3)
        )
      : 0;

  const entries = Object.entries(categories).flatMap(([categoryKey, cat]) =>
    Object.entries(cat.elements).map(([name, detail]) => ({
      categoryKey,
      name,
      detail,
    }))
  );

  const topElements = [...entries].sort((a, b) => b.detail.score - a.detail.score);

  const strengths = topElements
    .filter((entry) => entry.detail.score >= 0.7)
    .slice(0, 5)
    .map((entry) => ({
      element: entry.name,
      category: entry.categoryKey,
      score: entry.detail.score,
      evidence: entry.detail.evidence,
    }));

  const weaknesses = topElements
    .filter((entry) => entry.detail.score < 0.4)
    .slice(0, 5)
    .map((entry) => ({
      element: entry.name,
      category: entry.categoryKey,
      score: entry.detail.score,
      recommendation: entry.detail.recommendation,
    }));

  const expectedTotal = options.chunks.reduce(
    (sum, chunk) => sum + chunk.elements.length,
    0
  );
  const analyzedTotal = entries.length;
  const present = entries.filter((entry) => entry.detail.score >= 0.6).length;
  const partial = entries.filter(
    (entry) => entry.detail.score > 0 && entry.detail.score < 0.6
  ).length;
  const missing = analyzedTotal - present - partial;
  const allElementsAccountedFor = analyzedTotal === expectedTotal;
  const completenessCheck = allElementsAccountedFor ? 'pass' : 'fail';

  const chunkedReport = buildChunkedMarkdownReport(
    options,
    overallScore,
    categoryBreakdown,
    strengths,
    weaknesses,
    {
      total: expectedTotal,
      analyzed: analyzedTotal,
      present,
      missing,
      partial,
      complete: allElementsAccountedFor,
    }
  );

  return {
    framework: options.frameworkName,
    url: options.url,
    overallScore,
    totalElements: allScores.length,
    categories: categoryBreakdown,
    topStrengths: strengths,
    criticalGaps: weaknesses,
    errors: errors.length > 0 ? errors : undefined,
    analysisMethod: 'chunked-blocked',
    chunksCompleted: options.chunks.length - errors.length,
    chunksTotal: options.chunks.length,
    blockCount,
    verification: {
      total_elements_in_framework: expectedTotal,
      total_elements_analyzed: analyzedTotal,
      completeness_check: completenessCheck,
      all_elements_accounted_for: allElementsAccountedFor,
      breakdown: {
        present,
        missing,
        partial,
        total: analyzedTotal,
      },
    },
    chunkedReport,
  };
}

function toBlocks(chunks: FrameworkChunk[], size: 1 | 2): FrameworkChunk[][] {
  const blocks: FrameworkChunk[][] = [];
  for (let i = 0; i < chunks.length; i += size) {
    blocks.push(chunks.slice(i, i + size));
  }
  return blocks;
}

function chooseCategoriesPerBlock(options: ChunkedAnalysisOptions): 1 | 2 {
  if (options.categoriesPerBlock) return options.categoriesPerBlock;

  const totalElements = options.chunks.reduce(
    (sum, chunk) => sum + chunk.elements.length,
    0
  );
  const isLongContent = (options.contentText || '').length > 7000;
  if (isLongContent || totalElements > 34) {
    return 1;
  }
  return 2;
}

async function loadFrameworkMarkdown(
  options: ChunkedAnalysisOptions
): Promise<string> {
  try {
    const explicitPath = options.frameworkMarkdownPath;
    const autoPath = inferFrameworkMarkdownPath(options.frameworkName);
    const targetPath = explicitPath || autoPath;
    if (!targetPath) return '';
    const markdown = await readFile(targetPath, 'utf-8');
    return markdown.slice(0, 12000);
  } catch {
    return '';
  }
}

function inferFrameworkMarkdownPath(frameworkName: string): string | null {
  const docsDir = path.join(process.cwd(), 'docs', 'frameworks');
  const key = frameworkName.toLowerCase();

  if (key.includes('b2c')) {
    return path.join(docsDir, 'B2C-Elements-Value-Flat-Scoring.md');
  }
  if (key.includes('b2b')) {
    return path.join(docsDir, 'B2B-Elements-Value-Flat-Scoring.md');
  }
  if (key.includes('clifton')) {
    return path.join(docsDir, 'CliftonStrengths-Flat-Scoring.md');
  }
  if (key.includes('golden')) {
    return path.join(docsDir, 'Golden-Circle-Flat-Scoring.md');
  }
  if (key.includes('archetype') || key.includes('jambojon')) {
    return path.join(docsDir, 'Brand-Archetypes-Flat-Scoring.md');
  }

  return null;
}

function buildChunkedMarkdownReport(
  options: ChunkedAnalysisOptions,
  overallScore: number,
  categoryBreakdown: Record<string, unknown>,
  strengths: Array<Record<string, unknown>>,
  weaknesses: Array<Record<string, unknown>>,
  counts: {
    total: number;
    analyzed: number;
    present: number;
    missing: number;
    partial: number;
    complete: boolean;
  }
): string {
  const categories = Object.values(categoryBreakdown) as Array<{
    categoryName: string;
    categoryScore: number;
    elementCount: number;
  }>;

  const categoryLines = categories
    .map(
      (category) =>
        `- ${category.categoryName}: ${category.categoryScore.toFixed(3)} (${category.elementCount} elements)`
    )
    .join('\n');

  const strengthsLines = strengths
    .map(
      (item) =>
        `- ${String(item.element)} (${String(item.category)}): ${Number(item.score).toFixed(3)}`
    )
    .join('\n');

  const weaknessLines = weaknesses
    .map(
      (item) =>
        `- ${String(item.element)} (${String(item.category)}): ${Number(item.score).toFixed(3)} -> ${String(item.recommendation)}`
    )
    .join('\n');

  return `# ${options.frameworkName} Chunked Report

## Overall
- URL: ${options.url}
- Overall Score: ${overallScore.toFixed(3)}
- Elements Analyzed: ${counts.analyzed}/${counts.total}
- Completeness: ${counts.complete ? 'pass' : 'fail'}

## Category Scores
${categoryLines || '- No categories analyzed'}

## Top Strengths
${strengthsLines || '- No high-scoring strengths found'}

## Critical Gaps
${weaknessLines || '- No critical gaps found'}

## Coverage Breakdown
- Present (>=0.6): ${counts.present}
- Partial (>0 and <0.6): ${counts.partial}
- Missing (0): ${counts.missing}
`;
}

async function buildUnifiedReportWithOllama(
  options: ChunkedAnalysisOptions,
  merged: ChunkedAnalysisMergedResult,
  analyzeWithAI: (
    prompt: string,
    analysisType: string
  ) => Promise<Record<string, unknown>>
): Promise<string> {
  const categories = Object.values(merged.categories) as Array<{
    categoryName: string;
    categoryScore: number;
    elements: Record<
      string,
      { score: number; evidence: string; recommendation: string }
    >;
  }>;

  const categorySnapshot = categories
    .map((category) => {
      const topElements = Object.entries(category.elements)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 3)
        .map(
          ([name, detail]) =>
            `${name}: ${detail.score.toFixed(2)} (${detail.evidence.slice(0, 120)})`
        )
        .join('; ');
      return `${category.categoryName} (${category.categoryScore.toFixed(3)}): ${topElements}`;
    })
    .join('\n');

  const finalJsonForPrompt = JSON.stringify(
    {
      framework: merged.framework,
      url: merged.url,
      overallScore: merged.overallScore,
      totalElements: merged.totalElements,
      categories: merged.categories,
      topStrengths: merged.topStrengths,
      criticalGaps: merged.criticalGaps,
      verification: merged.verification,
    },
    null,
    2
  );

  const prompt = `You are a senior strategy analyst.
Convert the FINAL JSON analysis into a readable markdown report.

Framework: ${options.frameworkName}
URL: ${options.url}
Overall Score: ${merged.overallScore}

Chunk Snapshot:
${categorySnapshot}

Top Strengths:
${JSON.stringify(merged.topStrengths)}

Critical Gaps:
${JSON.stringify(merged.criticalGaps)}

Verification:
${JSON.stringify(merged.verification)}

FINAL JSON:
${finalJsonForPrompt}

Return a concise MARKDOWN report with sections:
1) Executive Summary
2) What Is Working
3) What Needs Improvement
4) Prioritized Action Plan (5-7 bullets)
5) Risk Notes

Rules:
- Use only provided chunk data.
- Do not fabricate evidence.
- Keep recommendations specific and implementation-oriented.`;

  try {
    const aiResult = await analyzeWithAI(
      prompt,
      `${options.frameworkName}-unified-report`
    );

    if (typeof aiResult === 'string') return aiResult;
    if (typeof aiResult.analysis === 'string') return aiResult.analysis;
    if (typeof aiResult.raw === 'string') return aiResult.raw;
    return JSON.stringify(aiResult, null, 2);
  } catch (error) {
    const errorText =
      error instanceof Error ? sanitizeError(error.message) : 'Unknown error';
    return `# Unified Report (Fallback)

Ollama synthesis failed: ${errorText}

Use the chunked report for detailed category and element-level findings.`;
  }
}
