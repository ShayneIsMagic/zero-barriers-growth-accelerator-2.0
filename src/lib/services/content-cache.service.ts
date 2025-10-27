/**
 * Content Cache Service
 * Stores scraped content for reuse across multiple assessments
 * Prevents redundant scraping when running multiple analyses
 */

export interface CachedContent {
  url: string;
  title: string;
  metaDescription: string;
  wordCount: number;
  cleanText: string;
  extractedKeywords: string[];
  headings: { h1: string[]; h2: string[]; h3: string[] };
  scrapedAt: string;
  expiresAt: string;
}

export class ContentCacheService {
  private static cache: Map<string, CachedContent> = new Map();
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Get content from cache or scrape if not available
   */
  static async getContent(
    url: string,
    scraper: () => Promise<any>
  ): Promise<CachedContent> {
    const cacheKey = this.normalizeUrl(url);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      console.log('📦 Using cached content for:', url);
      return cached;
    }

    // Scrape fresh content
    console.log('🔍 Scraping fresh content for:', url);
    const existingData = await scraper();

    const content: CachedContent = {
      url,
      title: existingData.title || 'Untitled',
      metaDescription: existingData.metaDescription || '',
      wordCount: existingData.wordCount || 0,
      cleanText: existingData.cleanText || '',
      extractedKeywords: existingData.extractedKeywords || [],
      headings: existingData.headings || { h1: [], h2: [], h3: [] },
      scrapedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.CACHE_DURATION).toISOString(),
    };

    // Store in cache
    this.cache.set(cacheKey, content);

    return content;
  }

  /**
   * Check if content is already cached
   */
  static hasContent(url: string): boolean {
    const cacheKey = this.normalizeUrl(url);
    const cached = this.cache.get(cacheKey);
    return cached !== undefined && new Date(cached.expiresAt) > new Date();
  }

  /**
   * Get cached content without scraping
   */
  static getCachedContent(url: string): CachedContent | null {
    const cacheKey = this.normalizeUrl(url);
    const cached = this.cache.get(cacheKey);

    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached;
    }

    return null;
  }

  /**
   * Invalidate cache for a URL
   */
  static invalidate(url: string): void {
    const cacheKey = this.normalizeUrl(url);
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cached content
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    entries: Array<{ url: string; scrapedAt: string }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([url, content]) => ({
      url,
      scrapedAt: content.scrapedAt,
    }));

    return {
      size: this.cache.size,
      entries,
    };
  }

  /**
   * Normalize URL for cache key
   */
  private static normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url;
    }
  }
}
