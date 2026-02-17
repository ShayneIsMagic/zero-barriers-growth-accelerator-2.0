/**
 * Universal Puppeteer Scraper
 * Single service for all assessment types
 * Serverless compatible using @sparticuz/chromium + puppeteer-core
 */

import type { Browser } from 'puppeteer-core';

export interface UniversalScrapedData {
  // Basic content
  url: string;
  title: string;
  metaDescription: string;
  cleanText: string;
  wordCount: number;

  // Comprehensive SEO data
  seo: {
    // Meta tags
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    metaRobots: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;

    // Technical SEO
    hreflang: string[];
    alternateUrls: string[];
    viewport: string;
    charset: string;
    language: string;

    // Content structure
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
    };
    headingStructure: Array<{
      level: number;
      text: string;
      id: string;
    }>;

    // Keywords and content analysis
    extractedKeywords: string[];
    keywordDensity: Record<string, number>;
    contentLength: number;
    readabilityScore: number;

    // Internal linking
    internalLinks: Array<{
      url: string;
      text: string;
      title: string;
      isNofollow: boolean;
    }>;
    externalLinks: Array<{
      url: string;
      text: string;
      title: string;
      isNofollow: boolean;
      isSponsored: boolean;
    }>;

    // Images and media
    images: Array<{
      src: string;
      alt: string;
      title: string;
      width: number;
      height: number;
      loading: string;
    }>;
    videos: Array<{
      src: string;
      poster: string;
      title: string;
      duration: number;
    }>;

    // Forms and CTAs
    forms: Array<{
      action: string;
      method: string;
      inputs: Array<{
        name: string;
        type: string;
        required: boolean;
        placeholder: string;
      }>;
    }>;
    ctas: Array<{
      text: string;
      type: string;
      href: string;
      class: string;
    }>;
  };

  // Schema and structured data
  structuredData: {
    jsonLd: any[];
    microdata: Array<{
      type: string;
      properties: Record<string, any>;
    }>;
    rdfa: Array<{
      type: string;
      properties: Record<string, any>;
    }>;
    schemaTypes: string[];
    breadcrumbs: Array<{
      name: string;
      url: string;
    }>;
  };

  // Technical performance
  performance: {
    loadTime: number;
    domSize: number;
    domDepth: number;
    cssFiles: number;
    jsFiles: number;
    totalRequests: number;
    totalSize: number;
    renderBlockingResources: string[];
  };

  // URL and domain analysis
  urlAnalysis: {
    domain: string;
    subdomain: string;
    path: string;
    query: string;
    fragment: string;
    protocol: string;
    port: number;
    tld: string;
    isHttps: boolean;
    redirectChain: string[];
    finalUrl: string;
  };

  // Content tagging and categorization
  contentTags: {
    // Industry classification
    industry: string[];
    industryConfidence: number;

    // Business type
    businessType: 'B2B' | 'B2C' | 'BOTH' | 'UNKNOWN';
    businessTypeConfidence: number;

    // Content categories
    contentType: string[];
    topics: string[];
    sentiment: 'positive' | 'negative' | 'neutral';

    // Language and region
    language: string;
    region: string;
    currency: string;

    // Technology stack
    technologies: string[];
    cms: string;
    framework: string;
    analytics: string[];
    tracking: string[];
  };

  // Business intelligence
  businessData: {
    companyName: string;
    tagline: string;
    aboutContent: string;
    missionStatement: string;
    valueProposition: string;
    services: string[];
    products: string[];
    pricing: string[];

    contactInfo: {
      phone: string[];
      email: string[];
      address: string[];
      socialMedia: Array<{
        platform: string;
        url: string;
        handle: string;
      }>;
    };

    location: {
      country: string;
      state: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };

  // Competitive analysis
  competitive: {
    competitors: string[];
    marketPosition: string;
    uniqueValueProps: string[];
    differentiators: string[];
  };

  // Timestamp and metadata
  scrapedAt: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  errors: string[];
  warnings: string[];
}

