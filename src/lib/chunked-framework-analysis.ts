/**
 * Chunked Framework Analysis
 *
 * Breaks framework analyses into category-sized chunks so every element
 * gets a thorough evaluation within Claude's token limits.
 *
 * Flow: one API call per category → merge into unified result.
 */

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

interface ChunkedAnalysisOptions {
  frameworkName: string;
  url: string;
  contentText: string;
  contentTitle: string;
  contentMeta: string;
  contentKeywords: string;
  chunks: FrameworkChunk[];
  scoringInstructions?: string;
}

/**
 * Run a framework analysis in category-sized chunks.
 * Each chunk gets its own API call so no elements are skipped.
 */
export async function analyzeFrameworkInChunks(
  options: ChunkedAnalysisOptions
): Promise<Record<string, unknown>> {
  const { analyzeWithAI } = await import('@/lib/free-ai-analysis');

  const contentSummary = buildContentSummary(options);
  const categoryResults: Record<string, ChunkResult> = {};
  const errors: string[] = [];

  for (const chunk of options.chunks) {
    const prompt = buildChunkPrompt(chunk, options, contentSummary);

    try {
      const result = await analyzeWithAI(
        prompt,
        `${options.frameworkName}-${chunk.categoryKey}`
      );
      categoryResults[chunk.categoryKey] = normalizeChunkResult(
        result,
        chunk.elements
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Chunk analysis failed';
      console.error(
        `❌ [${options.frameworkName}] Chunk "${chunk.categoryName}" failed: ${msg}`
      );
      errors.push(`${chunk.categoryName}: ${msg}`);

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
  }

  return mergeResults(options, categoryResults, errors);
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

function buildChunkPrompt(
  chunk: FrameworkChunk,
  options: ChunkedAnalysisOptions,
  contentSummary: string
): string {
  const scoring =
    options.scoringInstructions ||
    `Score each element 0.0-1.0 (flat fractional scoring):
- 0.8-1.0: Excellent — clearly present with strong evidence
- 0.6-0.79: Good — present but could be strengthened
- 0.4-0.59: Needs Work — weak or implicit
- 0.0-0.39: Poor — absent or barely detectable`;

  return `You are analyzing website content using the ${options.frameworkName} framework.
This is the "${chunk.categoryName}" category. Evaluate EVERY element listed below — do not skip any.

WEBSITE CONTENT:
${contentSummary}

CATEGORY: ${chunk.categoryName}
ELEMENTS TO EVALUATE (${chunk.elements.length}):
${chunk.elements.map((el, i) => `${i + 1}. ${el}`).join('\n')}

SCORING:
${scoring}

For EACH element, provide:
- score: number 0.0-1.0
- evidence: specific quote or observation from the content (or "Not found" if absent)
- recommendation: one actionable improvement

Return ONLY valid JSON in this exact format:
{
  "categoryScore": 0.0,
  "elements": {
${chunk.elements.map((el) => `    "${el}": { "score": 0.0, "evidence": "...", "recommendation": "..." }`).join(',\n')}
  }
}

CRITICAL: Evaluate ALL ${chunk.elements.length} elements. Do not skip any. Return ONLY JSON.`;
}

function normalizeChunkResult(
  raw: Record<string, unknown>,
  expectedElements: string[]
): ChunkResult {
  const elements: ChunkResult['elements'] = {};

  const rawElements = (raw.elements || raw) as Record<string, unknown>;

  for (const el of expectedElements) {
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
    typeof raw.categoryScore === 'number'
      ? raw.categoryScore
      : scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

  return { categoryScore, elements };
}

function mergeResults(
  options: ChunkedAnalysisOptions,
  categories: Record<string, ChunkResult>,
  errors: string[]
): Record<string, unknown> {
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

  const topElements = allScores
    .map((_, i) => {
      const entries = Object.entries(categories).flatMap(([, cat]) =>
        Object.entries(cat.elements)
      );
      return entries[i];
    })
    .filter(Boolean)
    .sort(([, a], [, b]) => b.score - a.score);

  const strengths = topElements
    .filter(([, e]) => e.score >= 0.7)
    .slice(0, 5)
    .map(([name, e]) => ({
      element: name,
      score: e.score,
      evidence: e.evidence,
    }));

  const weaknesses = topElements
    .filter(([, e]) => e.score < 0.4)
    .slice(0, 5)
    .map(([name, e]) => ({
      element: name,
      score: e.score,
      recommendation: e.recommendation,
    }));

  return {
    framework: options.frameworkName,
    url: options.url,
    overallScore,
    totalElements: allScores.length,
    categories: categoryBreakdown,
    topStrengths: strengths,
    criticalGaps: weaknesses,
    errors: errors.length > 0 ? errors : undefined,
    analysisMethod: 'chunked',
    chunksCompleted: options.chunks.length - errors.length,
    chunksTotal: options.chunks.length,
  };
}
