import puppeteer, { Browser, Page } from 'puppeteer';

export interface ComprehensiveCollectionResult {
  url: string;
  timestamp: string;
  pages: PageData[];
  siteMap: SiteMapData;
  performance: PerformanceData;
  seo: SEOData;
  content: ContentData;
  technical: TechnicalData;
  userExperience: UserExperienceData;
  summary: CollectionSummary;
}

export interface PageData {
  url: string;
  pageLabel: string; // Page name from navbar/URL (e.g., "Home", "Services", "Results")
  pageType: string; // Page type (e.g., "homepage", "services", "results", "contact")
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  // Enhanced SEO metadata
  metaTags?: {
    title: string;
    description: string;
    keywords: string;
    author: string;
    robots: string;
    viewport: string;
    charset: string;
    language: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    ogSiteName: string;
    ogLocale: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    twitterSite: string;
    twitterCreator: string;
    geoRegion: string;
    geoPlacename: string;
    geoPosition: string;
    revisitAfter: string;
    rating: string;
    distribution: string;
    copyright: string;
    generator: string;
    applicationName: string;
    themeColor: string;
    colorScheme: string;
    allMetaTags?: Array<{ name: string; content: string; httpEquiv: string }>;
  };
  // Analytics tracking data
  analytics?: {
    googleAnalytics4: {
      measurementIds: string[];
      config: any;
      scriptsFound: number;
    };
    googleTagManager: {
      containerIds: string[];
      scriptsFound: number;
    };
    facebookPixel: {
      pixelId: string | null;
      found: boolean;
    };
    otherAnalytics: string[];
    allAnalyticsScripts: string[];
  };
  // Comprehensive keywords
  keywords?: {
    metaKeywords: string[];
    contentKeywords: string[];
    headingKeywords: string[];
    altTextKeywords: string[];
    allKeywords: string[];
    keywordFrequency: Record<string, number>;
  };
  content: {
    text: string;
    wordCount: number;
    images: ImageData[];
    links: LinkData[];
    forms: FormData[];
    buttons: ButtonData[];
  };
  performance: {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
  };
  seo: {
    titleLength: number;
    metaDescriptionLength: number;
    headingStructure: string[];
    imageAltTexts: string[];
    internalLinks: number;
    externalLinks: number;
    canonicalUrl: string;
    robotsMeta: string;
    schemaMarkup: any[];
  };
  accessibility: {
    altTexts: string[];
    ariaLabels: string[];
    headingHierarchy: boolean;
    colorContrast: any;
    keyboardNavigation: boolean;
  };
  technical: {
    viewport: string;
    language: string;
    charset: string;
    cssFiles: string[];
    jsFiles: string[];
    errors: string[];
  };
  // HTML semantic tags for structure analysis
  tags?: {
    semanticTags: {
      article: number;
      section: number;
      nav: number;
      header: number;
      footer: number;
      aside: number;
      main: number;
      figure: number;
      figcaption: number;
      time: number;
      address: number;
      blockquote: number;
      details: number;
      summary: number;
    };
    semanticTagDetails: Array<{
      tag: string;
      count: number;
      hasId: boolean;
      hasClass: boolean;
      hasAriaLabel: boolean;
    }>;
    totalSemanticTags: number;
  };
}

export interface SiteMapData {
  totalPages: number;
  depth: number;
  orphanedPages: string[];
  brokenLinks: string[];
  redirects: RedirectData[];
  sitemap: SitemapEntry[];
}

export interface PerformanceData {
  overallScore: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  opportunities: OpportunityData[];
  diagnostics: DiagnosticData[];
}

export interface SEOData {
  overallScore: number;
  metaTags: MetaTagData;
  structuredData: StructuredData[];
  internalLinking: InternalLinkingData;
  externalLinking: ExternalLinkingData;
  contentQuality: ContentQualityData;
  technicalSEO: TechnicalSEOData;
}

export interface ContentData {
  totalWords: number;
  averageWordsPerPage: number;
  contentTypes: ContentTypeData[];
  topics: TopicData[];
  sentiment: SentimentData;
  readability: ReadabilityData;
}

export interface TechnicalData {
  serverInfo: ServerInfo;
  security: SecurityData;
  mobileOptimization: MobileData;
  caching: CachingData;
  compression: CompressionData;
}

export interface UserExperienceData {
  navigation: NavigationData;
  forms: FormUXData;
  callsToAction: CTAData;
  visualHierarchy: VisualHierarchyData;
  loadingStates: LoadingData;
}

export interface CollectionSummary {
  totalPages: number;
  totalWords: number;
  totalImages: number;
  totalLinks: number;
  averageLoadTime: number;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  contentScore: number;
  technicalScore: number;
  uxScore: number;
  criticalIssues: number;
  recommendations: number;
}

// Supporting interfaces
export interface ImageData {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  loading: string;
}

export interface LinkData {
  href: string;
  text: string;
  title: string;
  target: string;
  rel: string;
  isInternal: boolean;
  isBroken: boolean;
}

export interface FormData {
  action: string;
  method: string;
  inputs: FormInputData[];
  submitButton: string;
}

export interface FormInputData {
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
  label: string;
}

export interface ButtonData {
  text: string;
  type: string;
  class: string;
  onclick: string;
  ariaLabel: string;
}

export interface RedirectData {
  from: string;
  to: string;
  status: number;
  type: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: number;
  depth: number;
}

export interface OpportunityData {
  id: string;
  title: string;
  description: string;
  score: number;
  savings: string;
}

