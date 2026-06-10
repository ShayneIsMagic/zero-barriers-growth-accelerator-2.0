/**
 * Supplementary keyword recognition hints for chunked framework prompts.
 * Sourced from element-definitions.ts and framework reference JSON — scoring remains flat-scoring markdown only.
 */

import {
  B2B_ELEMENTS,
  B2C_ELEMENTS,
  CLIFTON_STRENGTHS_ELEMENTS,
  type ElementDefinition,
} from '@/lib/elements/element-definitions';
import {
  GOLDEN_CIRCLE_DIMENSION_HINTS,
  REVENUE_TRENDS_ELEMENT_HINTS,
  type SupplementaryElementHint,
} from '@/lib/elements/supplementary-element-hints';
import jambojonArchetypesFramework from '@/lib/ai-engines/framework-knowledge/jambojon-archetypes-framework.json';
import type { FrameworkChunk } from '@/lib/chunked-framework-analysis';

export interface ElementKeywordHint {
  slug: string;
  keywords: string[];
  description: string;
}

interface FrameworkDefinitionShape {
  categories: Record<
    string,
    {
      subcategories: Array<{
        elements: ElementDefinition[];
      }>;
    }
  >;
}

/** Route slugs that differ from element-definitions names */
const SLUG_ALIASES: Record<string, string> = {
  affiliation_belonging: 'affiliation',
};

const ARCHETYPE_NAME_TO_SLUG: Record<string, string> = {
  'The Sage': 'sage',
  'The Explorer': 'explorer',
  'The Hero': 'hero',
  'The Outlaw': 'outlaw',
  'The Magician': 'magician',
  'The Regular Guy/Girl': 'regular_guy_girl',
  'The Jester': 'jester',
  'The Caregiver': 'caregiver',
  'The Creator': 'creator',
  'The Innocent': 'innocent',
  'The Lover': 'lover',
  'The Ruler': 'ruler',
};

function flattenElementHints(
  definition: FrameworkDefinitionShape
): Map<string, ElementKeywordHint> {
  const map = new Map<string, ElementKeywordHint>();
  for (const category of Object.values(definition.categories)) {
    for (const subcategory of category.subcategories) {
      for (const element of subcategory.elements) {
        map.set(element.name, {
          slug: element.name,
          keywords: element.keywords,
          description: element.description,
        });
      }
    }
  }
  return map;
}

function buildSupplementaryLookup(
  hints: Record<string, SupplementaryElementHint>
): Map<string, ElementKeywordHint> {
  const map = new Map<string, ElementKeywordHint>();
  for (const [key, hint] of Object.entries(hints)) {
    map.set(key, {
      slug: key,
      keywords: hint.keywords,
      description: hint.description,
    });
  }
  return map;
}

function buildArchetypeHintLookup(): Map<string, ElementKeywordHint> {
  const map = new Map<string, ElementKeywordHint>();
  const archetypes = jambojonArchetypesFramework.structure.archetypes as Array<{
    name: string;
    definition: string;
    keyword_signals: string[];
  }>;

  for (const archetype of archetypes) {
    const slug = ARCHETYPE_NAME_TO_SLUG[archetype.name];
    if (!slug) continue;
    map.set(slug, {
      slug,
      keywords: archetype.keyword_signals,
      description: archetype.definition,
    });
  }
  return map;
}

const FRAMEWORK_HINT_LOOKUPS: Record<string, Map<string, ElementKeywordHint>> = {
  b2c: flattenElementHints(B2C_ELEMENTS),
  b2b: flattenElementHints(B2B_ELEMENTS),
  clifton: flattenElementHints(CLIFTON_STRENGTHS_ELEMENTS),
  'golden-circle': buildSupplementaryLookup(GOLDEN_CIRCLE_DIMENSION_HINTS),
  'brand-archetypes': buildArchetypeHintLookup(),
  'revenue-trends': buildSupplementaryLookup(REVENUE_TRENDS_ELEMENT_HINTS),
};

export function inferFrameworkHintKey(frameworkName: string): string | null {
  const key = frameworkName.toLowerCase();
  if (key.includes('b2c')) return 'b2c';
  if (key.includes('b2b')) return 'b2b';
  if (key.includes('clifton')) return 'clifton';
  if (key.includes('golden')) return 'golden-circle';
  if (key.includes('archetype') || key.includes('jambojon')) return 'brand-archetypes';
  if (key.includes('revenue')) return 'revenue-trends';
  return null;
}

export function resolveElementHint(
  slug: string,
  lookup: Map<string, ElementKeywordHint>,
  categoryKey?: string
): ElementKeywordHint | undefined {
  if (categoryKey) {
    const qualified = lookup.get(`${categoryKey}:${slug}`);
    if (qualified) return qualified;
  }

  const direct = lookup.get(slug);
  if (direct) return direct;

  const alias = SLUG_ALIASES[slug];
  if (!alias) return undefined;

  if (categoryKey) {
    const qualifiedAlias = lookup.get(`${categoryKey}:${alias}`);
    if (qualifiedAlias) return qualifiedAlias;
  }
  return lookup.get(alias);
}

export function collectHintsForBlock(
  block: FrameworkChunk[],
  lookup: Map<string, ElementKeywordHint>
): ElementKeywordHint[] {
  const hints: ElementKeywordHint[] = [];
  const seen = new Set<string>();

  for (const chunk of block) {
    for (const slug of chunk.elements) {
      const hint = resolveElementHint(slug, lookup, chunk.categoryKey);
      if (!hint || seen.has(hint.slug)) continue;
      seen.add(hint.slug);
      hints.push(hint);
    }
  }

  return hints;
}

/** @deprecated Use collectHintsForBlock — kept for tests */
export function collectHintsForElements(
  elements: string[],
  lookup: Map<string, ElementKeywordHint>
): ElementKeywordHint[] {
  const hints: ElementKeywordHint[] = [];
  const seen = new Set<string>();
  for (const slug of elements) {
    const hint = resolveElementHint(slug, lookup);
    if (!hint || seen.has(hint.slug)) continue;
    seen.add(hint.slug);
    hints.push(hint);
  }
  return hints;
}

export function formatKeywordHintsSection(
  block: FrameworkChunk[],
  frameworkName: string
): string {
  const frameworkKey = inferFrameworkHintKey(frameworkName);
  if (!frameworkKey) return '';

  const lookup = FRAMEWORK_HINT_LOOKUPS[frameworkKey];
  const hints = collectHintsForBlock(block, lookup);
  if (hints.length === 0) return '';

  const lines = hints.map((hint) => {
    const keywords = hint.keywords.join(', ');
    return `- **${hint.slug}**: look for [${keywords}] — ${hint.description}`;
  });

  return [
    'RECOGNITION HINTS (supplementary keyword cues for website brand signals — do NOT change scoring rules above):',
    ...lines,
  ].join('\n');
}
