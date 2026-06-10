/**
 * Canonical per-category element lists used by chunked framework analysis.
 * Every element in each framework must appear exactly once across chunks.
 */

import type { FrameworkChunk } from '@/lib/chunked-framework-analysis';

export interface FrameworkChunkConfig {
  frameworkName: string;
  frameworkKey: string;
  expectedElementCount: number;
  chunks: FrameworkChunk[];
}

export const B2C_CHUNK_CONFIG: FrameworkChunkConfig = {
  frameworkName: 'B2C Elements of Value',
  frameworkKey: 'b2c-elements',
  expectedElementCount: 30,
  chunks: [
    {
      categoryName: 'Functional',
      categoryKey: 'functional',
      elements: [
        'saves_time',
        'simplifies',
        'makes_money',
        'reduces_effort',
        'reduces_cost',
        'reduces_risk',
        'organizes',
        'integrates',
        'connects',
        'quality',
        'variety',
        'informs',
        'avoids_hassles',
        'sensory_appeal',
      ],
    },
    {
      categoryName: 'Emotional',
      categoryKey: 'emotional',
      elements: [
        'reduces_anxiety',
        'rewards_me',
        'nostalgia',
        'design_aesthetics',
        'badge_value',
        'wellness',
        'therapeutic',
        'fun_entertainment',
        'attractiveness',
        'provides_access',
      ],
    },
    {
      categoryName: 'Life-Changing',
      categoryKey: 'life_changing',
      elements: [
        'provides_hope',
        'self_actualization',
        'motivation',
        'heirloom',
        'affiliation',
      ],
    },
    {
      categoryName: 'Social Impact',
      categoryKey: 'social_impact',
      elements: ['self_transcendence'],
    },
  ],
};

export const B2B_CHUNK_CONFIG: FrameworkChunkConfig = {
  frameworkName: 'B2B Elements of Value',
  frameworkKey: 'b2b-elements',
  expectedElementCount: 40,
  chunks: [
    {
      categoryName: 'Table Stakes',
      categoryKey: 'table_stakes',
      elements: [
        'meeting_specifications',
        'acceptable_price',
        'regulatory_compliance',
        'ethical_standards',
      ],
    },
    {
      categoryName: 'Functional Value',
      categoryKey: 'functional',
      elements: [
        'improved_top_line',
        'cost_reduction',
        'product_quality',
        'scalability',
        'innovation',
        'risk_reduction',
        'reach',
        'flexibility',
        'component_quality',
      ],
    },
    {
      categoryName: 'Ease of Doing Business',
      categoryKey: 'ease_of_business',
      elements: [
        'time_savings',
        'reduced_effort',
        'decreased_hassles',
        'information',
        'transparency',
        'organization',
        'simplification',
        'connection',
        'integration',
        'access',
        'availability',
        'variety',
        'configurability',
        'responsiveness',
        'expertise',
        'commitment',
        'stability',
        'cultural_fit',
      ],
    },
    {
      categoryName: 'Individual Value',
      categoryKey: 'individual',
      elements: [
        'network_expansion',
        'marketability',
        'reputational_assurance',
        'design_aesthetics_b2b',
        'growth_development',
        'reduced_anxiety_b2b',
        'fun_perks',
      ],
    },
    {
      categoryName: 'Inspirational Value',
      categoryKey: 'inspirational',
      elements: ['vision', 'hope_b2b'],
    },
  ],
};

