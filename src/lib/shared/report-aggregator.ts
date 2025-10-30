export interface ComprehensiveReport {
  id: string; // matches ScrapeBundle id
  url: string;
  createdAtIso: string;
  sources: Array<{
    assessmentType: string;
    createdAtIso: string;
  }>;
  results: Record<string, unknown>;
}

export function buildComprehensiveReport(
  id: string,
  url: string,
  frameworkEntries: Array<{ assessmentType: string; createdAtIso: string; data: unknown }>
): ComprehensiveReport {
  const results: Record<string, unknown> = {};
  const sources = frameworkEntries.map((e) => ({ assessmentType: e.assessmentType, createdAtIso: e.createdAtIso }));
  for (const entry of frameworkEntries) {
    results[entry.assessmentType] = entry.data;
  }
  return {
    id,
    url,
    createdAtIso: new Date().toISOString(),
    sources,
    results,
  };
}