export interface DiagnosticData {
  id: string;
  title: string;
  description: string;
  score: number;
  details: string;
}

export interface MetaTagData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

export interface StructuredData {
  type: string;
  content: any;
  valid: boolean;
  errors: string[];
}

export interface InternalLinkingData {
  totalLinks: number;
  averagePerPage: number;
  anchorTexts: string[];
  linkEquity: number;
}

export interface ExternalLinkingData {
  totalLinks: number;
  nofollow: number;
  dofollow: number;
  domains: string[];
}

export interface ContentQualityData {
  uniqueness: number;
  depth: number;
  freshness: number;
  relevance: number;
  engagement: number;
}

export interface TechnicalSEOData {
  robotsTxt: boolean;
  sitemap: boolean;
  https: boolean;
  wwwRedirect: boolean;
  trailingSlash: boolean;
  duplicateContent: boolean;
}

export interface ContentTypeData {
  type: string;
  count: number;
  averageLength: number;
}

export interface TopicData {
  topic: string;
  frequency: number;
  relevance: number;
  sentiment: number;
}

export interface SentimentData {
  overall: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface ReadabilityData {
  fleschScore: number;
  gradeLevel: number;
  averageSentenceLength: number;
  averageSyllablesPerWord: number;
}

export interface ServerInfo {
  server: string;
  poweredBy: string;
  responseTime: number;
  statusCode: number;
}

export interface SecurityData {
  https: boolean;
  hsts: boolean;
  csp: boolean;
  xssProtection: boolean;
  contentTypeOptions: boolean;
}

export interface MobileData {
  responsive: boolean;
  viewport: string;
  touchFriendly: boolean;
  mobileFriendly: boolean;
}

export interface CachingData {
  cacheControl: string;
  etag: string;
  lastModified: string;
  expires: string;
}

export interface CompressionData {
  gzip: boolean;
  brotli: boolean;
  compressionRatio: number;
}

export interface NavigationData {
  mainMenu: MenuData;
  breadcrumbs: BreadcrumbData[];
  pagination: PaginationData;
  search: SearchData;
}

export interface MenuData {
  items: MenuItemData[];
  depth: number;
  mobileFriendly: boolean;
}

export interface MenuItemData {
  text: string;
  href: string;
  children: MenuItemData[];
}

export interface BreadcrumbData {
  text: string;
  href: string;
  position: number;
}

export interface PaginationData {
  current: number;
  total: number;
  next: string;
  previous: string;
}

export interface SearchData {
  present: boolean;
  placeholder: string;
  results: SearchResultData[];
}

export interface SearchResultData {
  title: string;
  description: string;
  url: string;
}

export interface FormUXData {
  totalForms: number;
  averageFields: number;
  validation: boolean;
  errorHandling: boolean;
  successMessages: boolean;
}

export interface CTAData {
  total: number;
  primary: CTADetailsData[];
  secondary: CTADetailsData[];
  averagePerPage: number;
}

export interface CTADetailsData {
  text: string;
  type: string;
  position: string;
  visibility: string;
}

export interface VisualHierarchyData {
  headingStructure: boolean;
  colorContrast: number;
  typography: TypographyData;
  spacing: SpacingData;
}

export interface TypographyData {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
}

export interface SpacingData {
  margin: string;
  padding: string;
  lineHeight: number;
}

export interface LoadingData {
  skeletonScreens: boolean;
  progressIndicators: boolean;
  errorStates: boolean;
  emptyStates: boolean;
}

export class PuppeteerComprehensiveCollector {
  private browser: Browser | null = null;
  private maxPages: number = 50;
  private maxDepth: number = 3;
  private timeout: number = 30000;

  constructor(
    options: {
      maxPages?: number;
      maxDepth?: number;
      timeout?: number;
    } = {}
  ) {
    this.maxPages = options.maxPages || 50;
    this.maxDepth = options.maxDepth || 3;
    this.timeout = options.timeout || 30000;
  }

  async collectComprehensiveData(
    url: string
  ): Promise<ComprehensiveCollectionResult> {
    console.log(`🚀 Starting comprehensive data collection for: ${url}`);

    try {
      // Check if we're in serverless environment
      const isServerless =
        process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

      // Try browserless.io first if configured (for serverless)
      if (isServerless) {
        const token = process.env.BROWSERLESS_TOKEN;
        if (token) {
          const browserWSEndpoint =
            process.env.BROWSERLESS_WS_ENDPOINT || 'wss://chrome.browserless.io';
          try {
            this.browser = await puppeteer.connect({
              browserWSEndpoint: `${browserWSEndpoint}?token=${token}`,
            });
            console.log('✅ Connected to browserless.io');
          } catch (error) {
            console.warn('⚠️ Browserless.io connection failed, using local launch:', error);
          }
        }
      }

      // Fallback to local launch (working approach from d0dfe75)
      // This simple approach works on Vercel without @sparticuz/chromium complexity
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
            '--disable-gpu',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
        });
        console.log('✅ Launched browser (simple approach - works on Vercel)');
      }

      const page = await this.browser.newPage();
      
