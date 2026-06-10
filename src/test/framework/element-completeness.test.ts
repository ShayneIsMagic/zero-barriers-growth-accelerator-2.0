import { describe, expect, it } from 'vitest';
import {
  B2B_CHUNK_CONFIG,
  B2C_CHUNK_CONFIG,
  BRAND_ARCHETYPES_CHUNK_CONFIG,
  CLIFTON_CHUNK_CONFIG,
  GOLDEN_CIRCLE_CHUNK_CONFIG,
} from '@/lib/framework/chunk-definitions';
import {
  validateAllFrameworks,
  validateFrameworkCompleteness,
} from '@/lib/framework/element-completeness';

describe('Framework element completeness', () => {
  it('validates all frameworks without gaps or duplicates', () => {
    const results = validateAllFrameworks();

    for (const result of results) {
      expect(result.complete, result.frameworkKey).toBe(true);
      expect(result.missingFromChunks, result.frameworkKey).toEqual([]);
      expect(result.extraInChunks, result.frameworkKey).toEqual([]);
      expect(result.duplicateInChunks, result.frameworkKey).toEqual([]);
    }
  });

  it('covers all 30 B2C elements across 4 categories', () => {
    const result = validateFrameworkCompleteness('b2c-elements');

    expect(result.expectedCount).toBe(30);
    expect(result.chunkElementCount).toBe(30);
    expect(result.categoryCount).toBe(4);
    expect(result.categories).toEqual(
      B2C_CHUNK_CONFIG.chunks.map((chunk) => chunk.categoryName)
    );
  });

  it('covers all 40 B2B elements across 5 categories', () => {
    const result = validateFrameworkCompleteness('b2b-elements');

    expect(result.expectedCount).toBe(40);
    expect(result.chunkElementCount).toBe(40);
    expect(result.categoryCount).toBe(5);
    expect(result.categories).toEqual(
      B2B_CHUNK_CONFIG.chunks.map((chunk) => chunk.categoryName)
    );
  });

  it('covers all 34 CliftonStrengths themes across 4 domains', () => {
    const result = validateFrameworkCompleteness('clifton');

    expect(result.expectedCount).toBe(34);
    expect(result.chunkElementCount).toBe(34);
    expect(result.categoryCount).toBe(4);
    expect(result.categories).toEqual(
      CLIFTON_CHUNK_CONFIG.chunks.map((chunk) => chunk.categoryName)
    );
  });

  it('covers all 24 Golden Circle dimensions across WHY/HOW/WHAT/WHO', () => {
    const result = validateFrameworkCompleteness('golden-circle');

    expect(result.expectedCount).toBe(24);
    expect(result.chunkElementCount).toBe(24);
    expect(result.categoryCount).toBe(4);
    expect(result.categories).toEqual(
      GOLDEN_CIRCLE_CHUNK_CONFIG.chunks.map((chunk) => chunk.categoryName)
    );
  });

  it('covers all 12 brand archetypes across 4 motivational groups', () => {
    const result = validateFrameworkCompleteness('brand-archetypes');

    expect(result.expectedCount).toBe(12);
    expect(result.chunkElementCount).toBe(12);
    expect(result.categoryCount).toBe(4);
    expect(result.categories).toEqual(
      BRAND_ARCHETYPES_CHUNK_CONFIG.chunks.map((chunk) => chunk.categoryName)
    );
  });
});