export const CLIFTON_CHUNK_CONFIG: FrameworkChunkConfig = {
  frameworkName: 'CliftonStrengths',
  frameworkKey: 'clifton',
  expectedElementCount: 34,
  chunks: [
    {
      categoryName: 'Strategic Thinking',
      categoryKey: 'strategic_thinking',
      elements: [
        'analytical',
        'context',
        'futuristic',
        'ideation',
        'input',
        'intellection',
        'learner',
        'strategic',
      ],
    },
    {
      categoryName: 'Executing',
      categoryKey: 'executing',
      elements: [
        'achiever',
        'arranger',
        'belief',
        'consistency',
        'deliberative',
        'discipline',
        'focus',
        'responsibility',
        'restorative',
      ],
    },
    {
      categoryName: 'Influencing',
      categoryKey: 'influencing',
      elements: [
        'activator',
        'command',
        'communication',
        'competition',
        'maximizer',
        'self_assurance',
        'significance',
        'woo',
      ],
    },
    {
      categoryName: 'Relationship Building',
      categoryKey: 'relationship_building',
      elements: [
        'adaptability',
        'connectedness',
        'developer',
        'empathy',
        'harmony',
        'includer',
        'individualization',
        'positivity',
        'relator',
      ],
    },
  ],
};

/** Golden Circle uses 24 scoring dimensions across WHY/HOW/WHAT/WHO (6 each). */
export const GOLDEN_CIRCLE_CHUNK_CONFIG: FrameworkChunkConfig = {
  frameworkName: 'Golden Circle (Simon Sinek)',
  frameworkKey: 'golden-circle',
  expectedElementCount: 24,
  chunks: [
    {
      categoryName: 'WHY (Purpose, Cause, Belief)',
      categoryKey: 'why',
      elements: [
        'clarity',
        'authenticity',
        'inspiration',
        'consistency',
        'differentiation',
        'emotional_resonance',
      ],
    },
    {
      categoryName: 'HOW (Process, Methodology, Differentiation)',
      categoryKey: 'how',
      elements: [
        'uniqueness',
        'clarity',
        'consistency',
        'alignment',
        'proof_points',
        'competitive_moat',
      ],
    },
    {
      categoryName: 'WHAT (Products, Services, Features)',
      categoryKey: 'what',
      elements: [
        'clarity',
        'alignment',
        'quality',
        'proof',
        'evolution',
        'market_fit',
      ],
    },
    {
      categoryName: 'WHO (Target Audience, People, Relationships)',
      categoryKey: 'who',
      elements: [
        'clarity',
        'alignment',
        'specificity',
        'understanding',
        'resonance',
        'loyalty',
      ],
    },
  ],
};

/** 12 Jambojon brand archetypes across 4 motivational groups (3 each). */
export const BRAND_ARCHETYPES_CHUNK_CONFIG: FrameworkChunkConfig = {
  frameworkName: 'Jambojon Brand Archetypes',
  frameworkKey: 'brand-archetypes',
  expectedElementCount: 12,
  chunks: [
    {
      categoryName: 'Ego Archetypes (Leave a Mark on the World)',
      categoryKey: 'ego',
      elements: ['hero', 'magician', 'outlaw'],
    },
    {
      categoryName: 'Order Archetypes (Provide Structure)',
      categoryKey: 'order',
      elements: ['caregiver', 'ruler', 'creator'],
    },
    {
      categoryName: 'Freedom Archetypes (Yearn for Paradise)',
      categoryKey: 'freedom',
      elements: ['innocent', 'explorer', 'sage'],
    },
    {
      categoryName: 'Social Archetypes (Connect with Others)',
      categoryKey: 'social',
      elements: ['regular_guy_girl', 'jester', 'lover'],
    },
  ],
};

export const FRAMEWORK_CHUNK_CONFIGS: Record<string, FrameworkChunkConfig> = {
  'b2c-elements': B2C_CHUNK_CONFIG,
  'b2b-elements': B2B_CHUNK_CONFIG,
  clifton: CLIFTON_CHUNK_CONFIG,
  'golden-circle': GOLDEN_CIRCLE_CHUNK_CONFIG,
  'brand-archetypes': BRAND_ARCHETYPES_CHUNK_CONFIG,
};

export function getChunksForFramework(frameworkKey: string): FrameworkChunk[] {
  const config = FRAMEWORK_CHUNK_CONFIGS[frameworkKey];
  if (!config) {
    throw new Error(`Unknown framework key: ${frameworkKey}`);
  }
  return config.chunks;
}
