/**
 * Comprehensive Google Analysis Service
 *
 * This service combines multiple Google tools for thorough analysis:
 * - Google Search Console (when configured)
 * - Google Trends (real-time)
 * - Google Keyword Planner (when configured)
 * - Google PageSpeed Insights
 * - Google Safe Browsing
 * - Custom SEO analysis
 */

import { apiKeyManager } from './secure-api-keys';
import { RealGoogleTrendsService } from './real-google-trends-service';

export interface ComprehensiveGoogleAnalysis {
  // Search Console Data (when configured)
  searchConsole: {
    configured: boolean;
    data?: {
      topQueries: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;
      topPages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      }>;
      performance: {
        totalClicks: number;
        totalImpressions: number;
        averageCtr: number;
        averagePosition: number;
      };
    };
    error?: string;
  };

  // Google Trends Data (real-time)
  trends: {
    configured: boolean;
    data?: {
      keywordTrends: Array<{
        keyword: string;
        trending: boolean;
        peakInterest: number;
        currentInterest: number;
        trendDirection: 'rising' | 'falling' | 'stable';
        relatedQueries: string[];
        relatedTopics: string[];
      }>;
      trendingKeywords: string[];
      regionalInterest: Array<{ region: string; interest: number }>;
    };
    error?: string;
  };

  // PageSpeed Insights (free)
  pageSpeed: {
    configured: boolean;
    data?: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
      coreWebVitals: {
        lcp: number; // Largest Contentful Paint
        fid: number; // First Input Delay
        cls: number; // Cumulative Layout Shift
      };
      opportunities: Array<{
        title: string;
        description: string;
        savings: string;
      }>;
    };
    error?: string;
  };

  // Safe Browsing (free)
  safeBrowsing: {
    configured: boolean;
    data?: {
      safe: boolean;
      threats: Array<{ type: string; description: string }>;
      lastChecked: string;
    };
    error?: string;
  };

  // Custom SEO Analysis
  seoAnalysis: {
    configured: boolean;
    data?: {
      technicalSeo: {
        titleLength: number;
        metaDescriptionLength: number;
        headingStructure: {
          h1: number;
          h2: number;
          h3: number;
          h4: number;
          h5: number;
          h6: number;
        };
        internalLinks: number;
        externalLinks: number;
        imagesWithAlt: number;
        totalImages: number;
      };
      contentAnalysis: {
        wordCount: number;
        readabilityScore: number;
        keywordDensity: Array<{
          keyword: string;
          density: number;
          count: number;
        }>;
        contentGaps: string[];
      };
      mobileAnalysis: {
        mobileFriendly: boolean;
        viewportConfigured: boolean;
        touchFriendly: boolean;
      };
    };
    error?: string;
  };

  // Analysis Summary
  summary: {
    totalToolsConfigured: number;
    totalToolsAvailable: number;
    analysisQuality: 'basic' | 'intermediate' | 'advanced' | 'comprehensive';
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      category: string;
      title: string;
      description: string;
      actionRequired: boolean;
    }>;
  };
}

export class ComprehensiveGoogleAnalysisService {
  private url: string;
  private extractedKeywords: string[];

  constructor(url: string, extractedKeywords: string[] = []) {
    this.url = url;
    this.extractedKeywords = extractedKeywords;
  }

  /**
   * Perform comprehensive Google analysis using all available tools
   */
  async performComprehensiveAnalysis(): Promise<ComprehensiveGoogleAnalysis> {
    console.log(`🔍 Starting comprehensive Google analysis for: ${this.url}`);

    // Execute all analysis tools in parallel for speed
    const [
      searchConsoleData,
      trendsData,
      pageSpeedData,
      safeBrowsingData,
      seoAnalysisData,
    ] = await Promise.allSettled([
      this.analyzeSearchConsole(),
      this.analyzeGoogleTrends(),
      this.analyzePageSpeedInsights(),
      this.analyzeSafeBrowsing(),
      this.analyzeCustomSEO(),
    ]);

    // Process results
    const searchConsole = this.processResult(
      searchConsoleData,
      'Search Console'
    );
    const trends = this.processResult(trendsData, 'Google Trends');
    const pageSpeed = this.processResult(pageSpeedData, 'PageSpeed Insights');
    const safeBrowsing = this.processResult(safeBrowsingData, 'Safe Browsing');
    const seoAnalysis = this.processResult(seoAnalysisData, 'Custom SEO');

    // Calculate summary
    const summary = this.generateAnalysisSummary({
      searchConsole,
      trends,
      pageSpeed,
      safeBrowsing,
      seoAnalysis,
    });

    return {
      searchConsole,
      trends,
      pageSpeed,
      safeBrowsing,
      seoAnalysis,
      summary,
    };
  }