export class UniversalPuppeteerScraper {
  private static browser: Browser | null = null;
  private static isServerless: boolean =
    process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  /**
   * Get browser instance (serverless compatible)
   * Uses @sparticuz/chromium + puppeteer-core on Vercel
   * Uses regular puppeteer locally
   */
  private static async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const LAUNCH_ARGS = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ];

    if (this.isServerless) {
      // SERVERLESS: Use @sparticuz/chromium with puppeteer-core
      const puppeteerCore = await import('puppeteer-core');

      // Option 1: Try browserless.io if configured
      const token = process.env.BROWSERLESS_TOKEN;
      if (token) {
        const browserWSEndpoint =
          process.env.BROWSERLESS_WS_ENDPOINT || 'wss://chrome.browserless.io';

        try {
          this.browser = await puppeteerCore.default.connect({
            browserWSEndpoint: `${browserWSEndpoint}?token=${token}`,
          });
          return this.browser;
        } catch (_error) {
          // Browserless.io connection failed, falling back to @sparticuz/chromium
        }
      }

      // Option 2: Use @sparticuz/chromium (provides Chromium binary for serverless)
      try {
        const chromium = await import('@sparticuz/chromium');
        const executablePath = await chromium.default.executablePath();

        this.browser = await puppeteerCore.default.launch({
          args: [...chromium.default.args, ...LAUNCH_ARGS],
          defaultViewport: { width: 1920, height: 1080 },
          executablePath,
          headless: true,
        });
        return this.browser;
      } catch (_chromiumError) {
        // @sparticuz/chromium failed
      }

      // Option 3: Try known Linux Chrome paths as last resort
      const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
      ];

      for (const executablePath of possiblePaths) {
        try {
          this.browser = await puppeteerCore.default.launch({
            executablePath,
            headless: true,
            args: LAUNCH_ARGS,
          });
          return this.browser;
        } catch (_pathError) {
          continue;
        }
      }

      throw new Error(
        'Could not launch Chrome on serverless. Ensure @sparticuz/chromium is installed or BROWSERLESS_TOKEN is set.'
      );
    } else {
      // LOCAL DEVELOPMENT: Use regular puppeteer (has its own Chrome)
      const puppeteerFull = await import('puppeteer');
      this.browser = await puppeteerFull.default.launch({
        headless: true,
        args: LAUNCH_ARGS,
      });
    }

    return this.browser;
  }

  /**
   * Universal scraping method for all assessment types
   */
  static async scrapeWebsite(url: string): Promise<UniversalScrapedData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      console.log(`🔍 Scraping website: ${url}`);

      // Set viewport and user agent with better anti-detection
      await page.setViewport({ width: 1920, height: 1080 });
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
      });

      // Add stealth measures
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
      });

      // Navigate to page with better options
      const startTime = Date.now();
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Wait a bit for dynamic content
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const loadTime = Date.now() - startTime;

      // Check if we got blocked
      const pageContent = await page.content();
      if (
        pageContent.includes('Access Denied') ||
        pageContent.includes('blocked') ||
        pageContent.includes('403') ||
        pageContent.includes('Forbidden')
      ) {
        throw new Error(
          `Website blocked the scraper: ${url}. Try a different website or contact support.`
        );
      }

      // Extract comprehensive data
      const scrapedData = await page.evaluate(() => {
        // Helper functions
        const getTextContent = (selector: string): string[] => {
          return Array.from(document.querySelectorAll(selector)).map(
            (el) => el.textContent?.trim() || ''
          );
        };

        const getAttribute = (selector: string, attr: string): string => {
          const el = document.querySelector(selector);
          return el?.getAttribute(attr) || '';
        };

        const getAllAttributes = (selector: string, attr: string): string[] => {
          return Array.from(document.querySelectorAll(selector)).map(
            (el) => el.getAttribute(attr) || ''
          );
        };

        const extractKeywords = (
          text: string
        ): { keywords: string[]; density: Record<string, number> } => {
          const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((word) => word.length > 3);

          const wordFreq: Record<string, number> = {};
          words.forEach((word) => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          });

          const totalWords = words.length;
          const density: Record<string, number> = {};
          Object.entries(wordFreq).forEach(([word, count]) => {
            density[word] = (count / totalWords) * 100;
          });

          return {
            keywords: Object.entries(wordFreq)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 50)
              .map(([word]) => word),
            density,
          };
        };

        const extractContactInfo = () => {
          const text = document.body.innerText;
          const phoneRegex =
            /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

          return {
            phone: Array.from(text.matchAll(phoneRegex)).map(
              (match) => match[0]
            ),
            email: Array.from(text.matchAll(emailRegex)).map(
              (match) => match[0]
            ),
            address: getTextContent(
              '[itemprop="address"], .address, .contact-address'
            ),
          };
        };

        const extractSocialMedia = () => {
          const socialLinks = Array.from(
            document.querySelectorAll(
              'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"], a[href*="youtube"], a[href*="tiktok"]'
            )
          );
          return socialLinks.map((link) => {
            const href = link.getAttribute('href') || '';
            const platform = href.includes('facebook')
              ? 'facebook'
              : href.includes('twitter')
                ? 'twitter'
                : href.includes('linkedin')
                  ? 'linkedin'
                  : href.includes('instagram')
                    ? 'instagram'
                    : href.includes('youtube')
                      ? 'youtube'
                      : href.includes('tiktok')
                        ? 'tiktok'
                        : 'unknown';
            return {
              platform,
              url: href,
              handle: link.textContent?.trim() || '',
            };
          });
        };

        const extractSchema = () => {
          const scripts = Array.from(
            document.querySelectorAll('script[type="application/ld+json"]')
          );
          return scripts
            .map((script) => {
              try {
                return JSON.parse(script.textContent || '');
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        };

        const extractMicrodata = () => {
          const items = Array.from(document.querySelectorAll('[itemscope]'));
          return items.map((item) => ({
            type: item.getAttribute('itemtype') || '',
            properties: Array.from(item.querySelectorAll('[itemprop]')).reduce(
              (acc, prop) => {
                const name = prop.getAttribute('itemprop') || '';
                const value =
                  prop.getAttribute('content') ||
                  prop.textContent?.trim() ||
                  '';
                acc[name] = value;
                return acc;
              },
              {} as Record<string, any>
            ),
          }));
        };

        const detectBusinessType = (
          text: string
        ): { type: 'B2B' | 'B2C' | 'BOTH' | 'UNKNOWN'; confidence: number } => {
          const b2bKeywords = [
            'enterprise',
            'business',
            'corporate',
            'wholesale',
            'b2b',
            'api',
            'integration',
            'solution',
            'platform',
            'saas',
          ];
          const b2cKeywords = [
            'consumer',
            'personal',
            'individual',
            'retail',
            'b2c',
            'shopping',
            'buy now',
            'add to cart',
            'customer',
            'user',
          ];

          const lowerText = text.toLowerCase();
          const b2bScore = b2bKeywords.filter((keyword) =>
            lowerText.includes(keyword)
          ).length;
          const b2cScore = b2cKeywords.filter((keyword) =>
            lowerText.includes(keyword)
          ).length;
          const totalScore = b2bScore + b2cScore;

          let type: 'B2B' | 'B2C' | 'BOTH' | 'UNKNOWN' = 'UNKNOWN';
          let confidence = 0;

          if (totalScore > 0) {
            if (b2bScore > b2cScore && b2bScore > 2) {
              type = 'B2B';
              confidence = (b2bScore / totalScore) * 100;
            } else if (b2cScore > b2bScore && b2cScore > 2) {
              type = 'B2C';
              confidence = (b2cScore / totalScore) * 100;
            } else if (b2bScore > 1 && b2cScore > 1) {
              type = 'BOTH';
              confidence = (Math.min(b2bScore, b2cScore) / totalScore) * 100;
            }
          }

          return { type, confidence };
        };

        const detectIndustry = (
          text: string
        ): { industries: string[]; confidence: number } => {
          const industries = {
            construction: [
              'construction',
              'building',
              'contractor',
              'concrete',
              'steel',
              'excavation',
              'project',
              'facility',
            ],
            healthcare: [
              'healthcare',
              'medical',
              'hospital',
              'clinic',
              'doctor',
              'patient',
              'health',
              'treatment',
            ],
            technology: [
              'software',
              'tech',
              'digital',
              'app',
              'platform',
              'saas',
              'development',
              'programming',
            ],
            finance: [
              'financial',
              'banking',
              'investment',
              'loan',
              'credit',
              'insurance',
              'money',
              'finance',
            ],
            retail: [
              'retail',
              'store',
              'shop',
              'product',
              'inventory',
              'sales',
              'shopping',
              'commerce',
            ],
            education: [
              'education',
              'school',
              'university',
              'learning',
              'training',
              'course',
              'student',
              'academic',
            ],
            manufacturing: [
              'manufacturing',
              'production',
              'factory',
              'assembly',
              'quality',
              'industrial',
              'machinery',
            ],
            'real-estate': [
              'real estate',
              'property',
              'housing',
              'commercial',
              'residential',
              'realty',
              'broker',
            ],
            consulting: [
              'consulting',
              'advisory',
              'strategy',
              'management',
              'expertise',
              'consultant',
              'services',
            ],
            nonprofit: [
              'nonprofit',
              'charity',
              'foundation',
              'volunteer',
              'donation',
              'cause',
              'mission',
            ],
          };

          const lowerText = text.toLowerCase();
          const detectedIndustries: string[] = [];
          let totalConfidence = 0;

          Object.entries(industries).forEach(([industry, keywords]) => {
            const score = keywords.filter((keyword) =>
              lowerText.includes(keyword)
            ).length;
            if (score >= 2) {
              detectedIndustries.push(industry);
              totalConfidence += score;
            }
          });

          return {
            industries: detectedIndustries,
            confidence:
              detectedIndustries.length > 0
                ? (totalConfidence / detectedIndustries.length) * 10
                : 0,
          };
        };

        const detectTechnologies = (): string[] => {
          const technologies: string[] = [];

          // Check for common frameworks and libraries
          const scripts = Array.from(document.querySelectorAll('script[src]'));
          scripts.forEach((script) => {
            const src = script.getAttribute('src') || '';
            if (src.includes('jquery')) technologies.push('jQuery');
            if (src.includes('react')) technologies.push('React');
            if (src.includes('vue')) technologies.push('Vue.js');
            if (src.includes('angular')) technologies.push('Angular');
            if (src.includes('bootstrap')) technologies.push('Bootstrap');
            if (src.includes('tailwind')) technologies.push('Tailwind CSS');
            if (src.includes('wordpress')) technologies.push('WordPress');
            if (src.includes('shopify')) technologies.push('Shopify');
            if (src.includes('squarespace')) technologies.push('Squarespace');
            if (src.includes('wix')) technologies.push('Wix');
          });

          // Check meta tags for CMS
          const generator = getAttribute('meta[name="generator"]', 'content');
          if (generator) technologies.push(generator);

          return [...new Set(technologies)];
        };

        const calculateReadability = (text: string): number => {
          const sentences = text.split(/[.!?]+/).length;
          const words = text.split(/\s+/).length;
          const syllables =
            text.toLowerCase().replace(/[^a-z]/g, '').length * 0.6; // Rough estimate

          if (sentences === 0 || words === 0) return 0;

          const avgWordsPerSentence = words / sentences;
          const avgSyllablesPerWord = syllables / words;

          // Flesch Reading Ease Score
          const score =
            206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
          return Math.max(0, Math.min(100, score));
        };

        // Extract comprehensive data
        const bodyText = document.body.innerText;
        const title = document.title;
        const url = window.location.href;
        const domain = window.location.hostname;

        // URL analysis
        const urlObj = new URL(url);
        const urlAnalysis = {
          domain: urlObj.hostname,
          subdomain: urlObj.hostname.split('.').slice(0, -2).join('.'),
          path: urlObj.pathname,
          query: urlObj.search,
          fragment: urlObj.hash,
          protocol: urlObj.protocol,
          port:
            parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80),
          tld: urlObj.hostname.split('.').pop() || '',
          isHttps: urlObj.protocol === 'https:',
          redirectChain: [], // Would need to track redirects
          finalUrl: url,
        };

        // SEO data
        const seo = {
          metaTitle: title,
          metaDescription: getAttribute('meta[name="description"]', 'content'),
          metaKeywords: getAttribute('meta[name="keywords"]', 'content')
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          metaRobots: getAttribute('meta[name="robots"]', 'content'),
          canonicalUrl: getAttribute('link[rel="canonical"]', 'href'),
          ogTitle: getAttribute('meta[property="og:title"]', 'content'),
          ogDescription: getAttribute(
            'meta[property="og:description"]',
            'content'
          ),
          ogImage: getAttribute('meta[property="og:image"]', 'content'),
          ogType: getAttribute('meta[property="og:type"]', 'content'),
          twitterCard: getAttribute('meta[name="twitter:card"]', 'content'),
          twitterTitle: getAttribute('meta[name="twitter:title"]', 'content'),
          twitterDescription: getAttribute(
            'meta[name="twitter:description"]',
            'content'
          ),
          twitterImage: getAttribute('meta[name="twitter:image"]', 'content'),
          hreflang: getAllAttributes(
            'link[rel="alternate"][hreflang]',
            'hreflang'
          ),
          alternateUrls: getAllAttributes('link[rel="alternate"]', 'href'),
          viewport: getAttribute('meta[name="viewport"]', 'content'),
          charset:
            getAttribute('meta[charset]', 'charset') ||
            getAttribute('meta[http-equiv="Content-Type"]', 'content'),
          language: getAttribute('html', 'lang') || 'en',
        };

        // Content analysis
        const keywordAnalysis = extractKeywords(bodyText);
        const businessTypeAnalysis = detectBusinessType(bodyText);
        const industryAnalysis = detectIndustry(bodyText);

        // Images and media
        const images = Array.from(document.querySelectorAll('img')).map(
          (img) => ({
            src: img.src,
            alt: img.alt,
            title: img.title,
            width: img.naturalWidth || 0,
            height: img.naturalHeight || 0,
            loading: img.loading || 'eager',
          })
        );

        const videos = Array.from(document.querySelectorAll('video')).map(
          (video) => ({
            src: video.src,
            poster: video.poster,
            title: video.title,
            duration: video.duration || 0,
          })
        );

        // Links analysis
        const internalLinks = Array.from(
          document.querySelectorAll('a[href^="/"], a[href*="' + domain + '"]')
        ).map((link: any) => ({
          url: link.href,
          text: link.textContent?.trim() || '',
          title: link.title || '',
          isNofollow: link.rel?.includes('nofollow') || false,
        }));

        const externalLinks = Array.from(
          document.querySelectorAll(
            'a[href^="http"]:not([href*="' + domain + '"])'
          )
        ).map((link: any) => ({
          url: link.href,
          text: link.textContent?.trim() || '',
          title: link.title || '',
          isNofollow: link.rel?.includes('nofollow') || false,
          isSponsored: link.rel?.includes('sponsored') || false,
        }));

        // Forms analysis
        const forms = Array.from(document.querySelectorAll('form')).map(
          (form) => ({
            action: form.action,
            method: form.method,
            inputs: Array.from(
              form.querySelectorAll('input, select, textarea')
            ).map((input) => ({
              name: input.getAttribute('name') || '',
              type: input.getAttribute('type') || input.tagName.toLowerCase(),
              required: input.hasAttribute('required'),
              placeholder: input.getAttribute('placeholder') || '',
            })),
          })
        );

        // CTAs analysis
        const ctas = Array.from(
          document.querySelectorAll(
            'button, .btn, .button, .cta, [class*="call-to-action"], a[class*="btn"]'
          )
        ).map((cta) => ({
          text: cta.textContent?.trim() || '',
          type: cta.tagName.toLowerCase(),
          href: cta.getAttribute('href') || '',
          class: cta.className,
        }));

        // Structured data
        const jsonLd = extractSchema();
        const microdata = extractMicrodata();
        const breadcrumbs = Array.from(
          document.querySelectorAll(
            '[itemtype*="BreadcrumbList"] a, .breadcrumb a'
          )
        ).map((link: any) => ({
          name: link.textContent?.trim() || '',
          url: link.href,
        }));

        // Performance data
        const performance = {
          domSize: document.querySelectorAll('*').length,
          domDepth: Math.max(
            ...Array.from(document.querySelectorAll('*')).map((el) => {
              let depth = 0;
              let parent = el.parentElement;
              while (parent) {
                depth++;
                parent = parent.parentElement;
              }
              return depth;
            })
          ),
          cssFiles: document.querySelectorAll('link[rel="stylesheet"]').length,
          jsFiles: document.querySelectorAll('script[src]').length,
          totalRequests: 0, // Would need network monitoring
          totalSize: 0, // Would need network monitoring
          renderBlockingResources: Array.from(
            document.querySelectorAll('link[rel="stylesheet"], script[src]')
          ).map(
            (el) => el.getAttribute('href') || el.getAttribute('src') || ''
          ),
        };

        // Business data
        const businessData = {
          companyName: title.split(' - ')[0].split(' | ')[0],
          tagline: getTextContent('.tagline, .hero h2, .subtitle')
            .join(' ')
            .substring(0, 200),
          aboutContent: getTextContent('.about, #about, [class*="about"]')
            .join(' ')
            .substring(0, 1000),
          missionStatement: getTextContent(
            '.mission, #mission, [class*="mission"]'
          )
            .join(' ')
            .substring(0, 500),
          valueProposition: getTextContent(
            '.value-prop, .value-proposition, .hero p'
          )
            .join(' ')
            .substring(0, 300),
          services: getTextContent(
            '.services li, .service-item, [class*="service"]'
          ).slice(0, 10),
          products: getTextContent(
            '.products li, .product-item, [class*="product"]'
          ).slice(0, 10),
          pricing: getTextContent('.pricing, .price, [class*="price"]').slice(
            0,
            5
          ),
          contactInfo: {
            ...extractContactInfo(),
            socialMedia: extractSocialMedia(),
          },
          location: {
            country: 'US', // Would need geolocation API
            state: '',
            city: '',
            coordinates: { lat: 0, lng: 0 },
          },
        };

        // Content tags
        const contentTags = {
          industry: industryAnalysis.industries,
          industryConfidence: industryAnalysis.confidence,
          businessType: businessTypeAnalysis.type,
          businessTypeConfidence: businessTypeAnalysis.confidence,
          contentType: ['webpage'], // Would analyze content structure
          topics: keywordAnalysis.keywords.slice(0, 10),
          sentiment: 'neutral', // Would need sentiment analysis
          language: seo.language,
          region: 'US',
          currency: '$',
          technologies: detectTechnologies(),
          cms: getAttribute('meta[name="generator"]', 'content') || 'Unknown',
          framework:
            detectTechnologies().find((tech) =>
              ['React', 'Vue.js', 'Angular'].includes(tech)
            ) || 'Unknown',
          analytics: Array.from(document.querySelectorAll('script'))
            .map((script) => script.src)
            .filter(
              (src) =>
                src.includes('google-analytics') ||
                src.includes('gtag') ||
                src.includes('ga.js')
            ),
          tracking: Array.from(document.querySelectorAll('script'))
            .map((script) => script.src)
            .filter(
              (src) =>
                src.includes('facebook') ||
                src.includes('pixel') ||
                src.includes('tracking')
            ),
        };

        return {
          url,
          title,
          metaDescription: seo.metaDescription,
          cleanText: bodyText,
          wordCount: bodyText.split(/\s+/).length,
          seo: {
            ...seo,
            headings: {
              h1: getTextContent('h1'),
              h2: getTextContent('h2'),
              h3: getTextContent('h3'),
              h4: getTextContent('h4'),
              h5: getTextContent('h5'),
              h6: getTextContent('h6'),
            },
            headingStructure: Array.from(
              document.querySelectorAll('h1, h2, h3, h4, h5, h6')
            ).map((heading) => ({
              level: parseInt(heading.tagName.charAt(1)),
              text: heading.textContent?.trim() || '',
              id: heading.id || '',
            })),
            extractedKeywords: keywordAnalysis.keywords,
            keywordDensity: keywordAnalysis.density,
            contentLength: bodyText.length,
            readabilityScore: calculateReadability(bodyText),
            internalLinks,
            externalLinks,
            images,
            videos,
            forms,
            ctas,
          },
          structuredData: {
            jsonLd,
            microdata,
            rdfa: [], // Would need RDFa extraction
            schemaTypes: jsonLd
              .map((schema) => schema['@type'])
              .filter(Boolean),
            breadcrumbs,
          },
          performance: {
            ...performance,
            loadTime: 0, // Will be set by the caller
          },
          urlAnalysis,
          contentTags,
          businessData,
          competitive: {
            competitors: [],
            marketPosition: '',
            uniqueValueProps: [],
            differentiators: [],
          },
          scrapedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          errors: [],
          warnings: [],
        };
      });

      // Add load time to performance data
      scrapedData.performance.loadTime = loadTime;

      console.log(
        `✅ Scraped ${scrapedData.wordCount} words, ${scrapedData.seo.images.length} images, ${scrapedData.seo.internalLinks.length + scrapedData.seo.externalLinks.length} links`
      );
      console.log(
        `📊 SEO: ${scrapedData.seo.extractedKeywords.length} keywords, ${scrapedData.seo.headings.h1.length} H1s, ${scrapedData.structuredData.schemaTypes.length} schema types`
      );
      console.log(
        `🏢 Business: ${scrapedData.contentTags.businessType} (${scrapedData.contentTags.businessTypeConfidence.toFixed(1)}%), ${scrapedData.contentTags.industry.join(', ')}`
      );

      return scrapedData as UniversalScrapedData;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(
        `Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      await page.close();
    }
  }

  /**
   * Close browser (cleanup)
   */
  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Health check for scraping service
   */
  static async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      await page.goto('https://example.com', {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });
      await page.close();

      return {
        status: 'healthy',
        message: 'Puppeteer scraping service is working',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Scraping service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
