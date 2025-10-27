/**
 * Simple Synonym Detection Service
 * Provides basic pattern matching without complex database operations
 */

export interface PatternMatch {
  element_name: string;
  pattern_text: string;
  match_count: number;
  confidence: number;
}

export class SimpleSynonymDetectionService {
  /**
   * Find value patterns in content using simple text matching
   */
  static async findValuePatterns(
    content: string,
    industry?: string
  ): Promise<PatternMatch[]> {
    try {
      // Simple pattern matching without database calls
      const patterns: PatternMatch[] = [];

      // Basic value element patterns
      const valuePatterns = [
        {
          element: 'saves_time',
          patterns: ['save time', 'time saving', 'faster', 'quick', 'instant'],
        },
        {
          element: 'simplifies',
          patterns: ['simple', 'easy', 'straightforward', 'streamlined'],
        },
        {
          element: 'quality',
          patterns: ['quality', 'premium', 'excellent', 'superior', 'high-end'],
        },
        {
          element: 'reduces_effort',
          patterns: ['effortless', 'no effort', 'minimal effort', 'easy'],
        },
        {
          element: 'reduces_cost',
          patterns: [
            'affordable',
            'cost-effective',
            'budget',
            'cheap',
            'save money',
          ],
        },
        {
          element: 'reduces_risk',
          patterns: ['safe', 'secure', 'risk-free', 'guaranteed', 'protected'],
        },
        {
          element: 'connects',
          patterns: ['connect', 'network', 'community', 'social', 'together'],
        },
        {
          element: 'informs',
          patterns: [
            'information',
            'knowledge',
            'learn',
            'education',
            'insights',
          ],
        },
        {
          element: 'reduces_anxiety',
          patterns: ['peace of mind', 'worry-free', 'confident', 'secure'],
        },
        {
          element: 'provides_hope',
          patterns: ['hope', 'future', 'potential', 'possibility', 'dream'],
        },
      ];

      const contentLower = content.toLowerCase();

      for (const valuePattern of valuePatterns) {
        let matchCount = 0;
        let confidence = 0;

        for (const pattern of valuePattern.patterns) {
          const regex = new RegExp(pattern, 'gi');
          const matches = contentLower.match(regex);
          if (matches) {
            matchCount += matches.length;
            confidence += matches.length * 0.1; // Simple confidence scoring
          }
        }

        if (matchCount > 0) {
          patterns.push({
            element_name: valuePattern.element,
            pattern_text: valuePattern.patterns[0], // Use first pattern as representative
            match_count: matchCount,
            confidence: Math.min(confidence, 1.0), // Cap at 1.0
          });
        }
      }

      // Sort by confidence and limit results
      return patterns.sort((a, b) => b.confidence - a.confidence).slice(0, 20); // Limit to top 20 patterns
    } catch (error) {
      console.error('Simple pattern matching failed:', error);
      return [];
    }
  }

  /**
   * Build enhanced AI prompt with industry context
   */
  static async buildEnhancedPrompt(
    basePrompt: string,
    content: string,
    industry?: string
  ): Promise<string> {
    if (!industry) return basePrompt;

    const patterns = await this.findValuePatterns(content, industry);

    if (patterns.length === 0) {
      return basePrompt;
    }

    const industryContext = `

INDUSTRY-SPECIFIC CONTEXT (${industry.toUpperCase()}):

Patterns detected in this content:
${patterns
  .slice(0, 10)
  .map(
    (p) =>
      `- "${p.pattern_text}" → ${p.element_name} (${p.match_count} matches, confidence: ${(p.confidence * 100).toFixed(0)}%)`
  )
  .join('\n')}

IMPORTANT: Use these detected patterns as evidence in your analysis. When scoring elements:
1. Higher scores for elements with multiple high-confidence pattern matches
2. Include specific pattern citations in evidence
3. Provide recommendations that leverage detected patterns

`;

    return basePrompt + industryContext;
  }
}
