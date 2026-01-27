/**
 * Client-Side Content Storage Service
 * Uses Local Forage (IndexedDB) for storing Puppeteer scraped content
 * Provides fast local access without server round-trips
 */

import localforage from 'localforage';

export interface CachedComprehensiveData {
  url: string;
  comprehensiveData: any; // Full PuppeteerComprehensiveCollector result
  existingData: any; // Transformed existing data
  timestamp: string;
  expiresAt: string; // ISO date string
  storedSnapshotId?: string; // Server-side snapshot ID if synced
}

export interface CachedAnalysisResult {
  url: string;
  result: any; // Full API response
  timestamp: string;
  expiresAt: string;
}

// Configure Local Forage
const contentStore = localforage.createInstance({
  name: 'ZeroBarriersContent',
  storeName: 'puppeteer_content', // IndexedDB store name
  description: 'Stores Puppeteer scraped content and analysis results',
});

const analysisStore = localforage.createInstance({
  name: 'ZeroBarriersContent',
  storeName: 'analysis_results', // Separate store for analysis results
  description: 'Stores analysis results',
});

// Cache expiration: 24 hours by default
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class ClientContentStorageService {
  /**
   * Store comprehensive Puppeteer data locally
   */
  static async storeComprehensiveData(
    url: string,
    comprehensiveData: any,
    existingData: any,
    storedSnapshotId?: string,
    ttl: number = DEFAULT_CACHE_TTL
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl);

      const cached: CachedComprehensiveData = {
        url,
        comprehensiveData,
        existingData,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        storedSnapshotId,
      };

      await contentStore.setItem(url, cached);
      console.log(`✅ Stored comprehensive data for ${url} in Local Forage`);
    } catch (error) {
      console.error('Failed to store comprehensive data in Local Forage:', error);
      throw error;
    }
  }

  /**
   * Get cached comprehensive data for a URL
   */
  static async getComprehensiveData(
    url: string
  ): Promise<CachedComprehensiveData | null> {
    try {
      const cached = await contentStore.getItem<CachedComprehensiveData>(url);

      if (!cached) {
        return null;
      }

      // Check if expired
      const expiresAt = new Date(cached.expiresAt);
      if (new Date() > expiresAt) {
        console.log(`⚠️ Cached data for ${url} has expired`);
        await contentStore.removeItem(url);
        return null;
      }

      console.log(`✅ Retrieved cached comprehensive data for ${url}`);
      return cached;
    } catch (error) {
      console.error('Failed to get comprehensive data from Local Forage:', error);
      return null;
    }
  }

  /**
   * Store analysis result locally
   */
  static async storeAnalysisResult(
    url: string,
    result: any,
    ttl: number = DEFAULT_CACHE_TTL
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl);

      const cached: CachedAnalysisResult = {
        url,
        result,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      await analysisStore.setItem(url, cached);
      console.log(`✅ Stored analysis result for ${url} in Local Forage`);
    } catch (error) {
      console.error('Failed to store analysis result in Local Forage:', error);
      throw error;
    }
  }

  /**
   * Get cached analysis result
   */
  static async getAnalysisResult(
    url: string
  ): Promise<CachedAnalysisResult | null> {
    try {
      const cached = await analysisStore.getItem<CachedAnalysisResult>(url);

      if (!cached) {
        return null;
      }

      // Check if expired
      const expiresAt = new Date(cached.expiresAt);
      if (new Date() > expiresAt) {
        console.log(`⚠️ Cached analysis result for ${url} has expired`);
        await analysisStore.removeItem(url);
        return null;
      }

      return cached;
    } catch (error) {
      console.error('Failed to get analysis result from Local Forage:', error);
      return null;
    }
  }

  /**
   * Get SEO metadata from cached data
   */
  static async getSEOMetadata(url: string): Promise<{
    metaTags: any;
    keywords: any;
    analytics: any;
  } | null> {
    const cached = await this.getComprehensiveData(url);
    if (!cached) return null;

    const firstPage = cached.comprehensiveData.pages?.[0];
    return {
      metaTags: firstPage?.metaTags || {},
      keywords: firstPage?.keywords || {},
      analytics: firstPage?.analytics || {},
    };
  }

  /**
   * Get all keywords from cached data
   */
  static async getAllKeywords(url: string): Promise<string[]> {
    const cached = await this.getComprehensiveData(url);
    if (!cached) return [];

    return (
      cached.comprehensiveData.pages?.flatMap(
        (p: any) => p.keywords?.allKeywords || []
      ) || []
    );
  }

  /**
   * Get GA4 IDs from cached data
   */
  static async getGA4Ids(url: string): Promise<string[]> {
    const cached = await this.getComprehensiveData(url);
    if (!cached) return [];

    return (
      cached.comprehensiveData.pages?.flatMap(
        (p: any) => p.analytics?.googleAnalytics4?.measurementIds || []
      ) || []
    );
  }

  /**
   * Clear cached data for a URL
   */
  static async clearCache(url: string): Promise<void> {
    try {
      await Promise.all([
        contentStore.removeItem(url),
        analysisStore.removeItem(url),
      ]);
      console.log(`✅ Cleared cache for ${url}`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Clear all cached content
   */
  static async clearAllCache(): Promise<void> {
    try {
      await Promise.all([contentStore.clear(), analysisStore.clear()]);
      console.log('✅ Cleared all cached content');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Get all cached URLs
   */
  static async getAllCachedUrls(): Promise<string[]> {
    try {
      const keys = await contentStore.keys();
      return keys as string[];
    } catch (error) {
      console.error('Failed to get cached URLs:', error);
      return [];
    }
  }

  /**
   * Get cache size info (approximate)
   */
  static async getCacheInfo(): Promise<{
    urlCount: number;
    totalSize: number; // Approximate in bytes
  }> {
    try {
      const urls = await this.getAllCachedUrls();
      let totalSize = 0;

      for (const url of urls) {
        const cached = await contentStore.getItem(url);
        if (cached) {
          totalSize += JSON.stringify(cached).length;
        }
      }

      return {
        urlCount: urls.length,
        totalSize,
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return { urlCount: 0, totalSize: 0 };
    }
  }
}