  /**
   * Analyze Google Search Console data (when configured)
   */
  private async analyzeSearchConsole(): Promise<any> {
    try {
      const credentials = apiKeyManager.getSearchConsoleCredentials();

      if (!credentials.isConfigured) {
        return {
          configured: false,
          error:
            'Search Console credentials not configured. Requires OAuth2 setup.',
        };
      }

      // TODO: Implement real Search Console API integration
      // This would require OAuth2 flow and website verification
      console.log('📊 Search Console analysis would require OAuth2 setup');

      return {
        configured: false,
        error:
          'Search Console integration requires OAuth2 setup and website verification',
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze Google Trends data (real-time)
   */
  private async analyzeGoogleTrends(): Promise<any> {
    try {
      const trendsService = new RealGoogleTrendsService(
        this.url,
        this.extractedKeywords
      );

      // Get trends for extracted keywords
      const trendsData = await trendsService.getMultipleKeywordsTrends(
        this.extractedKeywords.slice(0, 5)
      );

      // Get trending keywords
      const trendingKeywords =
        await trendsService.getTrendingKeywords('business');

      // Get regional interest for main keywords
      const regionalInterest = await Promise.all(
        this.extractedKeywords.slice(0, 3).map(async (keyword) => {
          const trend = await trendsService.getTrendsData(keyword);
          return {
            keyword,
            regions: trend.regionalInterest || [],
          };
        })
      );

      return {
        configured: true,
        data: {
          keywordTrends: trendsData.map((trend) => ({
            keyword: trend.keyword,
            trending: trend.trending,
            peakInterest: trend.peakInterest,
            currentInterest: trend.currentInterest,
            trendDirection: trend.trendDirection,
            relatedQueries: trend.relatedQueries
              .map((q: any) => q.query || q)
              .slice(0, 5),
            relatedTopics: trend.relatedTopics
              .map((t: any) => t.topic || t)
              .slice(0, 5),
          })),
          trendingKeywords: trendingKeywords.slice(0, 10),
          regionalInterest: regionalInterest
            .flatMap((r) => r.regions)
            .slice(0, 10),
        },
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze PageSpeed Insights (free Google tool)
   */
  private async analyzePageSpeedInsights(): Promise<any> {
    try {
      // Use Google PageSpeed Insights API (free)
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(this.url)}&key=${process.env.GOOGLE_PAGESPEED_API_KEY || ''}`
      );

      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }

      const data = await response.json();
      const lighthouse = data.lighthouseResult;

      return {
        configured: true,
        data: {
          performance: Math.round(
            lighthouse.categories.performance.score * 100
          ),
          accessibility: Math.round(
            lighthouse.categories.accessibility.score * 100
          ),
          bestPractices: Math.round(
            lighthouse.categories['best-practices'].score * 100
          ),
          seo: Math.round(lighthouse.categories.seo.score * 100),
          coreWebVitals: {
            lcp: lighthouse.audits['largest-contentful-paint'].numericValue,
            fid: lighthouse.audits['max-potential-fid'].numericValue,
            cls: lighthouse.audits['cumulative-layout-shift'].numericValue,
          },
          opportunities:
            lighthouse.audits['unused-css-rules']?.details?.items
              ?.slice(0, 5)
              .map((item: any) => ({
                title: 'Unused CSS',
                description: `Remove unused CSS rules`,
                savings: item.wastedBytes
                  ? `${Math.round(item.wastedBytes / 1024)}KB`
                  : 'Unknown',
              })) || [],
        },
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze Safe Browsing (free Google tool)
   */
  private async analyzeSafeBrowsing(): Promise<any> {
    try {
      // Use Google Safe Browsing API (free)
      const response = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY || ''}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: {
              clientId: 'zero-barriers-analysis',
              clientVersion: '1.0',
            },
            threatInfo: {
              threatTypes: [
                'MALWARE',
                'SOCIAL_ENGINEERING',
                'UNWANTED_SOFTWARE',
              ],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: this.url }],
            },
          }),
        }
      );

      const data = await response.json();
      const hasThreats = data.matches && data.matches.length > 0;

      return {
        configured: true,
        data: {
          safe: !hasThreats,
          threats: hasThreats
            ? data.matches.map((match: any) => ({
                type: match.threatType,
                description: `Potential ${match.threatType.toLowerCase().replace('_', ' ')} threat detected`,
              }))
            : [],
          lastChecked: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Analyze custom SEO metrics
   */
  private async analyzeCustomSEO(): Promise<any> {
    try {
      // Fetch and analyze the website content
      const response = await fetch(this.url);
      const html = await response.text();

      // Basic SEO analysis
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const metaDescMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"]+)["']/i
      );
      const headings = {
        h1: (html.match(/<h1[^>]*>/gi) || []).length,
        h2: (html.match(/<h2[^>]*>/gi) || []).length,
        h3: (html.match(/<h3[^>]*>/gi) || []).length,
        h4: (html.match(/<h4[^>]*>/gi) || []).length,
        h5: (html.match(/<h5[^>]*>/gi) || []).length,
        h6: (html.match(/<h6[^>]*>/gi) || []).length,
      };

      const internalLinks = (
        html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || []
      ).filter(
        (link) =>
          !link.includes('http') || link.includes(new URL(this.url).hostname)
      ).length;

      const externalLinks = (
        html.match(/<a[^>]*href=["']https?:\/\/[^"']*["'][^>]*>/gi) || []
      ).filter((link) => !link.includes(new URL(this.url).hostname)).length;

      const imagesWithAlt = (
        html.match(/<img[^>]*alt=["'][^"']+["'][^>]*>/gi) || []
      ).length;
      const totalImages = (html.match(/<img[^>]*>/gi) || []).length;

      // Basic content analysis
      const textContent = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const wordCount = textContent.split(' ').length;

      return {
        configured: true,
        data: {
          technicalSeo: {
            titleLength: titleMatch?.[1]?.length || 0,
            metaDescriptionLength: metaDescMatch?.[1]?.length || 0,
            headingStructure: headings,
            internalLinks,
            externalLinks,
            imagesWithAlt,
            totalImages,
          },
          contentAnalysis: {
            wordCount,
            readabilityScore: this.calculateReadabilityScore(textContent),
            keywordDensity: this.calculateKeywordDensity(
              textContent,
              this.extractedKeywords
            ),
            contentGaps: this.identifyContentGaps(html),
          },
          mobileAnalysis: {
            mobileFriendly: html.includes('viewport'),
            viewportConfigured: html.includes('name="viewport"'),
            touchFriendly: !html.includes('user-scalable=no'),
          },
        },
      };
    } catch (error) {
      return {
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process API results with error handling
   */
  private processResult(
    result: PromiseSettledResult<any>,
    toolName: string
  ): any {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        configured: false,
        error: `${toolName} analysis failed: ${result.reason}`,
      };
    }
  }

  /**
   * Generate analysis summary and recommendations
   */
  private generateAnalysisSummary(results: any): any {
    const configuredTools = Object.values(results).filter(
      (r: any) => r.configured
    ).length;
    const totalTools = Object.keys(results).length;

    let analysisQuality:
      | 'basic'
      | 'intermediate'
      | 'advanced'
      | 'comprehensive';
    if (configuredTools >= 4) analysisQuality = 'comprehensive';
    else if (configuredTools >= 3) analysisQuality = 'advanced';
    else if (configuredTools >= 2) analysisQuality = 'intermediate';
    else analysisQuality = 'basic';

    const recommendations = this.generateRecommendations(results);

    return {
      totalToolsConfigured: configuredTools,
      totalToolsAvailable: totalTools,
      analysisQuality,
      recommendations,
    };
  }

  /**
   * Generate actionable recommendations based on analysis results
   */
  private generateRecommendations(results: any): Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actionRequired: boolean;
  }> {
    const recommendations = [];

    // PageSpeed recommendations
    if (results.pageSpeed.configured && results.pageSpeed.data) {
      if (results.pageSpeed.data.performance < 50) {
        recommendations.push({
          priority: 'high' as const,
          category: 'Performance',
          title: 'Improve Page Speed',
          description: `Current performance score: ${results.pageSpeed.data.performance}. Focus on Core Web Vitals optimization.`,
          actionRequired: true,
        });
      }
    }

    // SEO recommendations
    if (results.seoAnalysis.configured && results.seoAnalysis.data) {
      const seo = results.seoAnalysis.data.technicalSeo;
      if (seo.titleLength === 0) {
        recommendations.push({
          priority: 'high' as const,
          category: 'SEO',
          title: 'Add Page Title',
          description: 'Missing page title tag. This is critical for SEO.',
          actionRequired: true,
        });
      }
      if (seo.metaDescriptionLength === 0) {
        recommendations.push({
          priority: 'medium' as const,
          category: 'SEO',
          title: 'Add Meta Description',
          description:
            'Missing meta description. This affects search result snippets.',
          actionRequired: true,
        });
      }
    }

    // Trends recommendations
    if (results.trends.configured && results.trends.data) {
      const trendingKeywords = results.trends.data.trendingKeywords;
      if (trendingKeywords.length > 0) {
        recommendations.push({
          priority: 'medium' as const,
          category: 'Content Strategy',
          title: 'Leverage Trending Keywords',
          description: `Consider incorporating trending keywords: ${trendingKeywords.slice(0, 3).join(', ')}`,
          actionRequired: false,
        });
      }
    }

    return recommendations;
  }

  // Helper methods
  private calculateReadabilityScore(text: string): number {
    // Simple readability score based on sentence and word length
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    return Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));
  }

  private calculateKeywordDensity(
    text: string,
    keywords: string[]
  ): Array<{ keyword: string; density: number; count: number }> {
    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    return keywords.map((keyword) => {
      const keywordWords = keyword.toLowerCase().split(/\s+/);
      const count = words.reduce((acc, word, index) => {
        if (keywordWords.every((kw, i) => words[index + i] === kw)) {
          return acc + 1;
        }
        return acc;
      }, 0);

      return {
        keyword,
        density: (count / totalWords) * 100,
        count,
      };
    });
  }

  private identifyContentGaps(html: string): string[] {
    const gaps = [];

    if (!html.includes('contact')) gaps.push('Contact information');
    if (!html.includes('about')) gaps.push('About section');
    if (!html.includes('testimonial') && !html.includes('review'))
      gaps.push('Testimonials or reviews');
    if (!html.includes('faq')) gaps.push('FAQ section');

    return gaps;
  }
}
