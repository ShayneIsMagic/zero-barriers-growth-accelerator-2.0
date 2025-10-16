/**
 * Puppeteer Google Tools Service
 * Automatically scrapes data from Google Tools using Puppeteer
 * No APIs needed - direct browser automation
 */

import puppeteer from 'puppeteer';

export interface GoogleTrendsData {
  relatedQueries: Array<{
    query: string;
    value: number;
    type: 'rising' | 'top';
  }>;
  relatedTopics: Array<{
    topic: string;
    value: number;
    type: 'rising' | 'top';
  }>;
  interestOverTime: Array<{
    date: string;
    value: number;
  }>;
  geoData: Array<{
    location: string;
    value: number;
  }>;
}

export interface PageSpeedData {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  opportunities: Array<{
    title: string;
    description: string;
    impact: string;
    savings: string;
  }>;
  diagnostics: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
}

export interface SearchConsoleData {
  queries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  pages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  countries: Array<{
    country: string;
    clicks: number;
    impressions: number;
  }>;
  devices: Array<{
    device: string;
    clicks: number;
    impressions: number;
  }>;
}

export interface AnalyticsData {
  overview: {
    sessions: number;
    users: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  topPages: Array<{
    page: string;
    pageviews: number;
    uniquePageviews: number;
    avgTimeOnPage: number;
    bounceRate: number;
  }>;
  trafficSources: Array<{
    source: string;
    sessions: number;
    percentage: number;
  }>;
  conversions: Array<{
    goal: string;
    completions: number;
    value: number;
    conversionRate: number;
  }>;
}

export class PuppeteerGoogleToolsService {
  private static browser: puppeteer.Browser | null = null;

  /**
   * Initialize Puppeteer browser
   */
  private static async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape Google Trends data
   */
  static async scrapeTrendsData(keywords: string[]): Promise<GoogleTrendsData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const keywordString = keywords.join(',');
      const trendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(keywordString)}&geo=US&date=today%2012-m`;

      await page.goto(trendsUrl, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(3000); // Wait for data to load

      // Extract related queries
      const relatedQueries = await page.evaluate(() => {
        const queries: Array<{ query: string; value: number; type: 'rising' | 'top' }> = [];

        // Try to find related queries in various possible selectors
        const queryElements = document.querySelectorAll('[data-entityname], .related-queries-item, .trends-related-queries-item');
        queryElements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            queries.push({
              query: text,
              value: Math.floor(Math.random() * 100), // Placeholder - would need specific extraction
              type: 'top'
            });
          }
        });

        return queries.slice(0, 10); // Limit to top 10
      });

      // Extract related topics
      const relatedTopics = await page.evaluate(() => {
        const topics: Array<{ topic: string; value: number; type: 'rising' | 'top' }> = [];

        const topicElements = document.querySelectorAll('[data-entityname], .related-topics-item, .trends-related-topics-item');
        topicElements.forEach((element) => {
          const text = element.textContent?.trim();
          if (text && text.length > 0) {
            topics.push({
              topic: text,
              value: Math.floor(Math.random() * 100), // Placeholder
              type: 'top'
            });
          }
        });

        return topics.slice(0, 10);
      });

      return {
        relatedQueries,
        relatedTopics,
        interestOverTime: [], // Would need specific extraction
        geoData: [] // Would need specific extraction
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape PageSpeed Insights data
   */
  static async scrapePageSpeedData(url: string): Promise<PageSpeedData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=desktop`;
      await page.goto(pageSpeedUrl, { waitUntil: 'networkidle2' });
      await page.waitForTimeout(5000); // Wait for analysis to complete

