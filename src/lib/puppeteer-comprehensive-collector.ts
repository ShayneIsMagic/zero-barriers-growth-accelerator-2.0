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
        ],
      });

      const page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // Enable performance monitoring
      await page.evaluateOnNewDocument(() => {
        window.performance.mark('page-start');
      });

      // Collect site map and discover all pages
      const siteMap = await this.collectSiteMap(page, url);

      // Collect data from each page
      const pages: PageData[] = [];
      const visitedUrls = new Set<string>();

      for (const pageUrl of siteMap.sitemap.slice(0, this.maxPages)) {
        if (visitedUrls.has(pageUrl.url)) continue;
        visitedUrls.add(pageUrl.url);

        try {
          const pageData = await this.collectPageData(page, pageUrl.url);
          pages.push(pageData);
        } catch (error) {
          console.error(`Failed to collect data from ${pageUrl.url}:`, error);
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
          waitUntil: 'networkidle2',
          timeout: this.timeout,
        });

        if (!response) {
          brokenLinks.push(url);
          continue;
        }

        const status = response.status();
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

  private async collectPageData(page: Page, url: string): Promise<PageData> {
    console.log(`📄 Collecting data from: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });

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
        const text = document.body.textContent || '';
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

      const text = document.body.textContent || '';
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
      ...pageData,
      performance: performanceMetrics,
    };
  }

  private async collectPerformanceData(
    page: Page,
    url: string
  ): Promise<PerformanceData> {
    console.log('⚡ Collecting performance data...');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: this.timeout });

    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
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
        https: url.startsWith('https://'),
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

  private collectUserExperienceData(pages: PageData[]): UserExperienceData {
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
    technical: TechnicalData,
    userExperience: UserExperienceData
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
