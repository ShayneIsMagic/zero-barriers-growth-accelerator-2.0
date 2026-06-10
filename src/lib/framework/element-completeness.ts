/**
 * Validates that chunked analysis covers every required element/category.
 */

import {
  B2B_ELEMENTS,
  B2C_ELEMENTS,
  CLIFTON_STRENGTHS_ELEMENTS,
} from '@/lib/elements/element-definitions';
import {
  FRAMEWORK_CHUNK_CONFIGS,
  type FrameworkChunkConfig,
} from '@/lib/framework/chunk-definitions';
import { extractElementNames } from '@/lib/framework/element-extraction';

export interface ElementCompletenessResult {
  frameworkKey: string;
  frameworkName: string;
  expectedCount: number;
  chunkElementCount: number;
  categoryCount: number;
  categories: string[];
  complete: boolean;
  missingFromChunks: string[];
  extraInChunks: string[];
  duplicateInChunks: string[];
  mismatchedDefinitions: string[];
}

function findDuplicates(elements: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const element of elements) {
    if (seen.has(element)) {
      duplicates.add(element);
    }
    seen.add(element);
  }
  return [...duplicates];
}

function flattenChunkElements(config: FrameworkChunkConfig): string[] {
  return config.chunks.flatMap((chunk) => chunk.elements);
}

function validateAgainstDefinitions(
  config: FrameworkChunkConfig,
  definitionElements: string[]
): { missingFromChunks: string[]; extraInChunks: string[] } {
  const chunkSet = new Set(flattenChunkElements(config));
  const definitionSet = new Set(definitionElements);

  const missingFromChunks = definitionElements.filter((el) => !chunkSet.has(el));
  const extraInChunks = [...chunkSet].filter((el) => !definitionSet.has(el));

  return { missingFromChunks, extraInChunks };
}

export function validateFrameworkCompleteness(
  frameworkKey: string
): ElementCompletenessResult {
  const config = FRAMEWORK_CHUNK_CONFIGS[frameworkKey];
  if (!config) {
    throw new Error(`Unknown framework key: ${frameworkKey}`);
  }

  const flatElements = flattenChunkElements(config);
  const duplicates = findDuplicates(flatElements);
  const categories = config.chunks.map((chunk) => chunk.categoryName);

  let missingFromChunks: string[] = [];
  let extraInChunks: string[] = [];
  let mismatchedDefinitions: string[] = [];

  if (frameworkKey === 'b2c-elements') {
    const result = validateAgainstDefinitions(
      config,
      extractElementNames(B2C_ELEMENTS)
    );
    missingFromChunks = result.missingFromChunks;
    extraInChunks = result.extraInChunks;
  } else if (frameworkKey === 'b2b-elements') {
    const result = validateAgainstDefinitions(
      config,
      extractElementNames(B2B_ELEMENTS)
    );
    missingFromChunks = result.missingFromChunks;
    extraInChunks = result.extraInChunks;
  } else if (frameworkKey === 'clifton') {
    const result = validateAgainstDefinitions(
      config,
      extractElementNames(CLIFTON_STRENGTHS_ELEMENTS)
    );
    missingFromChunks = result.missingFromChunks;
    extraInChunks = result.extraInChunks;
  } else if (frameworkKey === 'golden-circle') {
    // Golden Circle chunked analysis uses 24 dimensions, not the 3 core elements.
    mismatchedDefinitions = [];
  } else if (frameworkKey === 'brand-archetypes') {
    // Brand archetypes use Jambojon JSON hints — no element-definitions.ts manifest.
    mismatchedDefinitions = [];
  }

  const allowCrossCategoryDuplicates = frameworkKey === 'golden-circle';
  const hasInvalidDuplicates =
    !allowCrossCategoryDuplicates && duplicates.length > 0;

  const complete =
    flatElements.length === config.expectedElementCount &&
    !hasInvalidDuplicates &&
    missingFromChunks.length === 0 &&
    extraInChunks.length === 0;

  return {
    frameworkKey,
    frameworkName: config.frameworkName,
    expectedCount: config.expectedElementCount,
    chunkElementCount: flatElements.length,
    categoryCount: config.chunks.length,
    categories,
    complete,
    missingFromChunks,
    extraInChunks,
    duplicateInChunks: allowCrossCategoryDuplicates ? [] : duplicates,
    mismatchedDefinitions,
  };
}

export function validateAllFrameworks(): ElementCompletenessResult[] {
  return Object.keys(FRAMEWORK_CHUNK_CONFIGS).map(validateFrameworkCompleteness);
}
