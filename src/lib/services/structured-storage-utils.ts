/**
 * Pure helpers for flattening nested B2B category payloads into storable element rows.
 */

export interface FlatElementDetail {
  name: string;
  present: boolean;
  confidence: number | null;
  evidence: unknown[];
  revenueOpportunity: string | null;
  recommendations: unknown[];
}

export function flattenCategoryElementMap(
  categoryInfo: Record<string, unknown>
): Record<string, Record<string, unknown>> {
  const subcategories = categoryInfo.subcategories;
  if (
    subcategories &&
    typeof subcategories === 'object' &&
    !Array.isArray(subcategories)
  ) {
    const flattened: Record<string, Record<string, unknown>> = {};
    for (const subRaw of Object.values(
      subcategories as Record<string, Record<string, unknown>>
    )) {
      const subElements = subRaw?.elements;
      if (!subElements || typeof subElements !== 'object' || Array.isArray(subElements)) {
        continue;
      }
      for (const [slug, detail] of Object.entries(
        subElements as Record<string, Record<string, unknown>>
      )) {
        flattened[slug] = detail;
      }
    }
    return flattened;
  }

  const elements = categoryInfo.elements;
  if (elements && typeof elements === 'object' && !Array.isArray(elements)) {
    return elements as Record<string, Record<string, unknown>>;
  }

  return {};
}

export function mapFlatElementsForStorage(
  elementMap: Record<string, Record<string, unknown>>
): FlatElementDetail[] {
  return Object.entries(elementMap).map(([name, detail]) => ({
    name,
    present: typeof detail.score === 'number' ? detail.score >= 0.6 : false,
    confidence: typeof detail.score === 'number' ? detail.score : null,
    evidence: Array.isArray(detail.evidence) ? detail.evidence : [],
    revenueOpportunity:
      typeof detail.revenue_opportunity === 'string'
        ? detail.revenue_opportunity
        : null,
    recommendations: Array.isArray(detail.recommendations)
      ? detail.recommendations
      : [],
  }));
}

export function countPresentFromElementMap(
  elementMap: Record<string, Record<string, unknown>>
): { presentElements: number; totalElements: number; fraction: string } {
  const entries = Object.values(elementMap);
  const presentCount = entries.filter(
    (detail) => typeof detail.score === 'number' && detail.score >= 0.6
  ).length;
  const total = entries.length;
  return {
    presentElements: presentCount,
    totalElements: total,
    fraction: `${presentCount}/${total}`,
  };
}
