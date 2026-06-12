import { describe, expect, it } from 'vitest';

import {
  getElementDefinition,
  getFrameworkVocabularyDocument,
  getVocabularyCategory,
  getVocabularySubcategory,
  listFrameworkVocabularyKeys,
} from '@/lib/framework/get-framework-vocabulary';

describe('framework vocabulary SSOT', () => {
  it('covers all six assessment frameworks', () => {
    const keys = listFrameworkVocabularyKeys();
    expect(keys).toEqual([
      'b2c-elements',
      'b2b-elements',
      'clifton',
      'golden-circle',
      'brand-archetypes',
      'revenue-trends',
    ]);
  });

  it('has zero missing element definitions', () => {
    const doc = getFrameworkVocabularyDocument();
    expect(doc.stats.missingDefinitions).toBe(0);
    expect(doc.stats.totalNodes).toBeGreaterThan(150);
  });

  it('returns archived B2B element definition by slug', () => {
    const definition = getElementDefinition('b2b-elements', 'vision');
    expect(definition).toContain('anticipate');
  });

  it('returns B2B subcategory definition for Purpose', () => {
    const purpose = getVocabularySubcategory(
      'b2b-elements',
      'inspirational',
      'purpose'
    );
    expect(purpose?.definition).toContain('organizational purpose');
  });

  it('returns Golden Circle category definition from archived Sinek quote', () => {
    const why = getVocabularyCategory('golden-circle', 'why');
    expect(why?.definitionSource).toBe('archived');
    expect(why?.definition).toContain('WHY');
  });
});
