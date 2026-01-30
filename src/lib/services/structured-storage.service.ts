/**
 * Structured Framework Results Storage Service
 *
 * Transforms JSON blob storage into structured database tables
 * Enables proper querying, reporting, and analytics
 */

import { prisma } from '@/lib/prisma';

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
          evidence: element.evidence,
          revenueOpportunity: element.revenueOpportunity,
          recommendations: element.recommendations,
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
    results: any,
    _framework: string
  ): number | null {
    if (results.overall_score) {
      if (
        typeof results.overall_score === 'object' &&
        results.overall_score.present &&
        results.overall_score.total
      ) {
        return (
          (results.overall_score.present / results.overall_score.total) * 100
        );
      }
      return results.overall_score;
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
    results: any,
    framework: string
  ): Record<string, any> {
    const categories: Record<string, any> = {};

    switch (framework) {
      case 'b2c-elements':
        categories.functional = results.functional || {};
        categories.emotional = results.emotional || {};
        categories.life_changing = results.life_changing || {};
        categories.social_impact = results.social_impact || {};
        break;

      case 'b2b-elements':
        categories.table_stakes = results.table_stakes || {};
        categories.functional = results.functional || {};
        categories.ease_of_doing_business =
          results.ease_of_doing_business || {};
        categories.individual = results.individual || {};
        categories.inspirational = results.inspirational || {};
        break;

      case 'golden-circle':
        categories.why = results.why || {};
        categories.how = results.how || {};
        categories.what = results.what || {};
        categories.who = results.who || {};
        break;

      case 'clifton-strengths':
        categories.executing = results.executing || {};
        categories.influencing = results.influencing || {};
        categories.relationship_building = results.relationship_building || {};
        categories.strategic_thinking = results.strategic_thinking || {};
        break;

      case 'revenue-trends':
        categories.market_analysis = results.market_analysis || {};
        categories.opportunity_identification =
          results.opportunity_identification || {};
        categories.revenue_optimization = results.revenue_optimization || {};
        categories.growth_strategies = results.growth_strategies || {};
        break;
    }

    return categories;
  }

  /**
   * Extract category score
   */
  private static extractCategoryScore(categoryInfo: any): number | null {
    if (categoryInfo.score) return categoryInfo.score;
    if (categoryInfo.present && categoryInfo.total) {
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

    // Fallback to counting elements
    const elements = categoryInfo.elements || [];
    const presentCount = elements.filter((e: any) => e.present).length;

    return {
      presentElements: presentCount,
      totalElements: elements.length,
      fraction: `${presentCount}/${elements.length}`,
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
  private static extractElements(categoryInfo: any, _framework: string): any[] {
    if (categoryInfo.elements) {
      return categoryInfo.elements.map((element: any) => ({
        name: element.element_name || element.name,
        present: element.present || false,
        confidence: element.confidence,
        evidence: element.evidence || [],
        revenueOpportunity: element.revenue_opportunity,
        recommendations: element.recommendations || [],
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