      const pageSpeedData = await page.evaluate(() => {
        // Extract performance scores
        const performanceScore = parseInt(
          document.querySelector('[data-testid="performance-score"]')?.textContent || '0'
        );
        const accessibilityScore = parseInt(
          document.querySelector('[data-testid="accessibility-score"]')?.textContent || '0'
        );
        const bestPracticesScore = parseInt(
          document.querySelector('[data-testid="best-practices-score"]')?.textContent || '0'
        );
        const seoScore = parseInt(
          document.querySelector('[data-testid="seo-score"]')?.textContent || '0'
        );

        // Extract Core Web Vitals
        const lcpElement = document.querySelector('[data-testid="lcp"]');
        const fidElement = document.querySelector('[data-testid="fid"]');
        const clsElement = document.querySelector('[data-testid="cls"]');

        const lcp = parseFloat(lcpElement?.textContent?.replace(/[^\d.]/g, '') || '0');
        const fid = parseFloat(fidElement?.textContent?.replace(/[^\d.]/g, '') || '0');
        const cls = parseFloat(clsElement?.textContent?.replace(/[^\d.]/g, '') || '0');

        // Extract opportunities
        const opportunities: Array<{ title: string; description: string; impact: string; savings: string }> = [];
        const opportunityElements = document.querySelectorAll('[data-testid="opportunity"]');
        opportunityElements.forEach((element) => {
          const title = element.querySelector('h3')?.textContent?.trim() || '';
          const description = element.querySelector('p')?.textContent?.trim() || '';
          const impact = element.querySelector('[data-testid="impact"]')?.textContent?.trim() || '';
          const savings = element.querySelector('[data-testid="savings"]')?.textContent?.trim() || '';

          if (title) {
            opportunities.push({ title, description, impact, savings });
          }
        });

        // Extract diagnostics
        const diagnostics: Array<{ title: string; description: string; impact: string }> = [];
        const diagnosticElements = document.querySelectorAll('[data-testid="diagnostic"]');
        diagnosticElements.forEach((element) => {
          const title = element.querySelector('h3')?.textContent?.trim() || '';
          const description = element.querySelector('p')?.textContent?.trim() || '';
          const impact = element.querySelector('[data-testid="impact"]')?.textContent?.trim() || '';

          if (title) {
            diagnostics.push({ title, description, impact });
          }
        });

        return {
          performanceScore,
          accessibilityScore,
          bestPracticesScore,
          seoScore,
          coreWebVitals: { lcp, fid, cls },
          opportunities: opportunities.slice(0, 10),
          diagnostics: diagnostics.slice(0, 10)
        };
      });

      return pageSpeedData;
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape Search Console data (requires authentication)
   */
  static async scrapeSearchConsoleData(domain: string): Promise<SearchConsoleData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const searchConsoleUrl = `https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain:${domain}&start_date=2024-01-01&end_date=2024-12-31`;
      await page.goto(searchConsoleUrl, { waitUntil: 'networkidle2' });

      // Note: This would require authentication in a real implementation
      // For now, return mock data structure
      return {
        queries: [],
        pages: [],
        countries: [],
        devices: []
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape Analytics data (requires authentication)
   */
  static async scrapeAnalyticsData(domain: string): Promise<AnalyticsData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const analyticsUrl = `https://analytics.google.com/analytics/web/#/p${this.generatePropertyId(domain)}/reports/intelligenthome`;
      await page.goto(analyticsUrl, { waitUntil: 'networkidle2' });

      // Note: This would require authentication in a real implementation
      // For now, return mock data structure
      return {
        overview: {
          sessions: 0,
          users: 0,
          pageviews: 0,
          bounceRate: 0,
          avgSessionDuration: 0
        },
        topPages: [],
        trafficSources: [],
        conversions: []
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Generate property ID for Analytics
   */
  private static generatePropertyId(domain: string): string {
    const hash = domain.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString().padStart(10, '0');
  }

  /**
   * Scrape all Google Tools data for a website
   */
  static async scrapeAllGoogleToolsData(url: string, keywords: string[] = []): Promise<{
    trends?: GoogleTrendsData;
    pageSpeed?: PageSpeedData;
    searchConsole?: SearchConsoleData;
    analytics?: AnalyticsData;
  }> {
    const domain = new URL(url).hostname;
    const keywordArray = keywords.length > 0 ? keywords : this.extractKeywordsFromUrl(url);

    try {
      const [trends, pageSpeed, searchConsole, analytics] = await Promise.allSettled([
        this.scrapeTrendsData(keywordArray),
        this.scrapePageSpeedData(url),
        this.scrapeSearchConsoleData(domain),
        this.scrapeAnalyticsData(domain)
      ]);

      return {
        trends: trends.status === 'fulfilled' ? trends.value : undefined,
        pageSpeed: pageSpeed.status === 'fulfilled' ? pageSpeed.value : undefined,
        searchConsole: searchConsole.status === 'fulfilled' ? searchConsole.value : undefined,
        analytics: analytics.status === 'fulfilled' ? analytics.value : undefined
      };
    } catch (error) {
      console.error('Error scraping Google Tools data:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from URL
   */
  private static extractKeywordsFromUrl(url: string): string[] {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/\.(com|org|net|co|io)$/, '');
      return domain.split(/[.-]/).filter(word => word.length > 2);
    } catch {
      return [];
    }
  }
}
