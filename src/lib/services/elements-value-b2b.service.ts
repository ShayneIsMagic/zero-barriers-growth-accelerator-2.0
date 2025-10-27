/**
 * Elements of Value B2B Service
 *
 * Analyzes 40 B2B value elements for group/organizational decision-making
 * Based on Harvard Business Review's B2B Elements of Value framework
 */

import { prisma } from '@/lib/prisma';
import {
  PatternMatch,
  SimpleSynonymDetectionService,
} from './simple-synonym-detection.service';

export interface ElementsOfValueB2BAnalysis {
  id: string;
  analysis_id: string;
  overall_score: number;
  table_stakes_score: number;
  functional_score: number;
  ease_of_business_score: number;
  individual_score: number;
  inspirational_score: number;
  elements: B2BElementScore[];
}

export interface B2BElementScore {
  id: string;
  element_name: string;
  element_category: string;
  category_level: number;
  score: number;
  weight: number;
  weighted_score: number;
  evidence: {
    patterns: string[];
    citations: string[];
    confidence: number;
  };
  recommendations: string[];
}

export class ElementsOfValueB2BService {
  /**
   * Run complete B2B Elements of Value analysis
   */
  static async analyze(
    analysisId: string,
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<ElementsOfValueB2BAnalysis> {
    if (!patterns) {
      patterns = await SimpleSynonymDetectionService.findValuePatterns(
        content.text || content.content,
        industry
      );
    }

    const prompt = await this.buildB2BElementsPrompt(
      content,
      industry,
      patterns
    );
    const aiResponse = await this.callGeminiForB2BElements(prompt);

    return await this.storeB2BElementsAnalysis(
      analysisId,
      aiResponse,
      patterns
    );
  }

  /**
   * Build Gemini prompt for B2B Elements analysis
   */
  private static async buildB2BElementsPrompt(
    content: any,
    industry?: string,
    patterns?: PatternMatch[]
  ): Promise<string> {
    const basePrompt = `
Analyze this B2B website using the Elements of Value (B2B) framework.
Score each element for ORGANIZATIONAL/GROUP decision-making (not individual).

WEBSITE CONTENT:
${JSON.stringify(content, null, 2)}

THE 40 B2B VALUE ELEMENTS (Bain & Company Framework):

CATEGORY 1: TABLE STAKES (4 elements - Must-haves)
1. meeting_specifications - Conforms to customer's internal specifications
2. acceptable_price - Provides products/services at acceptable price
3. regulatory_compliance - Complies with regulations
4. ethical_standards - Performs activities in ethical manner

CATEGORY 2: FUNCTIONAL VALUE (9 elements)
Economic (2 elements):
5. improved_top_line - Helps customer increase revenue
6. cost_reduction - Reduces cost for customer's organization

Performance (3 elements):
7. product_quality - Provides high-quality goods or services
8. scalability - Expands easily to additional demand/processes
9. innovation - Provides innovative capabilities

Strategic (4 elements):
10. risk_reduction - Protects customer against loss/risk
11. reach - Allows customer to operate in more locations
12. flexibility - Moves beyond standard to allow customization
13. component_quality - Improves perceived quality of customer's products

CATEGORY 3: EASE OF DOING BUSINESS (17 elements)
Productivity (3 elements):
14. time_savings - Saves time for users/organization
15. reduced_effort - Helps organization get things done with less effort
16. decreased_hassles - Helps customer avoid unnecessary hassles

Information (2 elements):
17. information - Helps users become informed
18. transparency - Provides clear view into customer's organization

Operational (4 elements):
19. organization - Helps users become more organized
20. simplification - Reduces complexity and keeps things simple
21. connection - Connects organizations and users with others
22. integration - Helps integrate different facets of business

Access (4 elements):
23. access - Provides access to resources/services/capabilities
24. availability - Available when and where needed
25. variety - Provides variety of goods/services to choose from
26. configurability - Can be configured to customer's specific needs

Relationship (5 elements):
27. responsiveness - Responds promptly and professionally
28. expertise - Provides know-how for relevant industry
29. commitment - Shows commitment to customer's success
30. stability - Is stable company for foreseeable future
31. cultural_fit - Fits well with customer's culture and people

CATEGORY 4: INDIVIDUAL VALUE (7 elements - Personal benefits for decision-makers)
Career (3 elements):
32. network_expansion - Helps users expand professional network
33. marketability - Makes users more marketable in their field
34. reputational_assurance - Does not jeopardize buyer's reputation

Personal (4 elements):
35. design_aesthetics_b2b - Provides aesthetically pleasing goods/services
36. growth_development - Helps users develop personally
37. reduced_anxiety_b2b - Helps buyers feel more secure
38. fun_perks - Is enjoyable to interact with or rewarding

CATEGORY 5: INSPIRATIONAL VALUE (4 elements)
39. vision - Helps customer anticipate direction of markets
40. hope_b2b - Gives buyers hope for future of their organization
41. social_responsibility - Helps customer be more socially responsible
42. purpose - Aligns with customer's organizational purpose

For each element, provide:
- Score (0-100)
- Evidence with citations
- Recommendations for improvement

Calculate scores:
- table_stakes_score = avg of elements 1-4
- functional_score = avg of elements 5-13
- ease_of_business_score = avg of elements 14-19
- individual_score = avg of elements 20-29
- inspirational_score = avg of elements 30-34
- overall_score = weighted avg (10% table stakes, 30% functional, 25% ease, 20% individual, 15% inspirational)

Return as JSON:
{
  "overall_score": 86,
  "table_stakes_score": 90,
  "functional_score": 88,
  "ease_of_business_score": 85,
  "individual_score": 82,
  "inspirational_score": 78,
  "elements": [
    {
      "element_name": "cost_reduction",
      "element_category": "functional",
      "category_level": 2,
      "score": 92,
      "evidence": {
        "patterns": ["affordable", "reduce cost", "save money"],
        "citations": ["pricing page", "ROI calculator"],
        "confidence": 0.95
      },
      "recommendations": ["Add TCO calculator", "Highlight ROI case studies"]
    },
    // ... 39 more elements
  ]
}
`;

    if (industry && patterns) {
      return await SimpleSynonymDetectionService.buildEnhancedPrompt(
        basePrompt,
        content.text || content.content,
        industry
      );
    }

    return basePrompt;
  }

  /**
   * Call Gemini for B2B analysis
   */
  private static async callGeminiForB2BElements(prompt: string): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    throw new Error('Could not parse Gemini response');
  }

