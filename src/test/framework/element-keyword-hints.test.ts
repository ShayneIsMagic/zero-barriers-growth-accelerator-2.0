import { describe, expect, it } from 'vitest';
import type { FrameworkChunk } from '@/lib/chunked-framework-analysis';
import {
  formatKeywordHintsSection,
  inferFrameworkHintKey,
} from '@/lib/framework/element-keyword-hints';
import { CLIFTON_CHUNK_CONFIG, GOLDEN_CIRCLE_CHUNK_CONFIG } from '@/lib/framework/chunk-definitions';

describe('element keyword hints', () => {
  it('resolves framework keys from framework names', () => {
    expect(inferFrameworkHintKey('CliftonStrengths')).toBe('clifton');
    expect(inferFrameworkHintKey('B2C Elements of Value')).toBe('b2c');
    expect(inferFrameworkHintKey('B2B Elements of Value')).toBe('b2b');
    expect(inferFrameworkHintKey('Golden Circle (Simon Sinek)')).toBe('golden-circle');
    expect(inferFrameworkHintKey('Jambojon Brand Archetypes')).toBe('brand-archetypes');
    expect(inferFrameworkHintKey('Revenue Trends')).toBe('revenue-trends');
  });

  it('resolves slug aliases for route drift', () => {
    const block: FrameworkChunk[] = [
      {
        categoryName: 'Life-Changing',
        categoryKey: 'life_changing',
        elements: ['affiliation_belonging'],
      },
    ];
    const section = formatKeywordHintsSection(block, 'B2C Elements of Value');
    expect(section).toContain('**affiliation**');
    expect(section).toContain('belonging');
  });

  it('formats Clifton block hints for every theme in a domain chunk', () => {
    const block: FrameworkChunk[] = [CLIFTON_CHUNK_CONFIG.chunks[0]];
    const section = formatKeywordHintsSection(block, 'CliftonStrengths');

    expect(section).toContain('RECOGNITION HINTS');
    expect(section).toContain('**analytical**');
    expect(section).toContain('analyze');
    expect(section).toContain('**strategic**');
    expect(section).toContain('do NOT change scoring');
  });

  it('formats Golden Circle hints with qualified dimension keys', () => {
    const block: FrameworkChunk[] = [GOLDEN_CIRCLE_CHUNK_CONFIG.chunks[0]];
    const section = formatKeywordHintsSection(block, 'Golden Circle (Simon Sinek)');

    expect(section).toContain('**why:clarity**');
    expect(section).toContain('**why:emotional_resonance**');
    expect(section).not.toMatch(/\*\*clarity\*\*/);
  });

  it('distinguishes clarity across WHY and HOW blocks', () => {
    const whyBlock: FrameworkChunk[] = [GOLDEN_CIRCLE_CHUNK_CONFIG.chunks[0]];
    const howBlock: FrameworkChunk[] = [GOLDEN_CIRCLE_CHUNK_CONFIG.chunks[1]];

    const whySection = formatKeywordHintsSection(whyBlock, 'Golden Circle (Simon Sinek)');
    const howSection = formatKeywordHintsSection(howBlock, 'Golden Circle (Simon Sinek)');

    expect(whySection).toContain('**why:clarity**');
    expect(howSection).toContain('**how:clarity**');
    expect(whySection).not.toContain('**how:clarity**');
  });

  it('formats all 12 brand archetype hints from framework JSON', () => {
    const block: FrameworkChunk[] = [
      {
        categoryName: 'Ego Archetypes',
        categoryKey: 'ego',
        elements: ['hero', 'magician', 'outlaw'],
      },
      {
        categoryName: 'Freedom Archetypes',
        categoryKey: 'freedom',
        elements: ['innocent', 'explorer', 'sage'],
      },
      {
        categoryName: 'Social Archetypes',
        categoryKey: 'social',
        elements: ['regular_guy_girl', 'jester', 'lover'],
      },
      {
        categoryName: 'Order Archetypes',
        categoryKey: 'order',
        elements: ['caregiver', 'ruler', 'creator'],
      },
    ];

    const section = formatKeywordHintsSection(block, 'Jambojon Brand Archetypes');
    expect(section).toContain('**hero**');
    expect(section).toContain('courage');
    expect(section).toContain('**sage**');
    expect(section).toContain('wisdom');
    expect(section).toContain('**regular_guy_girl**');
    expect(section).toContain('**ruler**');
  });

  it('formats revenue trends element hints', () => {
    const block: FrameworkChunk[] = [
      {
        categoryName: 'Market Analysis',
        categoryKey: 'market_analysis',
        elements: [
          'market_demand',
          'trending_keywords',
          'seasonal_patterns',
          'competitor_gaps',
        ],
      },
    ];
    const section = formatKeywordHintsSection(block, 'Revenue Trends');
    expect(section).toContain('**market_demand**');
    expect(section).toContain('**competitor_gaps**');
    expect(section).toContain('demand');
  });
});
