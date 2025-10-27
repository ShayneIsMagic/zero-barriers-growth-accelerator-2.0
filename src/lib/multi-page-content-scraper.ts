/**
 * Multi-Page Content Scraper
 * Discovers and scrapes content from multiple pages of a website
 */

import { ScrapedData, scrapeWebsiteContent } from './reliable-content-scraper';

export interface MultiPageScrapedData {
  homepage: ScrapedData;
  additionalPages: {
    url: string;
    data: ScrapedData;
    pageType: string;
    priority: number;
  }[];
  siteMap: {
    totalPages: number;
    discoveredPages: string[];
    pageTypes: { [key: string]: number };
  };
  comprehensiveContent: {
    allText: string;
    allHeadings: string[];
    allKeywords: string[];
    contentThemes: string[];
  };
}

export interface PageDiscoveryOptions {
  maxPages?: number;
  includeSubpages?: boolean;
  includeBlog?: boolean;
  includeProducts?: boolean;
  includeAbout?: boolean;
  includeContact?: boolean;
  includeServices?: boolean;
  maxDepth?: number;
}

export class MultiPageContentScraper {
  /**
   * Scrape multiple pages from a website
   */
  static async scrapeMultiPageContent(
    baseUrl: string,
    options: PageDiscoveryOptions = {}
  ): Promise<MultiPageScrapedData> {
    const {
      maxPages = 10,
      includeSubpages = true,
      includeBlog = true,
      includeProducts = true,
      includeAbout = true,
      includeContact = true,
      includeServices = true,
      maxDepth = 2,
    } = options;

    console.log(`🌐 Starting multi-page content scraping for: ${baseUrl}`);
    console.log(`📊 Max pages: ${maxPages}, Max depth: ${maxDepth}`);

    try {
      // Step 1: Scrape homepage
      console.log('🏠 Step 1: Scraping homepage...');
      const homepage = await scrapeWebsiteContent(baseUrl);

      // Step 2: Discover additional pages
      console.log('🔍 Step 2: Discovering additional pages...');
      const discoveredPages = await this.discoverPages(baseUrl, {
        maxPages: maxPages - 1, // -1 for homepage
        includeSubpages,
        includeBlog,
        includeProducts,
        includeAbout,
        includeContact,
        includeServices,
        maxDepth,
      });

      // Step 3: Scrape discovered pages
      console.log(
        `📄 Step 3: Scraping ${discoveredPages.length} additional pages...`
      );
      const additionalPages = await this.scrapeDiscoveredPages(discoveredPages);

      // Step 4: Analyze and categorize pages
      const pageTypes = this.categorizePages(discoveredPages);

      // Step 5: Create comprehensive content analysis
      const comprehensiveContent = this.createComprehensiveContent(
        homepage,
        additionalPages
      );

      console.log(
        `✅ Multi-page scraping completed: ${additionalPages.length + 1} pages total`
      );

      return {
        homepage,
        additionalPages,
        siteMap: {
          totalPages: additionalPages.length + 1,
          discoveredPages: discoveredPages.map((p) => p.url),
          pageTypes,
        },
        comprehensiveContent,
      };
    } catch (error) {
      console.error('Multi-page scraping failed:', error);
      throw error;
    }
  }

  /**
   * Discover additional pages from the homepage
   */
  private static async discoverPages(
    baseUrl: string,
    options: PageDiscoveryOptions
  ): Promise<{ url: string; pageType: string; priority: number }[]> {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.goto(baseUrl, { waitUntil: 'networkidle2' });

      // Extract all internal links
      const links = await page.evaluate((baseDomain) => {
        const allLinks = Array.from(document.querySelectorAll('a[href]'));
        const internalLinks = new Set<string>();

        allLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (!href) return;

          let fullUrl: string;
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = `${baseDomain}${href}`;
          } else {
            fullUrl = `${baseDomain}/${href}`;
          }

          // Check if it's an internal link
          try {
            const linkUrl = new URL(fullUrl);
            const baseUrl = new URL(baseDomain);
            if (linkUrl.hostname === baseUrl.hostname) {
              internalLinks.add(fullUrl);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        });

        return Array.from(internalLinks);
      }, baseUrl);

      // Categorize and prioritize pages
      const categorizedPages = this.categorizeAndPrioritizePages(
        links,
        baseUrl,
        options
      );