  /**
   * Store B2B Elements analysis in database
   */
  private static async storeB2BElementsAnalysis(
    analysisId: string,
    aiResponse: any,
    patterns: PatternMatch[]
  ): Promise<ElementsOfValueB2BAnalysis> {
    // Create main record using Prisma client
    const eov = await prisma.elements_of_value_b2b.create({
      data: {
        analysis_id: analysisId,
        overall_score: aiResponse.overall_score || 0,
        table_stakes_score: aiResponse.table_stakes_score || 0,
        functional_score: aiResponse.functional_score || 0,
        ease_of_business_score: aiResponse.ease_of_business_score || 0,
        individual_score: aiResponse.individual_score || 0,
        inspirational_score: aiResponse.inspirational_score || 0,
      },
    });

    // Store element scores using Prisma client
    const elements: B2BElementScore[] = [];

    for (const elem of aiResponse.elements || []) {
      const stored = await prisma.b2b_element_scores.create({
        data: {
          eov_b2b_id: eov.id,
          element_name: elem.element_name,
          element_category: elem.element_category,
          category_level: elem.category_level || 1,
          score: elem.score || 0,
          weight: 1.0,
          weighted_score: elem.score || 0,
          evidence: elem.evidence || {},
          recommendations: elem.recommendations || [],
        },
      });

      const evidence = stored.evidence as {
        patterns?: unknown[];
        citations?: unknown[];
        confidence?: number;
      } | null;
      const recommendations = stored.recommendations as unknown[] | null;

      elements.push({
        ...stored,
        score: stored.score ? Number(stored.score) : 0,
        weight: stored.weight ? Number(stored.weight) : 0,
        weighted_score: stored.weighted_score
          ? Number(stored.weighted_score)
          : 0,
        evidence: {
          patterns: Array.isArray(evidence?.patterns)
            ? (evidence.patterns as string[])
            : [],
          citations: Array.isArray(evidence?.citations)
            ? (evidence.citations as string[])
            : [],
          confidence: evidence?.confidence || 0,
        },
        recommendations: Array.isArray(recommendations)
          ? (recommendations as string[])
          : [],
      });
    }

    return {
      id: eov.id,
      analysis_id: analysisId,
      overall_score: aiResponse.overall_score,
      table_stakes_score: aiResponse.table_stakes_score,
      functional_score: aiResponse.functional_score,
      ease_of_business_score: aiResponse.ease_of_business_score,
      individual_score: aiResponse.individual_score,
      inspirational_score: aiResponse.inspirational_score,
      elements,
    };
  }

  /**
   * Fetch existing B2B analysis
   */
  static async getByAnalysisId(
    analysisId: string
  ): Promise<ElementsOfValueB2BAnalysis | null> {
    try {
      const eov = await prisma.elements_of_value_b2b.findFirst({
        where: { analysis_id: analysisId },
        include: {
          b2b_element_scores: true,
        },
      });

      if (!eov) return null;

      return {
        id: eov.id,
        analysis_id: eov.analysis_id,
        overall_score: eov.overall_score ? Number(eov.overall_score) : 0,
        table_stakes_score: eov.table_stakes_score
          ? Number(eov.table_stakes_score)
          : 0,
        functional_score: eov.functional_score
          ? Number(eov.functional_score)
          : 0,
        ease_of_business_score: eov.ease_of_business_score
          ? Number(eov.ease_of_business_score)
          : 0,
        individual_score: eov.individual_score
          ? Number(eov.individual_score)
          : 0,
        inspirational_score: eov.inspirational_score
          ? Number(eov.inspirational_score)
          : 0,
        elements: eov.b2b_element_scores.map((score) => ({
          ...score,
          score: score.score ? Number(score.score) : 0,
          weight: score.weight ? Number(score.weight) : 0,
          weighted_score: score.weighted_score
            ? Number(score.weighted_score)
            : 0,
          evidence: {
            patterns: Array.isArray((score.evidence as any)?.patterns)
              ? (score.evidence as any).patterns
              : [],
            citations: Array.isArray((score.evidence as any)?.citations)
              ? (score.evidence as any).citations
              : [],
            confidence: (score.evidence as any)?.confidence || 0,
          },
          recommendations: Array.isArray(score.recommendations)
            ? (score.recommendations as string[])
            : [],
        })),
      };
    } catch (error) {
      console.error('Failed to fetch B2B Elements:', error);
      return null;
    }
  }
}