      // Set viewport to match real browser
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Use current Chrome user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Add extra headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      });

      // Add stealth measures to avoid bot detection
      await page.evaluateOnNewDocument(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters: any) =>
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
            : originalQuery(parameters);

        // Mock chrome object
        (window as any).chrome = {
          runtime: {},
        };
      });

      // Enable performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.performance.mark('page-start');
      });

      // Navigate to homepage first to establish connection and verify it's accessible
      console.log(`🌐 Navigating to homepage: ${url}`);
      const homepageResponse = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.timeout,
      });

      // Check homepage response
      if (homepageResponse) {
        const status = homepageResponse.status();
        if (status === 403) {
          throw new Error(`Website blocked the scraper: ${url} (HTTP 403)`);
        }
        // 429 is rate limiting - log but don't fail completely
        if (status === 429) {
          console.warn(`⚠️ Rate limited for ${url} (HTTP 429), continuing...`);
        }
      }

      // Wait for page to fully load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify homepage isn't blocked
      const homepageBlocked = await this.isPageBlocked(page);
      if (homepageBlocked) {
        const contentLength = await page.evaluate(() => document.body?.textContent?.length || 0);
        if (contentLength < 100) {
          throw new Error(`Website blocked the scraper: ${url}`);
        }
      }

      // Collect site map and discover all pages
      const siteMap = await this.collectSiteMap(page, url);

      // Collect data from each page - use the same page but ensure stealth measures persist
      const pages: PageData[] = [];
      const visitedUrls = new Set<string>();

      // Collect homepage first
      try {
        const homepageData = await this.collectPageData(page, url);
        pages.push(homepageData);
        visitedUrls.add(url);
      } catch (error) {
        console.error(`Failed to collect homepage data from ${url}:`, error);
        // If homepage fails, we can't continue
        throw error;
      }

      // Then collect other pages
      for (const pageUrl of siteMap.sitemap.slice(0, this.maxPages)) {
        if (visitedUrls.has(pageUrl.url)) continue;
        visitedUrls.add(pageUrl.url);

        try {
          const pageData = await this.collectPageData(page, pageUrl.url);
          pages.push(pageData);
        } catch (error) {
          console.error(`Failed to collect data from ${pageUrl.url}:`, error);
          // Continue with other pages instead of failing completely
        }
      }

      // Collect overall performance data
      const performance = await this.collectPerformanceData(page, url);

      // Collect SEO data
      const seo = await this.collectSEOData(page, url);

      // Collect content data
      const content = await this.collectContentData(pages);

      // Collect technical data
      const technical = await this.collectTechnicalData(page, url);

      // Collect UX data
      const userExperience = await this.collectUserExperienceData(pages);

      // Generate summary
      const summary = this.generateSummary(
        pages,
        performance,
        seo,
        content,
        technical,
        userExperience
      );

      return {
        url,
        timestamp: new Date().toISOString(),
        pages,
        siteMap,
        performance,
        seo,
        content,
        technical,
        userExperience,
        summary,
      };
    } catch (error) {
      console.error('Comprehensive data collection failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async collectSiteMap(
    page: Page,
    startUrl: string
  ): Promise<SiteMapData> {
    console.log('🗺️ Collecting site map...');

    const visited = new Set<string>();
    const toVisit = [{ url: startUrl, depth: 0 }];
    const sitemap: SitemapEntry[] = [];
    const brokenLinks: string[] = [];
    const redirects: RedirectData[] = [];

    while (toVisit.length > 0 && visited.size < this.maxPages) {
      const { url, depth } = toVisit.shift()!;

      if (visited.has(url) || depth > this.maxDepth) continue;
      visited.add(url);

      try {
        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.timeout,
        });

        if (!response) {
          brokenLinks.push(url);
          continue;
        }

        const status = response.status();
        
        // Check for blocking
        if (status === 403 || status === 429) {
          console.warn(`⚠️ Blocked by ${url} (HTTP ${status})`);
          brokenLinks.push(url);
          continue;
        }
        if (status >= 300 && status < 400) {
          const location = response.headers().location;
          if (location) {
            redirects.push({
              from: url,
              to: location,
              status,
              type: status === 301 ? 'permanent' : 'temporary',
            });
          }
        }

        if (status >= 400) {
          brokenLinks.push(url);
          continue;
        }

        sitemap.push({
          url,
          lastModified: response.headers().date || new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: depth === 0 ? 1.0 : Math.max(0.1, 1.0 - depth * 0.2),
          depth,
        });

        // Find new links to visit
        const links = await page.evaluate(() => {
          const linkElements = Array.from(document.querySelectorAll('a[href]'));
          return linkElements
            .map((link) => {
              const href = link.getAttribute('href');
              if (!href) return null;

              try {
                const url = new URL(href, window.location.origin);
                return {
                  href: url.href,
                  text: link.textContent?.trim() || '',
                  isInternal: url.origin === window.location.origin,
                };
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        });

        for (const link of links) {
          if (link && link.isInternal && !visited.has(link.href)) {
            toVisit.push({ url: link.href, depth: depth + 1 });
          }
        }
      } catch (error) {
        console.error(`Error visiting ${url}:`, error);
        brokenLinks.push(url);
      }
    }

    return {
      totalPages: sitemap.length,
      depth: Math.max(...sitemap.map((entry) => entry.depth)),
      orphanedPages: [], // Would need more complex analysis
      brokenLinks,
      redirects,
      sitemap,
    };
  }

  /**
   * Check if page appears to be blocked
   */
  private async isPageBlocked(page: Page): Promise<boolean> {
    try {
      const pageContent = await page.content();
      const pageText = await page.evaluate(() => document.body?.textContent || '');
      const pageTitle = await page.evaluate(() => document.title || '');

      // Only check for CLEAR blocking indicators (not just mentions in content)
      // These must be in specific contexts to avoid false positives
      const blockingPatterns = [
        /access\s+denied/i,
        /access\s+forbidden/i,
        /403\s+forbidden/i,
        /you\s+have\s+been\s+blocked/i,
        /your\s+access\s+has\s+been\s+blocked/i,
        /bot\s+detected\s+and\s+blocked/i,
        /cloudflare\s+ray\s+id/i, // Cloudflare error pages have this
        /checking\s+your\s+browser\s+before\s+accessing/i,
        /ddos\s+protection\s+active/i,
        /rate\s+limit\s+exceeded/i,
      ];

      const contentToCheck = `${pageContent} ${pageText} ${pageTitle}`;

      // Check if any blocking pattern matches
      const hasBlockingIndicator = blockingPatterns.some((pattern) =>
        pattern.test(contentToCheck)
      );

      // Only consider blocked if we have clear blocking indicators
      // Don't use page size as blocking indicator (too many false positives)
      return hasBlockingIndicator;
    } catch {
      return false;
    }
  }

  private async collectPageData(page: Page, url: string): Promise<PageData> {
    console.log(`📄 Collecting data from: ${url}`);

    try {
      // Navigate with retry logic
      let response;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          response = await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: this.timeout,
          });
          break; // Success, exit retry loop
        } catch (navError) {
          if (retries === maxRetries) {
            throw navError;
          }
          retries++;
          console.log(`⚠️ Navigation retry ${retries}/${maxRetries} for ${url}`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }

      // Check HTTP status - only throw for clear blocking (403), not rate limiting (429)
      if (response) {
        const status = response.status();
        if (status === 403) {
          throw new Error(`Website blocked the scraper: ${url} (HTTP 403)`);
        }
        // 429 is rate limiting - log but don't fail completely
        if (status === 429) {
          console.warn(`⚠️ Rate limited for ${url} (HTTP 429), continuing...`);
        }
      }

      // Wait for dynamic content to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we got blocked - but be less aggressive
      const isBlocked = await this.isPageBlocked(page);

      if (isBlocked) {
        // Double-check by looking at actual content length
        const contentLength = await page.evaluate(() => document.body?.textContent?.length || 0);
        // Only throw if we're very sure it's blocked (very small content + blocking indicators)
        if (contentLength < 100) {
          throw new Error(`Website blocked the scraper: ${url}`);
        }
        // Otherwise, log warning but continue
        console.warn(`⚠️ Possible blocking detected for ${url}, but content length is ${contentLength}, continuing...`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('blocked')) {
        throw error;
      }
      // Re-throw navigation errors
      throw new Error(`Failed to load ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Identify page from navbar and URL before collecting data
    const pageInfo = await this.identifyPage(page, url);

    // Collect basic page data
    const pageData = await page.evaluate(() => {
      const getTextContent = (selector: string) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map((el) => el.textContent?.trim() || '');
      };

      const getImages = () => {
        const images = document.querySelectorAll('img');
        return Array.from(images).map((img) => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || '',
          width: img.naturalWidth || 0,
          height: img.naturalHeight || 0,
          loading: img.loading || 'eager',
        }));
      };

      const getLinks = () => {
        const links = document.querySelectorAll('a[href]');
        return Array.from(links)
          .map((link) => {
            const href = link.getAttribute('href');
            if (!href) return null;

            try {
              const url = new URL(href, window.location.origin);
              return {
                href: url.href,
                text: link.textContent?.trim() || '',
                title: (link as HTMLAnchorElement).title || '',
                target: (link as HTMLAnchorElement).target || '',
                rel: (link as HTMLAnchorElement).rel || '',
                isInternal: url.origin === window.location.origin,
                isBroken: false, // Would need to check
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      };

      const getForms = () => {
        const forms = document.querySelectorAll('form');
        return Array.from(forms).map((form) => ({
          action: form.action || '',
          method: form.method || 'get',
          inputs: Array.from(
            form.querySelectorAll('input, select, textarea')
          ).map((input) => ({
            type: (input as HTMLInputElement).type || 'text',
            name: (input as HTMLInputElement).name || '',
            placeholder: (input as HTMLInputElement).placeholder || '',
            required: (input as HTMLInputElement).required || false,
            label:
              (input as HTMLInputElement).labels?.[0]?.textContent?.trim() ||
              '',
          })),
          submitButton:
            form
              .querySelector('button[type="submit"], input[type="submit"]')
              ?.textContent?.trim() || '',
        }));
      };

      const getButtons = () => {
        const buttons = document.querySelectorAll(
          'button, input[type="button"], input[type="submit"]'
        );
        return Array.from(buttons).map((button) => ({
          text:
            button.textContent?.trim() ||
            (button as HTMLInputElement).value ||
            '',
          type: (button as HTMLInputElement).type || 'button',
          class: button.className || '',
          onclick: (button as HTMLElement).onclick?.toString() || '',
          ariaLabel: button.getAttribute('aria-label') || '',
        }));
      };

      const getHeadings = () => {
        return {
          h1: getTextContent('h1'),
          h2: getTextContent('h2'),
          h3: getTextContent('h3'),
          h4: getTextContent('h4'),
          h5: getTextContent('h5'),
          h6: getTextContent('h6'),
        };
      };

      const getMetaContent = (name: string) => {
        const meta = document.querySelector(
          `meta[name="${name}"], meta[property="${name}"]`
        );
        return meta?.getAttribute('content') || '';
      };

      const getMetaTags = () => {
        // Standard meta tags
        const standardMeta = {
          title: document.title,
          description: getMetaContent('description'),
          keywords: getMetaContent('keywords'),
          author: getMetaContent('author'),
          robots: getMetaContent('robots'),
          viewport: getMetaContent('viewport'),
          charset: document.characterSet || '',
          language: document.documentElement.lang || '',
          canonical:
            document
              .querySelector('link[rel="canonical"]')
              ?.getAttribute('href') || '',
        };

        // Open Graph tags
        const openGraph = {
          ogTitle: getMetaContent('og:title'),
          ogDescription: getMetaContent('og:description'),
          ogImage: getMetaContent('og:image'),
          ogUrl: getMetaContent('og:url'),
          ogType: getMetaContent('og:type'),
          ogSiteName: getMetaContent('og:site_name'),
          ogLocale: getMetaContent('og:locale'),
        };

        // Twitter Card tags
        const twitter = {
          twitterCard: getMetaContent('twitter:card'),
          twitterTitle: getMetaContent('twitter:title'),
          twitterDescription: getMetaContent('twitter:description'),
          twitterImage: getMetaContent('twitter:image'),
          twitterSite: getMetaContent('twitter:site'),
          twitterCreator: getMetaContent('twitter:creator'),
        };

        // Additional SEO meta tags
        const seoMeta = {
          geoRegion: getMetaContent('geo.region'),
          geoPlacename: getMetaContent('geo.placename'),
          geoPosition: getMetaContent('geo.position'),
          revisitAfter: getMetaContent('revisit-after'),
          rating: getMetaContent('rating'),
          distribution: getMetaContent('distribution'),
          copyright: getMetaContent('copyright'),
          generator: getMetaContent('generator'),
          applicationName: getMetaContent('application-name'),
          themeColor: getMetaContent('theme-color'),
          colorScheme: getMetaContent('color-scheme'),
        };

        // Collect all meta tags
        const allMetaTags = Array.from(document.querySelectorAll('meta')).map(
          (meta) => ({
            name: meta.getAttribute('name') || meta.getAttribute('property') || '',
            content: meta.getAttribute('content') || '',
            httpEquiv: meta.getAttribute('http-equiv') || '',
          })
        );

        return {
          ...standardMeta,
          ...openGraph,
          ...twitter,
          ...seoMeta,
          allMetaTags,
        };
      };

      const getAnalyticsData = () => {
        // Google Analytics 4 (gtag.js)
        const ga4Scripts = Array.from(document.querySelectorAll('script')).filter(
          (script) =>
            script.textContent?.includes('gtag') ||
            script.textContent?.includes('GA_MEASUREMENT_ID') ||
            script.src.includes('googletagmanager.com')
        );

        const ga4Ids: string[] = [];
        const ga4Config: any = {};

        ga4Scripts.forEach((script) => {
          const content = script.textContent || '';
          // Extract GA4 Measurement ID (G-XXXXXXXXXX)
          const ga4Match = content.match(/['"]G-[A-Z0-9]+['"]/g);
          if (ga4Match) {
            ga4Ids.push(...ga4Match.map((id) => id.replace(/['"]/g, '')));
          }

          // Extract gtag config
          const configMatch = content.match(/gtag\(['"]config['"],\s*['"]([^'"]+)['"]/);
          if (configMatch) {
            ga4Config.measurementId = configMatch[1];
          }
        });

        // Google Tag Manager
        const gtmScripts = Array.from(document.querySelectorAll('script')).filter(
          (script) =>
            script.src.includes('googletagmanager.com/gtm.js') ||
            script.textContent?.includes('GTM-')
        );

        const gtmIds: string[] = [];
        gtmScripts.forEach((script) => {
          const gtmMatch =
            script.src.match(/GTM-[A-Z0-9]+/) ||
            script.textContent?.match(/GTM-[A-Z0-9]+/);
          if (gtmMatch) {
            gtmIds.push(gtmMatch[0]);
          }
        });

        // Facebook Pixel
        const fbPixel = Array.from(document.querySelectorAll('script')).find(
          (script) =>
            script.textContent?.includes('fbq') ||
            script.src.includes('facebook.net')
        );
        const fbPixelId = fbPixel?.textContent?.match(/['"](\d+)['"]/)?.[1] || null;

        // Other analytics scripts
        const analyticsScripts = Array.from(
          document.querySelectorAll('script[src]')
        )
          .map((script) => (script as HTMLScriptElement).src)
          .filter(
            (src) =>
              src.includes('analytics') ||
              src.includes('google-analytics') ||
              src.includes('mixpanel') ||
              src.includes('segment') ||
              src.includes('amplitude')
          );

        return {
          googleAnalytics4: {
            measurementIds: [...new Set(ga4Ids)],
            config: ga4Config,
            scriptsFound: ga4Scripts.length,
          },
          googleTagManager: {
            containerIds: [...new Set(gtmIds)],
            scriptsFound: gtmScripts.length,
          },
          facebookPixel: {
            pixelId: fbPixelId,
            found: !!fbPixel,
          },
          otherAnalytics: analyticsScripts,
          allAnalyticsScripts: Array.from(document.querySelectorAll('script[src]'))
            .map((s) => (s as HTMLScriptElement).src)
            .filter((src) => src.includes('analytics') || src.includes('tracking')),
        };
      };

      const extractKeywords = () => {
        // Extract keywords from multiple sources
        const metaKeywords = getMetaContent('keywords')
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        // Extract from content (common words, excluding stop words)
        // Use innerText to get only visible text (excludes script tags)
        const text = document.body.innerText || document.body.textContent || '';
        const words = text
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 4);

        const stopWords = new Set([
          'the',
          'be',
          'to',
          'of',
          'and',
          'a',
          'in',
          'that',
          'have',
          'i',
          'it',
          'for',
          'not',
          'on',
          'with',
          'he',
          'as',
          'you',
          'do',
          'at',
          'this',
          'but',
          'his',
          'by',
          'from',
          'they',
          'we',
          'say',
          'her',
          'she',
          'or',
          'an',
          'will',
          'my',
          'one',
          'all',
          'would',
          'there',
          'their',
        ]);

        const wordFreq: Record<string, number> = {};
        words.forEach((word) => {
          if (!stopWords.has(word) && word.length > 4) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          }
        });

        const topKeywords = Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 30)
          .map(([word]) => word);

        // Extract from headings
        const headingKeywords = Array.from(
          document.querySelectorAll('h1, h2, h3')
        )
          .map((h) => h.textContent?.toLowerCase().split(/\s+/))
          .flat()
          .filter((word) => word && word.length > 4 && !stopWords.has(word));

        // Extract from alt text
        const altKeywords = Array.from(document.querySelectorAll('img[alt]'))
          .map((img) => img.getAttribute('alt')?.toLowerCase().split(/\s+/))
          .flat()
          .filter((word) => word && word.length > 4);

        return {
          metaKeywords,
          contentKeywords: topKeywords,
          headingKeywords: [...new Set(headingKeywords)],
          altTextKeywords: [...new Set(altKeywords)],
          allKeywords: [
            ...new Set([
              ...metaKeywords,
              ...topKeywords.slice(0, 20),
              ...headingKeywords.slice(0, 10),
              ...altKeywords.slice(0, 10),
            ]),
          ],
          keywordFrequency: wordFreq,
        };
      };

      const getStructuredData = () => {
        const scripts = document.querySelectorAll(
          'script[type="application/ld+json"]'
        );
        return Array.from(scripts).map((script) => {
          try {
            return {
              type: 'unknown',
              content: JSON.parse(script.textContent || '{}'),
              valid: true,
              errors: [],
            };
          } catch {
            return {
              type: 'unknown',
              content: {},
              valid: false,
              errors: ['Invalid JSON'],
            };
          }
        });
      };

      const getAccessibilityData = () => {
        const images = document.querySelectorAll('img');
        const elementsWithAria = document.querySelectorAll('[aria-label]');

        return {
          altTexts: Array.from(images).map((img) => img.alt || ''),
          ariaLabels: Array.from(elementsWithAria).map(
            (el) => el.getAttribute('aria-label') || ''
          ),
          headingHierarchy: true, // Would need more complex analysis
          colorContrast: {}, // Would need specialized tools
          keyboardNavigation: true, // Would need testing
        };
      };

      const getTechnicalData = () => {
        return {
          viewport:
            document
              .querySelector('meta[name="viewport"]')
              ?.getAttribute('content') || '',
          language: document.documentElement.lang || '',
          charset: document.characterSet || '',
          cssFiles: Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
          ).map((link) => (link as HTMLLinkElement).href),
          jsFiles: Array.from(document.querySelectorAll('script[src]')).map(
            (script) => (script as HTMLScriptElement).src
          ),
          errors: [], // Would need to capture console errors
        };
      };

      const getSemanticTags = () => {
        // HTML5 semantic tags for structure analysis
        const semanticTagNames = [
          'article',
          'section',
          'nav',
          'header',
          'footer',
          'aside',
          'main',
          'figure',
          'figcaption',
          'time',
          'address',
          'blockquote',
          'details',
          'summary',
        ];

        const semanticTags: Record<string, number> = {};
        const semanticTagDetails: Array<{
          tag: string;
          count: number;
          hasId: boolean;
          hasClass: boolean;
          hasAriaLabel: boolean;
        }> = [];

        semanticTagNames.forEach((tagName) => {
          const elements = document.querySelectorAll(tagName);
          const count = elements.length;
          semanticTags[tagName] = count;

          if (count > 0) {
            // Sample first element to check attributes
            const firstElement = elements[0] as HTMLElement;
            semanticTagDetails.push({
              tag: tagName,
              count,
              hasId: !!firstElement.id,
              hasClass: !!firstElement.className,
              hasAriaLabel: !!firstElement.getAttribute('aria-label'),
            });
          }
        });

        const totalSemanticTags = Object.values(semanticTags).reduce(
          (sum, count) => sum + count,
          0
        );

        return {
          semanticTags: semanticTags as {
            article: number;
            section: number;
            nav: number;
            header: number;
            footer: number;
            aside: number;
            main: number;
            figure: number;
            figcaption: number;
            time: number;
            address: number;
            blockquote: number;
            details: number;
            summary: number;
          },
          semanticTagDetails,
          totalSemanticTags,
        };
      };

      // Get clean, visible text only (excludes script tags, style tags, and Next.js internal data)
      const getCleanText = () => {
        // Clone body to avoid modifying original
        const clone = document.body.cloneNode(true) as HTMLElement;
        
        // Remove script, style, noscript, and iframe tags
        clone.querySelectorAll('script, style, noscript, iframe').forEach((el) => el.remove());
        
        // Remove Next.js internal data attributes and elements
        clone.querySelectorAll('[data-nextjs], [data-reactroot]').forEach((el) => el.remove());
        
        // Get text content (visible text only)
        const cleanText = clone.innerText || clone.textContent || '';
        
        // Clean up: remove extra whitespace, Next.js internal strings
        return cleanText
          .replace(/self\.__next_f\.push\(\[.*?\]\)/g, '') // Remove Next.js RSC data
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      };

      const text = getCleanText();
      const wordCount = text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      return {
        title: document.title,
        metaDescription: getMetaContent('description'),
        headings: getHeadings(),
        // Enhanced SEO/GA4 data
        metaTags: getMetaTags(),
        analytics: getAnalyticsData(),
        keywords: extractKeywords(),
        content: {
          text,
          wordCount,
          images: getImages(),
          links: getLinks(),
          forms: getForms(),
          buttons: getButtons(),
        },
        seo: {
          titleLength: document.title.length,
          metaDescriptionLength: getMetaContent('description').length,
          headingStructure: getTextContent('h1, h2, h3, h4, h5, h6'),
          imageAltTexts: Array.from(document.querySelectorAll('img')).map(
            (img) => img.alt || ''
          ),
          internalLinks: getLinks().filter((link) => link?.isInternal).length,
          externalLinks: getLinks().filter((link) => !link?.isInternal).length,
          canonicalUrl:
            document
              .querySelector('link[rel="canonical"]')
              ?.getAttribute('href') || '',
          robotsMeta: getMetaContent('robots'),
          schemaMarkup: getStructuredData(),
        },
        accessibility: getAccessibilityData(),
        technical: getTechnicalData(),
        tags: getSemanticTags(),
      };
    });

    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime ||
          0,
        largestContentfulPaint: 0, // Would need LCP API
        cumulativeLayoutShift: 0, // Would need CLS API
      };
    });

    return {
      url,
      pageLabel: pageInfo.label,
      pageType: pageInfo.type,
      ...pageData,
      performance: performanceMetrics,
    };
  }

  /**
   * Identify page name from navbar and URL structure
   */
  private async identifyPage(page: Page, url: string): Promise<{ label: string; type: string }> {
    try {
      const pageInfo = await page.evaluate((currentUrl) => {
        // Extract navbar links to identify page names
        const getNavbarLinks = () => {
          // Try common navbar selectors
          const navSelectors = [
            'nav a',
            'header nav a',
            '.navbar a',
            '.navigation a',
            '[role="navigation"] a',
            'nav[aria-label] a',
          ];

          const links: Array<{ text: string; href: string; isActive: boolean }> = [];

          for (const selector of navSelectors) {
            const navLinks = document.querySelectorAll(selector);
            if (navLinks.length > 0) {
              navLinks.forEach((link) => {
                const href = link.getAttribute('href');
                const text = link.textContent?.trim() || '';
                if (href && text) {
                  try {
                    const linkUrl = new URL(href, window.location.origin);
                    const currentUrlObj = new URL(currentUrl);
                    links.push({
                      text,
                      href: linkUrl.pathname,
                      isActive: linkUrl.pathname === currentUrlObj.pathname,
                    });
                  } catch {
                    // Invalid URL, skip
                  }
                }
              });
              break; // Use first matching selector
            }
          }

          return links;
        };

        const navbarLinks = getNavbarLinks();
        const currentPath = new URL(currentUrl).pathname.toLowerCase();

        // Find active link in navbar
        const activeLink = navbarLinks.find((link) => {
          const linkPath = link.href.toLowerCase();
          return linkPath === currentPath || currentPath.startsWith(linkPath + '/');
        });

        // If found in navbar, use that label
        if (activeLink && activeLink.text) {
          return {
            label: activeLink.text,
            type: activeLink.text.toLowerCase().replace(/\s+/g, '-'),
          };
        }

        // Fallback: Identify from URL path
        const pathParts = currentPath.split('/').filter(Boolean);
        
        // Common page patterns
        if (currentPath === '/' || currentPath === '') {
          return { label: 'Home', type: 'homepage' };
        }

        // Check if path matches any navbar link
        for (const link of navbarLinks) {
          const linkPath = link.href.toLowerCase();
          if (currentPath === linkPath || currentPath.startsWith(linkPath + '/')) {
            return {
              label: link.text || pathParts[0] || 'Page',
              type: link.text.toLowerCase().replace(/\s+/g, '-') || pathParts[0] || 'page',
            };
          }
        }

        // Extract from path
        if (pathParts.length > 0) {
          const pageName = pathParts[pathParts.length - 1];
          // Capitalize and format
          const formattedName = pageName
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return {
            label: formattedName,
            type: pageName,
          };
        }

        // Final fallback
        return {
          label: 'Page',
          type: 'page',
        };
      }, url);

      return pageInfo;
    } catch (error) {
      console.warn(`Failed to identify page for ${url}:`, error);
      // Fallback to URL-based identification
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length === 0 || urlObj.pathname === '/') {
        return { label: 'Home', type: 'homepage' };
      }

      const pageName = pathParts[pathParts.length - 1];
      const formattedName = pageName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        label: formattedName,
        type: pageName,
      };
    }
  }

  private async collectPerformanceData(
    page: Page,
    url: string
  ): Promise<PerformanceData> {
    console.log('⚡ Collecting performance data...');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });

    const performanceData = await page.evaluate(() => {
      const _navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');

      return {
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime ||
          0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        speedIndex: 0,
      };
    });

    return {
      overallScore: 85, // Would need actual Lighthouse integration
      metrics: performanceData,
      opportunities: [],
      diagnostics: [],
    };
  }

  private async collectSEOData(page: Page, url: string): Promise<SEOData> {
    console.log('🔍 Collecting SEO data...');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });

    const seoData = await page.evaluate(() => {
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(
          `meta[name="${name}"], meta[property="${name}"]`
        );
        return meta?.getAttribute('content') || '';
      };

      return {
        title: document.title,
        description: getMetaContent('description'),
        keywords: getMetaContent('keywords'),
        author: getMetaContent('author'),
        robots: getMetaContent('robots'),
        canonical:
          document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute('href') || '',
        ogTitle: getMetaContent('og:title'),
        ogDescription: getMetaContent('og:description'),
        ogImage: getMetaContent('og:image'),
        twitterCard: getMetaContent('twitter:card'),
        twitterTitle: getMetaContent('twitter:title'),
        twitterDescription: getMetaContent('twitter:description'),
        twitterImage: getMetaContent('twitter:image'),
      };
    });

    return {
      overallScore: 75, // Would need actual SEO analysis
      metaTags: seoData,
      structuredData: [],
      internalLinking: {
        totalLinks: 0,
        averagePerPage: 0,
        anchorTexts: [],
        linkEquity: 0,
      },
      externalLinking: {
        totalLinks: 0,
        nofollow: 0,
        dofollow: 0,
        domains: [],
      },
      contentQuality: {
        uniqueness: 0,
        depth: 0,
        freshness: 0,
        relevance: 0,
        engagement: 0,
      },
      technicalSEO: {
        robotsTxt: false,
        sitemap: false,
        https: new URL(url).protocol === 'https:',
        wwwRedirect: false,
        trailingSlash: false,
        duplicateContent: false,
      },
    };
  }

  private collectContentData(pages: PageData[]): ContentData {
    console.log('📝 Analyzing content data...');

    const totalWords = pages.reduce(
      (sum, page) => sum + page.content.wordCount,
      0
    );
    const averageWordsPerPage = totalWords / pages.length;

    return {
      totalWords,
      averageWordsPerPage,
      contentTypes: [],
      topics: [],
      sentiment: {
        overall: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      readability: {
        fleschScore: 0,
        gradeLevel: 0,
        averageSentenceLength: 0,
        averageSyllablesPerWord: 0,
      },
    };
  }

  private async collectTechnicalData(
    page: Page,
    url: string
  ): Promise<TechnicalData> {
    console.log('🔧 Collecting technical data...');

    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: this.timeout,
    });
    const headers = response?.headers() || {};

    return {
      serverInfo: {
        server: headers.server || 'Unknown',
        poweredBy: headers['x-powered-by'] || 'Unknown',
        responseTime: 0,
        statusCode: response?.status() || 0,
      },
      security: {
        https: url.startsWith('https://'),
        hsts: !!headers['strict-transport-security'],
        csp: !!headers['content-security-policy'],
        xssProtection: !!headers['x-xss-protection'],
        contentTypeOptions: !!headers['x-content-type-options'],
      },
      mobileOptimization: {
        responsive: true,
        viewport: '',
        touchFriendly: true,
        mobileFriendly: true,
      },
      caching: {
        cacheControl: headers['cache-control'] || '',
        etag: headers.etag || '',
        lastModified: headers['last-modified'] || '',
        expires: headers.expires || '',
      },
      compression: {
        gzip: !!headers['content-encoding'],
        brotli: false,
        compressionRatio: 0,
      },
    };
  }

  private collectUserExperienceData(_pages: PageData[]): UserExperienceData {
    console.log('👤 Analyzing user experience data...');

    return {
      navigation: {
        mainMenu: {
          items: [],
          depth: 0,
          mobileFriendly: true,
        },
        breadcrumbs: [],
        pagination: {
          current: 1,
          total: 1,
          next: '',
          previous: '',
        },
        search: {
          present: false,
          placeholder: '',
          results: [],
        },
      },
      forms: {
        totalForms: 0,
        averageFields: 0,
        validation: false,
        errorHandling: false,
        successMessages: false,
      },
      callsToAction: {
        total: 0,
        primary: [],
        secondary: [],
        averagePerPage: 0,
      },
      visualHierarchy: {
        headingStructure: true,
        colorContrast: 0,
        typography: {
          fontFamily: '',
          fontSize: 0,
          lineHeight: 0,
          fontWeight: '',
        },
        spacing: {
          margin: '',
          padding: '',
          lineHeight: 0,
        },
      },
      loadingStates: {
        skeletonScreens: false,
        progressIndicators: false,
        errorStates: false,
        emptyStates: false,
      },
    };
  }

  private generateSummary(
    pages: PageData[],
    performance: PerformanceData,
    seo: SEOData,
    content: ContentData,
    _technical: TechnicalData,
    _userExperience: UserExperienceData
  ): CollectionSummary {
    return {
      totalPages: pages.length,
      totalWords: content.totalWords,
      totalImages: pages.reduce(
        (sum, page) => sum + page.content.images.length,
        0
      ),
      totalLinks: pages.reduce(
        (sum, page) => sum + page.content.links.length,
        0
      ),
      averageLoadTime:
        pages.reduce((sum, page) => sum + page.performance.loadTime, 0) /
        pages.length,
      seoScore: seo.overallScore,
      performanceScore: performance.overallScore,
      accessibilityScore: 75, // Would need actual calculation
      contentScore: 80, // Would need actual calculation
      technicalScore: 85, // Would need actual calculation
      uxScore: 70, // Would need actual calculation
      criticalIssues: 0,
      recommendations: 0,
    };
  }
}