      return categorizedPages.slice(0, options.maxPages || 10);
    } finally {
      await browser.close();
    }
  }

  /**
   * Categorize and prioritize discovered pages
   */
  private static categorizeAndPrioritizePages(
    links: string[],
    baseUrl: string,
    options: PageDiscoveryOptions
  ): { url: string; pageType: string; priority: number }[] {
    const categorized: { url: string; pageType: string; priority: number }[] =
      [];

    links.forEach((link) => {
      const url = new URL(link);
      const path = url.pathname.toLowerCase();
      let pageType = 'other';
      let priority = 1;

      // Categorize by URL patterns
      if (path === '/' || path === '') {
        return; // Skip homepage (already scraped)
      }

      if (
        path.includes('/blog/') ||
        path.includes('/news/') ||
        path.includes('/articles/')
      ) {
        pageType = 'blog';
        priority = options.includeBlog ? 3 : 0;
      } else if (
        path.includes('/product') ||
        path.includes('/shop/') ||
        path.includes('/store/')
      ) {
        pageType = 'products';
        priority = options.includeProducts ? 4 : 0;
      } else if (
        path.includes('/about') ||
        path.includes('/company') ||
        path.includes('/team')
      ) {
        pageType = 'about';
        priority = options.includeAbout ? 2 : 0;
      } else if (path.includes('/contact') || path.includes('/support')) {
        pageType = 'contact';
        priority = options.includeContact ? 2 : 0;
      } else if (path.includes('/service') || path.includes('/solutions')) {
        pageType = 'services';
        priority = options.includeServices ? 3 : 0;
      } else if (path.includes('/pricing') || path.includes('/plans')) {
        pageType = 'pricing';
        priority = 4;
      } else if (path.includes('/features') || path.includes('/how-it-works')) {
        pageType = 'features';
        priority = 3;
      } else if (path.includes('/faq') || path.includes('/help')) {
        pageType = 'support';
        priority = 2;
      } else if (options.includeSubpages && path.split('/').length <= 3) {
        pageType = 'subpage';
        priority = 2;
      }

      if (priority > 0) {
        categorized.push({ url: link, pageType, priority });
      }
    });

    // Sort by priority (higher first), then alphabetically
    return categorized.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });
  }

  /**
   * Scrape discovered pages
   */
  private static async scrapeDiscoveredPages(
    pages: { url: string; pageType: string; priority: number }[]
  ): Promise<
    { url: string; data: ScrapedData; pageType: string; priority: number }[]
  > {
    const results = [];

    for (const page of pages) {
      try {
        console.log(`📄 Scraping ${page.pageType}: ${page.url}`);
        const data = await scrapeWebsiteContent(page.url);
        results.push({
          url: page.url,
          data,
          pageType: page.pageType,
          priority: page.priority,
        });
      } catch (error) {
        console.warn(`⚠️ Failed to scrape ${page.url}:`, error);
        // Continue with other pages
      }
    }

    return results;
  }

  /**
   * Categorize pages by type
   */
  private static categorizePages(
    pages: { url: string; pageType: string; priority: number }[]
  ): { [key: string]: number } {
    const pageTypes: { [key: string]: number } = {};

    pages.forEach((page) => {
      pageTypes[page.pageType] = (pageTypes[page.pageType] || 0) + 1;
    });

    return pageTypes;
  }

  /**
   * Create comprehensive content analysis from all pages
   */
  private static createComprehensiveContent(
    homepage: ScrapedData,
    additionalPages: {
      url: string;
      data: ScrapedData;
      pageType: string;
      priority: number;
    }[]
  ): {
    allText: string;
    allHeadings: string[];
    allKeywords: string[];
    contentThemes: string[];
  } {
    // Combine all text content
    const allTexts = [homepage.cleanText];
    const allHeadings = [
      ...homepage.headings.h1,
      ...homepage.headings.h2,
      ...homepage.headings.h3,
    ];
    const allKeywords = [...homepage.extractedKeywords];

    additionalPages.forEach((page) => {
      allTexts.push(page.data.cleanText);
      allHeadings.push(
        ...page.data.headings.h1,
        ...page.data.headings.h2,
        ...page.data.headings.h3
      );
      allKeywords.push(...page.data.extractedKeywords);
    });

    // Remove duplicates and create comprehensive content
    const uniqueKeywords = [...new Set(allKeywords)];
    const uniqueHeadings = [...new Set(allHeadings)];

    // Identify content themes based on headings and keywords
    const contentThemes = this.identifyContentThemes(
      uniqueHeadings,
      uniqueKeywords
    );

    return {
      allText: allTexts.join('\n\n--- PAGE BREAK ---\n\n'),
      allHeadings: uniqueHeadings,
      allKeywords: uniqueKeywords,
      contentThemes,
    };
  }

  /**
   * Identify content themes from headings and keywords
   */
  private static identifyContentThemes(
    headings: string[],
    keywords: string[]
  ): string[] {
    const themes = new Set<string>();

    // Common business themes
    const themePatterns = [
      { pattern: /product|service|solution/i, theme: 'Products & Services' },
      { pattern: /about|company|team|mission/i, theme: 'Company & Team' },
      { pattern: /pricing|cost|plan|subscription/i, theme: 'Pricing & Plans' },
      { pattern: /contact|support|help|faq/i, theme: 'Support & Contact' },
      { pattern: /blog|news|article|insights/i, theme: 'Content & Blog' },
      {
        pattern: /feature|capability|function/i,
        theme: 'Features & Capabilities',
      },
      {
        pattern: /security|privacy|compliance/i,
        theme: 'Security & Compliance',
      },
      {
        pattern: /integration|api|developer/i,
        theme: 'Integration & Development',
      },
    ];

    const allText = [...headings, ...keywords].join(' ').toLowerCase();

    themePatterns.forEach(({ pattern, theme }) => {
      if (pattern.test(allText)) {
        themes.add(theme);
      }
    });

    return Array.from(themes);
  }
}
