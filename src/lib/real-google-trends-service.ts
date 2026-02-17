// @ts-ignore - google-trends-api doesn't have types
import googleTrends from 'google-trends-api';

export interface GoogleTrendsData {
  keyword: string;
  interestOverTime: any[];
  relatedQueries: any[];
  relatedTopics: any[];
  regionalInterest: any[];
  trending: boolean;
  peakInterest: number;
  currentInterest: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  timeframe: string;
  error?: string;
}

export class RealGoogleTrendsService {
  private url: string;
  private extractedKeywords: string[];

  constructor(url: string, extractedKeywords: string[] = []) {
    this.url = url;
    this.extractedKeywords = extractedKeywords;
  }

  /**
   * Get real Google Trends data for a keyword
   */
  async getTrendsData(
    keyword: string,
    timeframe: string = 'today 12-m'
  ): Promise<GoogleTrendsData> {
    try {
      console.log(`📈 Getting real Google Trends data for: ${keyword}`);

      // Get interest over time data
      const interestOverTime = await this.getInterestOverTime(
        keyword,
        timeframe
      );

      // Get related queries
      const relatedQueries = await this.getRelatedQueries(keyword);

      // Get related topics
      const relatedTopics = await this.getRelatedTopics(keyword);

      // Get regional interest
      const regionalInterest = await this.getRegionalInterest(keyword);

      // Analyze trend direction
      const trendAnalysis = this.analyzeTrendDirection(interestOverTime);

      // Check if trending
      const trending = await this.isTrending(keyword);

      return {
        keyword,
        interestOverTime: interestOverTime || [],
        relatedQueries: relatedQueries || [],
        relatedTopics: relatedTopics || [],
        regionalInterest: regionalInterest || [],
        trending,
        peakInterest: trendAnalysis.peak,
        currentInterest: trendAnalysis.current,
        trendDirection: trendAnalysis.direction,
        timeframe,
      };
    } catch (error) {
      console.error(`❌ Google Trends API error for ${keyword}:`, error);
      return {
        keyword,
        interestOverTime: [],
        relatedQueries: [],
        relatedTopics: [],
        regionalInterest: [],
        trending: false,
        peakInterest: 0,
        currentInterest: 0,
        trendDirection: 'stable',
        timeframe,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get interest over time data
   */
  private async getInterestOverTime(
    keyword: string,
    _timeframe: string
  ): Promise<any[]> {
    try {
      const response = await googleTrends.interestOverTime({
        keyword,
        startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        endTime: new Date(),
        geo: 'US', // Default to US, can be made configurable
      });

      const data = JSON.parse(response);
      return data.default?.timelineData || [];
    } catch (error) {
      console.error(`Interest over time error for ${keyword}:`, error);
      return [];
    }
  }

  /**
   * Get related queries
   */
  private async getRelatedQueries(keyword: string): Promise<any[]> {
    try {
      const response = await googleTrends.relatedQueries({
        keyword,
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        endTime: new Date(),
        geo: 'US',
      });

      const data = JSON.parse(response);
      return data.default?.rankedList || [];
    } catch (error) {
      console.error(`Related queries error for ${keyword}:`, error);
      return [];
    }
  }

  /**
   * Get related topics
   */
  private async getRelatedTopics(keyword: string): Promise<any[]> {
    try {
      const response = await googleTrends.relatedTopics({
        keyword,
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        endTime: new Date(),
        geo: 'US',
      });

      const data = JSON.parse(response);
      return data.default?.rankedList || [];
    } catch (error) {
      console.error(`Related topics error for ${keyword}:`, error);
      return [];
    }
  }

  /**
   * Get regional interest
   */
  private async getRegionalInterest(keyword: string): Promise<any[]> {
    try {
      const response = await googleTrends.interestByRegion({
        keyword,
        startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
        endTime: new Date(),
        geo: 'US',
        resolution: 'COUNTRY',
      });

      const data = JSON.parse(response);
      return data.default?.geoMapData || [];
    } catch (error) {
      console.error(`Regional interest error for ${keyword}:`, error);
      return [];
    }
  }

  /**
   * Analyze trend direction from interest over time data
   */
  private analyzeTrendDirection(interestData: any[]): {
    peak: number;
    current: number;
    direction: 'rising' | 'falling' | 'stable';
  } {
    if (!interestData || interestData.length === 0) {
      return { peak: 0, current: 0, direction: 'stable' };
    }

    // Get peak interest
    const peak = Math.max(...interestData.map((d) => d.value || 0));

    // Get current interest (last 30 days average)
    const recentData = interestData.slice(-30);
    const current =
      recentData.length > 0
        ? recentData.reduce((sum, d) => sum + (d.value || 0), 0) /
          recentData.length
        : 0;

    // Get trend direction (compare first half vs second half)
    const midpoint = Math.floor(interestData.length / 2);
    const firstHalf = interestData.slice(0, midpoint);
    const secondHalf = interestData.slice(midpoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, d) => sum + (d.value || 0), 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, d) => sum + (d.value || 0), 0) /
      secondHalf.length;

    let direction: 'rising' | 'falling' | 'stable' = 'stable';
    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (changePercent > 10) direction = 'rising';
    else if (changePercent < -10) direction = 'falling';

    return { peak, current, direction };
  }

  /**
   * Check if keyword is currently trending
   */
  private async isTrending(keyword: string): Promise<boolean> {
    try {
      // Check if keyword appears in trending searches
      const response = await googleTrends.realTimeTrends({
        geo: 'US',
        category: 'all',
      });

      const data = JSON.parse(response);
      const trendingKeywords =
        data.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

      return trendingKeywords.some(
        (trend: any) =>
          trend.title?.query?.toLowerCase().includes(keyword.toLowerCase()) ||
          trend.formattedTraffic?.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error(`Trending check error for ${keyword}:`, error);
      return false;
    }
  }

  /**
   * Get trends data for multiple keywords
   */
  async getMultipleKeywordsTrends(
    keywords: string[]
  ): Promise<GoogleTrendsData[]> {
    console.log(`📊 Getting trends data for ${keywords.length} keywords`);

    const results: GoogleTrendsData[] = [];

    // Process keywords with rate limiting
    for (const keyword of keywords.slice(0, 5)) {
      // Limit to 5 keywords to avoid rate limits
      try {
        const trendData = await this.getTrendsData(keyword);
        results.push(trendData);

        // Add delay between requests to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error getting trends for ${keyword}:`, error);
        results.push({
          keyword,
          interestOverTime: [],
          relatedQueries: [],
          relatedTopics: [],
          regionalInterest: [],
          trending: false,
          peakInterest: 0,
          currentInterest: 0,
          trendDirection: 'stable',
          timeframe: 'today 12-m',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get trending keywords in a specific category
   */
  async getTrendingKeywords(category: string = 'all'): Promise<string[]> {
    try {
      console.log(`🔥 Getting trending keywords for category: ${category}`);

      const response = await googleTrends.realTimeTrends({
        geo: 'US',
        category: category,
      });

      const data = JSON.parse(response);
      const trendingSearches =
        data.default?.trendingSearchesDays?.[0]?.trendingSearches || [];

      return trendingSearches
        .map((trend: any) => trend.title?.query || '')
        .filter(Boolean);
    } catch (error) {
      console.error(`Trending keywords error:`, error);
      return [];
    }
  }

  /**
   * Validate if keyword has sufficient search volume
   */
  async validateKeywordVolume(keyword: string): Promise<{
    hasVolume: boolean;
    volumeLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  }> {
    try {
      const trendData = await this.getTrendsData(keyword, 'today 12-m');

      const avgInterest = trendData.currentInterest;

      let volumeLevel: 'low' | 'medium' | 'high' = 'low';
      let hasVolume = false;
      let recommendation = '';

      if (avgInterest > 70) {
        volumeLevel = 'high';
        hasVolume = true;
        recommendation = 'High search volume - good for targeting';
      } else if (avgInterest > 30) {
        volumeLevel = 'medium';
        hasVolume = true;
        recommendation = 'Medium search volume - consider targeting';
      } else if (avgInterest > 10) {
        volumeLevel = 'low';
        hasVolume = true;
        recommendation = 'Low search volume - niche opportunity';
      } else {
        recommendation = 'Very low search volume - may not be worth targeting';
      }

      return { hasVolume, volumeLevel, recommendation };
    } catch (error) {
      console.error(`Keyword volume validation error:`, error);
      return {
        hasVolume: false,
        volumeLevel: 'low',
        recommendation: 'Unable to validate search volume',
      };
    }
  }
}
