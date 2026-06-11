/**
 * Structured Framework Results Storage Service
 *
 * Transforms JSON blob storage into structured database tables
 * Enables proper querying, reporting, and analytics
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  countPresentFromElementMap,
  flattenCategoryElementMap,
  mapFlatElementsForStorage,
} from '@/lib/services/structured-storage-utils';

export interface StructuredFrameworkResult {
  id: string;
  analysisId: string;
  framework: string;
  results: any;
  score?: number;
  metadata?: any;
  categories: StructuredCategory[];
}

export interface StructuredCategory {
  id: string;
  categoryName: string;
  categoryScore?: number;
  presentElements: number;
  totalElements: number;
  fraction: string;
  evidence?: any[];
  recommendations?: any[];
  elements: StructuredElement[];
}

export interface StructuredElement {
  id: string;
  elementName: string;
  isPresent: boolean;
  confidence?: number;
  evidence?: any[];
  revenueOpportunity?: string;
  recommendations?: any[];
}

export class StructuredStorageService {
  /**
   * Store framework results in structured format
   */
  static async storeFrameworkResult(
    analysisId: string,
    framework: string,
    results: any
  ): Promise<StructuredFrameworkResult> {
    console.log(
      `📊 Storing structured results for ${framework} analysis: ${analysisId}`
    );

    try {
      // Extract overall score
      const overallScore = this.extractOverallScore(results, framework);

      // Extract metadata
      const metadata = this.extractMetadata(results);

      // Create framework result
      const frameworkResult = await prisma.frameworkResult.create({
        data: {
          analysisId,
          framework,
          results,
          score: overallScore,
          metadata,
        },
      });

      // Store categories and elements
      const categories = await this.storeCategories(
        frameworkResult.id,
        results,
        framework
      );

      console.log(
        `✅ Structured results stored for ${framework}: ${frameworkResult.id}`
      );

      return {
        id: frameworkResult.id,
        analysisId: frameworkResult.analysisId,
        framework: frameworkResult.framework,
        results: frameworkResult.results,
        score: frameworkResult.score,
        metadata: frameworkResult.metadata,
        categories,
      };
    } catch (error) {
      console.error(
        `❌ Failed to store structured results for ${framework}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Store categories and their elements
   */
  private static async storeCategories(
    frameworkResultId: string,
    results: any,
    framework: string
  ): Promise<StructuredCategory[]> {
    const categories: StructuredCategory[] = [];

    // Extract categories based on framework
    const categoryData = this.extractCategories(results, framework);

    for (const [categoryName, categoryInfo] of Object.entries(categoryData)) {
      const categoryScore = this.extractCategoryScore(categoryInfo);
      const { presentElements, totalElements, fraction } =
        this.extractElementCounts(categoryInfo);
      const evidence = this.extractCategoryEvidence(categoryInfo);
      const recommendations = this.extractCategoryRecommendations(categoryInfo);

      // Create category
      const category = await prisma.frameworkCategory.create({
        data: {
          frameworkResultId,
          categoryName,
          categoryScore,
          presentElements,
          totalElements,
          fraction,
          evidence,
          recommendations,
        },
      });

      // Store elements for this category
      const elements = await this.storeElements(
        category.id,
        categoryInfo,
        framework
      );

      categories.push({
        id: category.id,
        categoryName: category.categoryName,
        categoryScore: category.categoryScore,
        presentElements: category.presentElements,
        totalElements: category.totalElements,
        fraction: category.fraction,
        evidence: category.evidence as any[],
        recommendations: category.recommendations as any[],
        elements,
      });
    }

    return categories;
  }

  /**
   * Store elements for a category
   */
  private static async storeElements(
    categoryId: string,
    categoryInfo: any,
    framework: string
  ): Promise<StructuredElement[]> {
    const elements: StructuredElement[] = [];

    // Extract elements based on framework
    const elementData = this.extractElements(categoryInfo, framework);

    for (const element of elementData) {
      const elementRecord = await prisma.frameworkElement.create({
        data: {
          categoryId,
          elementName: element.name,
          isPresent: element.present,
          confidence: element.confidence,
          evidence: element.evidence as Prisma.InputJsonValue,
          revenueOpportunity: element.revenueOpportunity,
          recommendations: element.recommendations as Prisma.InputJsonValue,
        },
      });

      elements.push({
        id: elementRecord.id,
        elementName: elementRecord.elementName,
        isPresent: elementRecord.isPresent,
        confidence: elementRecord.confidence,
        evidence: elementRecord.evidence as any[],
        revenueOpportunity: elementRecord.revenueOpportunity,
        recommendations: elementRecord.recommendations as any[],
      });
    }

    return elements;
  }

  /**
   * Extract overall score from results
   */
  private static extractOverallScore(
    results: Record<string, unknown>,
    _framework: string
  ): number | null {
    if (typeof results.overallScore === 'number') {
      return results.overallScore;
    }
    if (results.overall_score) {
      if (
        typeof results.overall_score === 'object' &&
        results.overall_score !== null &&
        'present' in results.overall_score &&
        'total' in results.overall_score
      ) {
        const ratio = results.overall_score as { present: number; total: number };
        return (ratio.present / ratio.total) * 100;
      }
      if (typeof results.overall_score === 'number') {
        return results.overall_score;
      }
    }
    return null;
  }

  /**
   * Extract metadata from results
   */
  private static extractMetadata(results: any): any {
    return {
      analysisType: results.analysis_metadata?.analysis_type || 'ai_analysis',
      framework: results.analysis_metadata?.framework,
      totalElements: results.analysis_metadata?.total_elements,
      presentElements: results.analysis_metadata?.present_elements,
      generatedAt:
        results.analysis_metadata?.generated_at || new Date().toISOString(),
    };
  }

  /**
   * Extract categories based on framework
   */
  private static extractCategories(
    results: Record<string, unknown>,
    framework: string
  ): Record<string, Record<string, unknown>> {
    const chunkedCategories = results.categories;
    if (
      chunkedCategories &&
      typeof chunkedCategories === 'object' &&
      !Array.isArray(chunkedCategories)
    ) {
      return chunkedCategories as Record<string, Record<string, unknown>>;
    }

    const categories: Record<string, Record<string, unknown>> = {};

    switch (framework) {
      case 'b2c-elements':
        categories.functional = (results.functional as Record<string, unknown>) || {};
        categories.emotional = (results.emotional as Record<string, unknown>) || {};
        categories.life_changing =
          (results.life_changing as Record<string, unknown>) || {};
        categories.social_impact =
          (results.social_impact as Record<string, unknown>) || {};
        break;

      case 'b2b-elements':
        categories.table_stakes =
          (results.table_stakes as Record<string, unknown>) || {};
        categories.functional = (results.functional as Record<string, unknown>) || {};
        categories.ease_of_doing_business =
          (results.ease_of_doing_business as Record<string, unknown>) || {};
        categories.individual = (results.individual as Record<string, unknown>) || {};
        categories.inspirational =
          (results.inspirational as Record<string, unknown>) || {};
        break;

      case 'golden-circle':
        categories.why = (results.why as Record<string, unknown>) || {};
        categories.how = (results.how as Record<string, unknown>) || {};
        categories.what = (results.what as Record<string, unknown>) || {};
        categories.who = (results.who as Record<string, unknown>) || {};
        break;

      case 'clifton-strengths':
        categories.executing = (results.executing as Record<string, unknown>) || {};
        categories.influencing =
          (results.influencing as Record<string, unknown>) || {};
        categories.relationship_building =
          (results.relationship_building as Record<string, unknown>) || {};
        categories.strategic_thinking =
          (results.strategic_thinking as Record<string, unknown>) || {};
        break;

      case 'brand-archetypes':
        categories.ego = (results.ego as Record<string, unknown>) || {};
        categories.order = (results.order as Record<string, unknown>) || {};
        categories.freedom = (results.freedom as Record<string, unknown>) || {};
        categories.social = (results.social as Record<string, unknown>) || {};
        break;

      case 'revenue-trends':
        categories.market_analysis =
          (results.market_analysis as Record<string, unknown>) || {};
        categories.opportunity_identification =
          (results.opportunity_identification as Record<string, unknown>) || {};
        categories.revenue_optimization =
          (results.revenue_optimization as Record<string, unknown>) || {};
        categories.growth_strategies =
          (results.growth_strategies as Record<string, unknown>) || {};
        break;
    }

    return categories;
  }

  /**
   * Extract category score
   */
  private static extractCategoryScore(
    categoryInfo: Record<string, unknown>
  ): number | null {
    if (typeof categoryInfo.categoryScore === 'number') {
      return categoryInfo.categoryScore;
    }
    if (typeof categoryInfo.score === 'number') {
      return categoryInfo.score;
    }
    if (
      typeof categoryInfo.present === 'number' &&
      typeof categoryInfo.total === 'number' &&
      categoryInfo.total > 0
    ) {
      return (categoryInfo.present / categoryInfo.total) * 100;
    }
    return null;
  }

  /**
   * Extract element counts
   */
  private static extractElementCounts(categoryInfo: any): {
    presentElements: number;
    totalElements: number;
    fraction: string;
  } {
    if (categoryInfo.present && categoryInfo.total) {
      return {
        presentElements: categoryInfo.present,
        totalElements: categoryInfo.total,
        fraction: `${categoryInfo.present}/${categoryInfo.total}`,
      };
    }

    const flattened = flattenCategoryElementMap(
      categoryInfo as Record<string, unknown>
    );
    if (Object.keys(flattened).length > 0) {
      return countPresentFromElementMap(flattened);
    }

    const elements = categoryInfo.elements;
    if (elements && typeof elements === 'object' && !Array.isArray(elements)) {
      const entries = Object.values(elements as Record<string, { score?: number }>);
      const presentCount = entries.filter((e) => (e.score ?? 0) >= 0.6).length;
      return {
        presentElements: presentCount,
        totalElements: entries.length,
        fraction: `${presentCount}/${entries.length}`,
      };
    }

    const elementList = Array.isArray(elements) ? elements : [];
    const presentCount = elementList.filter((e: { present?: boolean }) => e.present)
      .length;

    return {
      presentElements: presentCount,
      totalElements: elementList.length,
      fraction: `${presentCount}/${elementList.length}`,
    };
  }

  /**
   * Extract category evidence
   */
  private static extractCategoryEvidence(categoryInfo: any): any[] {
    return categoryInfo.evidence || [];
  }

  /**
   * Extract category recommendations
   */
  private static extractCategoryRecommendations(categoryInfo: any): any[] {
    return categoryInfo.recommendations || [];
  }

  /**
   * Extract elements from category
   */
  private static extractElements(
    categoryInfo: Record<string, unknown>,
    _framework: string
  ): Array<{
    name: string;
    present: boolean;
    confidence: number | null;
    evidence: unknown[];
    revenueOpportunity: string | null;
    recommendations: unknown[];
  }> {
    const flattened = flattenCategoryElementMap(categoryInfo);
    if (Object.keys(flattened).length > 0) {
      return mapFlatElementsForStorage(flattened);
    }

    const elements = categoryInfo.elements;
    if (!elements) {
      return [];
    }

    if (typeof elements === 'object' && !Array.isArray(elements)) {
      return mapFlatElementsForStorage(
        elements as Record<string, Record<string, unknown>>
      );
    }

    if (Array.isArray(elements)) {
      return elements.map((element: Record<string, unknown>) => ({
        name: String(element.element_name || element.name || 'unknown'),
        present: Boolean(element.present),
        confidence:
          typeof element.confidence === 'number' ? element.confidence : null,
        evidence: Array.isArray(element.evidence) ? element.evidence : [],
        revenueOpportunity:
          typeof element.revenue_opportunity === 'string'
            ? element.revenue_opportunity
            : null,
        recommendations: Array.isArray(element.recommendations)
          ? element.recommendations
          : [],
      }));
    }

    return [];
  }

  /**
   * Get structured results for an analysis
   */
  static async getFrameworkResults(
    analysisId: string
  ): Promise<StructuredFrameworkResult[]> {
    const results = await prisma.frameworkResult.findMany({
      where: { analysisId },
      include: {
        categories: {
          include: {
            elements: true,
          },
        },
      },
    });

    return results.map((result) => ({
      id: result.id,
      analysisId: result.analysisId,
      framework: result.framework,
      results: result.results,
      score: result.score,
      metadata: result.metadata,
      categories: result.categories.map((category) => ({
        id: category.id,
        categoryName: category.categoryName,
        categoryScore: category.categoryScore,
        presentElements: category.presentElements,
        totalElements: category.totalElements,
        fraction: category.fraction,
        evidence: category.evidence as any[],
        recommendations: category.recommendations as any[],
        elements: category.elements.map((element) => ({
          id: element.id,
          elementName: element.elementName,
          isPresent: element.isPresent,
          confidence: element.confidence,
          evidence: element.evidence as any[],
          revenueOpportunity: element.revenueOpportunity,
          recommendations: element.recommendations as any[],
        })),
      })),
    }));
  }

  /**
   * Get analytics data across all analyses
   */
  static async getAnalyticsData(framework?: string): Promise<any> {
    const whereClause = framework ? { framework } : {};

    const results = await prisma.frameworkResult.findMany({
      where: whereClause,
      include: {
        categories: {
          include: {
            elements: true,
          },
        },
      },
    });

    // Calculate analytics
    const analytics = {
      totalAnalyses: results.length,
      averageScore:
        results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length,
      frameworks: [...new Set(results.map((r) => r.framework))],
      categoryPerformance: {},
      elementPerformance: {},
    };

    return analytics;
  }
}
