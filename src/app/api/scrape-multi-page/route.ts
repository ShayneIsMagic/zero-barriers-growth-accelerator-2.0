/**
 * Multi-Page Scraping API
 * Discovers and scrapes multiple pages from a website with comprehensive SEO data
 *
 * ARCHITECTURE:
 * - On Vercel: Uses fetch-based HTML parsing (no Puppeteer)
 * - Locally: Uses Puppeteer for full browser rendering
 * - Extracts: meta tags, OG tags, Twitter Cards, GA4, GTM, keywords, schema, etc.
 * - Results stored in LocalForage by the client
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

const isServerless =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// ============================================
// INTERFACES
// ============================================

interface PageDiscoveryOptions {
  maxPages?: number;
  includeSubpages?: boolean;
  includeBlog?: boolean;
  includeProducts?: boolean;
  includeAbout?: boolean;
  includeContact?: boolean;
  includeServices?: boolean;
  maxDepth?: number;
}

interface PageSEOData {
  url: string;
  pageType: string;
  priority: number;
  title: string;
  wordCount: number;

  // Meta tags
  meta: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    robots: string;
    viewport: string;
    charset: string;
    language: string;
    canonical: string;
    generator: string;
    themeColor: string;
    copyright: string;
    revisitAfter: string;
    rating: string;
  };

  // Open Graph
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
    locale: string;
  };

  // Twitter Card
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image: string;
    site: string;
    creator: string;
  };

  // Analytics & Tracking
  analytics: {
    ga4MeasurementIds: string[];
    gtmContainerIds: string[];
    facebookPixelIds: string[];
    otherTracking: string[];
    hasGoogleAnalytics: boolean;
    hasGTM: boolean;
    hasFacebookPixel: boolean;
    hasHotjar: boolean;
    hasClarityMs: boolean;
  };

  // SEO Structure
  seo: {
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
    };
    headingStructureValid: boolean;
    titleLength: number;
    descriptionLength: number;
    internalLinkCount: number;
    externalLinkCount: number;
    imageCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    hasCanonical: boolean;
    hasRobotsMeta: boolean;
    hasSitemap: boolean;
    hasSchemaMarkup: boolean;
    schemaTypes: string[];
    structuredData: StructuredDataItem[];
  };

  // Keywords
  keywords: {
    metaKeywords: string[];
    extractedFromContent: string[];
    extractedFromHeadings: string[];
    topKeywordsByFrequency: KeywordFrequency[];
    totalUniqueKeywords: number;
  };

  // Semantic HTML Tags
  tags: {
    article: number;
    section: number;
    nav: number;
    header: number;
    footer: number;
    aside: number;
    main: number;
    figure: number;
    time: number;
    address: number;
    totalSemanticTags: number;
  };

  // Content
  content: {
    text: string;
    wordCount: number;
    paragraphCount: number;
    listCount: number;
    formCount: number;
    videoCount: number;
    socialMediaLinks: string[];
  };

  // Contact Info
  contactInfo: {
    phones: string[];
    emails: string[];
    addresses: string[];
  };

  // Technical
  technical: {
    hasSSL: boolean;
    hasMobileViewport: boolean;
    loadTime: number;
    cssFileCount: number;
    jsFileCount: number;
    technologies: string[];
  };

  extractedAt: string;
  method: 'fetch' | 'puppeteer' | 'browserless' | 'scrapingbee';
}

interface KeywordFrequency {
  keyword: string;
  count: number;
  density: number;
}

interface StructuredDataItem {
  type: string;
  data: Record<string, unknown>;
}

interface MultiPageResult {
  url: string;
  totalPagesScraped: number;
  pages: PageSEOData[];
  siteMap: {
    totalPages: number;
    discoveredPages: string[];
    pageTypes: Record<string, number>;
  };
  siteSummary: {
    allKeywords: string[];
    allHeadings: string[];
    contentThemes: string[];
    ga4MeasurementIds: string[];
    gtmContainerIds: string[];
    totalWordCount: number;
    averageWordCount: number;
    pagesWithSchema: number;
    pagesWithCanonical: number;
    pagesWithOG: number;
    pagesWithTwitterCard: number;
  };
  extractedAt: string;
}

// ============================================
// URL VALIDATION
// ============================================

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================
// HTML FETCHING
// ============================================

async function fetchHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================
// COMPREHENSIVE HTML PARSER
// ============================================

function parsePageSEO(
  html: string,
  url: string,
  pageType: string,
  priority: number,
  startTime: number
): PageSEOData {
  // Helper: extract meta content by name or property
  const getMetaContent = (nameOrProperty: string): string => {
    const patterns = [
      new RegExp(
        `<meta[^>]*(?:name|property)=["']${escapeRegex(nameOrProperty)}["'][^>]*content=["']([^"']*)["']`,
        'i'
      ),
      new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${escapeRegex(nameOrProperty)}["']`,
        'i'
      ),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
    return '';
  };

  const getMetaHttpEquiv = (httpEquiv: string): string => {
    const pattern = new RegExp(
      `<meta[^>]*http-equiv=["']${escapeRegex(httpEquiv)}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    const match = html.match(pattern);
    return match?.[1]?.trim() || '';
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || '';

  // Charset
  const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
  const charset = charsetMatch?.[1]?.trim() || getMetaHttpEquiv('Content-Type').split('charset=')[1] || 'utf-8';

  // Language
  const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
  const language = langMatch?.[1]?.trim() || getMetaContent('language') || '';

  // Canonical
  const canonicalMatch = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i
  );
  const canonical = canonicalMatch?.[1]?.trim() || '';

  // Meta tags
  const meta = {
    title,
    description: getMetaContent('description'),
    keywords: (getMetaContent('keywords') || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    author: getMetaContent('author'),
    robots: getMetaContent('robots'),
    viewport: getMetaContent('viewport'),
    charset,
    language,
    canonical,
    generator: getMetaContent('generator'),
    themeColor: getMetaContent('theme-color'),
    copyright: getMetaContent('copyright'),
    revisitAfter: getMetaContent('revisit-after'),
    rating: getMetaContent('rating'),
  };

  // Open Graph
  const openGraph = {
    title: getMetaContent('og:title'),
    description: getMetaContent('og:description'),
    image: getMetaContent('og:image'),
    url: getMetaContent('og:url'),
    type: getMetaContent('og:type'),
    siteName: getMetaContent('og:site_name'),
    locale: getMetaContent('og:locale'),
  };

  // Twitter Card
  const twitterCard = {
    card: getMetaContent('twitter:card'),
    title: getMetaContent('twitter:title'),
    description: getMetaContent('twitter:description'),
    image: getMetaContent('twitter:image'),
    site: getMetaContent('twitter:site'),
    creator: getMetaContent('twitter:creator'),
  };

  // Analytics & Tracking
  const analytics = extractAnalytics(html);

  // Clean HTML for text extraction
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

  // Extract headings
  const headings = extractHeadings(cleanHtml);

  // Heading structure validation: should have at most 1 H1
  const headingStructureValid =
    headings.h1.length <= 1 && headings.h1.length > 0;

  // Images
  const imageMatches = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = imageMatches.filter((img) =>
    /alt=["'][^"']+["']/i.test(img)
  ).length;
  const imagesWithoutAlt = imageMatches.length - imagesWithAlt;

  // Links
  const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  const socialMediaLinks: string[] = [];

  try {
    const baseHost = new URL(url).hostname;
    linkMatches.forEach((link) => {
      const hrefMatch = link.match(/href=["']([^"']*)["']/i);
      if (hrefMatch?.[1]) {
        const href = hrefMatch[1];
        try {
          const linkUrl = new URL(href, url);
          if (linkUrl.hostname === baseHost) {
            internalLinkCount++;
          } else {
            externalLinkCount++;
            // Social media detection
            const socialPlatforms = [
              'facebook.com',
              'twitter.com',
              'x.com',
              'linkedin.com',
              'instagram.com',
              'youtube.com',
              'tiktok.com',
              'pinterest.com',
              'github.com',
            ];
            if (
              socialPlatforms.some((platform) =>
                linkUrl.hostname.includes(platform)
              )
            ) {
              socialMediaLinks.push(href);
            }
          }
        } catch {
          // Relative link = internal
          if (href.startsWith('/') || href.startsWith('#')) {
            internalLinkCount++;
          }
        }
      }
    });
  } catch {
    // URL parsing failed
  }

  // Schema / Structured Data
  const schemaMatches =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ) || [];
  const structuredData: StructuredDataItem[] = [];
  const schemaTypes: string[] = [];

  schemaMatches.forEach((match) => {
    const contentMatch = match.match(
      /<script[^>]*>([\s\S]*?)<\/script>/i
    );
    if (contentMatch?.[1]) {
      try {
        const parsed = JSON.parse(contentMatch[1]);
        const schemaType =
          parsed['@type'] ||
          (Array.isArray(parsed['@graph'])
            ? parsed['@graph'].map((g: Record<string, unknown>) => g['@type']).join(', ')
            : 'Unknown');
        schemaTypes.push(schemaType);
        structuredData.push({
          type: schemaType,
          data: parsed,
        });
      } catch {
        // Invalid JSON-LD
      }
    }
  });

  // Sitemap detection
  const hasSitemap =
    html.includes('sitemap.xml') ||
    html.includes('sitemap_index.xml') ||
    false;

  // SEO
  const seo = {
    headings,
    headingStructureValid,
    titleLength: title.length,
    descriptionLength: meta.description.length,
    internalLinkCount,
    externalLinkCount,
    imageCount: imageMatches.length,
    imagesWithAlt,
    imagesWithoutAlt,
    hasCanonical: canonical.length > 0,
    hasRobotsMeta: meta.robots.length > 0,
    hasSitemap,
    hasSchemaMarkup: structuredData.length > 0,
    schemaTypes,
    structuredData,
  };

  // Extract text content
  const textContent = cleanHtml
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = textContent
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // Keywords
  const keywords = extractKeywords(textContent, headings, meta.keywords);

  // Semantic Tags
  const tags = extractSemanticTags(html);

  // Content counts
  const paragraphCount = (cleanHtml.match(/<p[^>]*>/gi) || []).length;
  const listCount = (cleanHtml.match(/<(ul|ol)[^>]*>/gi) || []).length;
  const formCount = (cleanHtml.match(/<form[^>]*>/gi) || []).length;
  const videoCount = (
    cleanHtml.match(
      /<(video|iframe[^>]*src[^>]*(?:youtube|vimeo|wistia)[^>]*)>/gi
    ) || []
  ).length;

  // Contact Info
  const contactInfo = extractContactInfo(textContent);

  // Technical
  const cssFileCount = (
    html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || []
  ).length;
  const jsFileCount = (
    html.match(/<script[^>]*src=["'][^"']+["'][^>]*>/gi) || []
  ).length;
  const technologies = detectTechnologies(html);

  const loadTime = Date.now() - startTime;

  return {
    url,
    pageType,
    priority,
    title,
    wordCount,
    meta,
    openGraph,
    twitterCard,
    analytics,
    seo,
    keywords,
    tags,
    content: {
      text: textContent.substring(0, 50000),
      wordCount,
      paragraphCount,
      listCount,
      formCount,
      videoCount,
      socialMediaLinks: [...new Set(socialMediaLinks)],
    },
    contactInfo,
    technical: {
      hasSSL: url.startsWith('https://'),
      hasMobileViewport: meta.viewport.includes('width=device-width'),
      loadTime,
      cssFileCount,
      jsFileCount,
      technologies,
    },
    extractedAt: new Date().toISOString(),
    method: 'fetch',
  };
}

// ============================================
// HELPER EXTRACTORS
// ============================================

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractHeadings(html: string): PageSEOData['seo']['headings'] {
  const headings: PageSEOData['seo']['headings'] = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  };

  for (let level = 1; level <= 6; level++) {
    const tag = `h${level}` as keyof typeof headings;
    const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gis');
    let match;
    while ((match = regex.exec(html)) !== null) {
      const text = match[1]
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) headings[tag].push(text);
    }
  }

  return headings;
}

function extractAnalytics(html: string): PageSEOData['analytics'] {
  // GA4 Measurement IDs (G-XXXXXXX)
  const ga4Pattern = /G-[A-Z0-9]{7,12}/g;
  const ga4Matches = html.match(ga4Pattern) || [];
  const ga4MeasurementIds = [...new Set(ga4Matches)];

  // GTM Container IDs (GTM-XXXXXXX)
  const gtmPattern = /GTM-[A-Z0-9]{4,10}/g;
  const gtmMatches = html.match(gtmPattern) || [];
  const gtmContainerIds = [...new Set(gtmMatches)];

  // Facebook Pixel IDs
  const fbPixelPattern = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/g;
  const fbPixelIds: string[] = [];
  let fbMatch;
  while ((fbMatch = fbPixelPattern.exec(html)) !== null) {
    fbPixelIds.push(fbMatch[1]);
  }

  // Other tracking
  const otherTracking: string[] = [];
  if (html.includes('hotjar') || html.includes('hjid')) {
    otherTracking.push('Hotjar');
  }
  if (html.includes('clarity.ms') || html.includes('clarity(')) {
    otherTracking.push('Microsoft Clarity');
  }
  if (html.includes('hubspot') || html.includes('hs-script')) {
    otherTracking.push('HubSpot');
  }
  if (html.includes('intercom') || html.includes('Intercom')) {
    otherTracking.push('Intercom');
  }
  if (html.includes('segment.com') || html.includes('analytics.js')) {
    otherTracking.push('Segment');
  }
  if (html.includes('mixpanel')) {
    otherTracking.push('Mixpanel');
  }
  if (html.includes('heap') && html.includes('heap-')) {
    otherTracking.push('Heap Analytics');
  }
  if (html.includes('plausible.io')) {
    otherTracking.push('Plausible');
  }
  if (html.includes('matomo') || html.includes('piwik')) {
    otherTracking.push('Matomo');
  }

  return {
    ga4MeasurementIds,
    gtmContainerIds,
    facebookPixelIds: [...new Set(fbPixelIds)],
    otherTracking,
    hasGoogleAnalytics: ga4MeasurementIds.length > 0 || html.includes('google-analytics.com') || html.includes('gtag'),
    hasGTM: gtmContainerIds.length > 0,
    hasFacebookPixel: fbPixelIds.length > 0,
    hasHotjar: html.includes('hotjar') || html.includes('hjid'),
    hasClarityMs: html.includes('clarity.ms'),
  };
}

function extractKeywords(
  text: string,
  headings: PageSEOData['seo']['headings'],
  metaKeywords: string[]
): PageSEOData['keywords'] {
  const STOP_WORDS = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will',
    'your', 'our', 'their', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'only', 'own', 'same', 'than', 'too', 'very', 'can', 'just', 'should',
    'now', 'also', 'been', 'being', 'does', 'doing', 'done', 'had', 'has',
    'having', 'was', 'were', 'what', 'which', 'who', 'whom', 'these', 'those',
    'would', 'could', 'shall', 'may', 'might', 'must', 'need', 'dare',
    'not', 'but', 'yet', 'still', 'even', 'any', 'are', 'its', 'you',
    'they', 'she', 'him', 'her', 'his', 'them', 'we', 'us', 'me', 'my',
  ]);

  // Extract from headings
  const headingText = [
    ...headings.h1,
    ...headings.h2,
    ...headings.h3,
  ].join(' ');

  const headingWords = headingText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  // Extract from content
  const contentWords = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));

  // Build frequency map
  const freqMap: Record<string, number> = {};
  contentWords.forEach((word) => {
    freqMap[word] = (freqMap[word] || 0) + 1;
  });

  // Top keywords by frequency
  const totalWords = contentWords.length || 1;
  const topKeywordsByFrequency: KeywordFrequency[] = Object.entries(freqMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Math.round((count / totalWords) * 10000) / 100,
    }));

  const extractedFromContent = topKeywordsByFrequency
    .slice(0, 20)
    .map((k) => k.keyword);
  const extractedFromHeadings = [...new Set(headingWords)];

  const allKeywords = [
    ...new Set([...metaKeywords, ...extractedFromHeadings, ...extractedFromContent]),
  ];

  return {
    metaKeywords,
    extractedFromContent,
    extractedFromHeadings,
    topKeywordsByFrequency,
    totalUniqueKeywords: allKeywords.length,
  };
}

function extractSemanticTags(html: string): PageSEOData['tags'] {
  const countTag = (tag: string): number => {
    const regex = new RegExp(`<${tag}[\\s>]`, 'gi');
    return (html.match(regex) || []).length;
  };

  const tags = {
    article: countTag('article'),
    section: countTag('section'),
    nav: countTag('nav'),
    header: countTag('header'),
    footer: countTag('footer'),
    aside: countTag('aside'),
    main: countTag('main'),
    figure: countTag('figure'),
    time: countTag('time'),
    address: countTag('address'),
    totalSemanticTags: 0,
  };

  tags.totalSemanticTags = Object.entries(tags)
    .filter(([key]) => key !== 'totalSemanticTags')
    .reduce((sum, [, val]) => sum + val, 0);

  return tags;
}

function extractContactInfo(text: string): PageSEOData['contactInfo'] {
  const phoneRegex =
    /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const addressRegex =
    /\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir)/gi;

  return {
    phones: [...new Set(Array.from(text.matchAll(phoneRegex)).map((m) => m[0]))],
    emails: [...new Set(Array.from(text.matchAll(emailRegex)).map((m) => m[0]))],
    addresses: [...new Set(Array.from(text.matchAll(addressRegex)).map((m) => m[0]))],
  };
}

function detectTechnologies(html: string): string[] {
  const technologies: string[] = [];

  if (html.includes('__next') || html.includes('_next/static')) technologies.push('Next.js');
  if (html.includes('__NUXT__') || html.includes('nuxt')) technologies.push('Nuxt.js');
  if (html.includes('react') || html.includes('__react')) technologies.push('React');
  if (html.includes('vue') || html.includes('__vue')) technologies.push('Vue.js');
  if (html.includes('angular') || html.includes('ng-')) technologies.push('Angular');
  if (html.includes('svelte')) technologies.push('Svelte');
  if (html.includes('gatsby')) technologies.push('Gatsby');
  if (html.includes('wp-content') || html.includes('wordpress')) technologies.push('WordPress');
  if (html.includes('shopify') || html.includes('cdn.shopify.com')) technologies.push('Shopify');
  if (html.includes('squarespace')) technologies.push('Squarespace');
  if (html.includes('wix.com')) technologies.push('Wix');
  if (html.includes('webflow')) technologies.push('Webflow');
  if (html.includes('tailwind') || html.includes('tw-')) technologies.push('Tailwind CSS');
  if (html.includes('bootstrap')) technologies.push('Bootstrap');
  if (html.includes('jquery') || html.includes('jQuery')) technologies.push('jQuery');
  if (html.includes('cloudflare')) technologies.push('Cloudflare');
  if (html.includes('vercel')) technologies.push('Vercel');
  if (html.includes('netlify')) technologies.push('Netlify');
  if (html.includes('stripe.com')) technologies.push('Stripe');

  return [...new Set(technologies)];
}

// ============================================
// PAGE DISCOVERY (fetch-based)
// ============================================

function discoverInternalLinks(
  html: string,
  baseUrl: string,
  options: PageDiscoveryOptions
): { url: string; pageType: string; priority: number }[] {
  const linkRegex = /<a[^>]*href=["']([^"'#][^"']*)["'][^>]*>/gi;
  const discovered = new Map<string, { url: string; pageType: string; priority: number }>();
  let match;

  try {
    const base = new URL(baseUrl);

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      if (!href) continue;

      try {
        const linkUrl = new URL(href, baseUrl);

        // Only internal links
        if (linkUrl.hostname !== base.hostname) continue;

        // Skip anchors, mailto, tel, javascript
        if (
          linkUrl.pathname === '/' ||
          linkUrl.pathname === base.pathname ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('javascript:')
        ) {
          continue;
        }

        // Skip common non-content paths
        const skipPaths = [
          '/wp-admin',
          '/wp-login',
          '/login',
          '/logout',
          '/cart',
          '/checkout',
          '/account',
          '/search',
          '.pdf',
          '.jpg',
          '.png',
          '.gif',
          '.svg',
          '.zip',
          '.css',
          '.js',
        ];
        if (skipPaths.some((skip) => linkUrl.pathname.toLowerCase().includes(skip))) {
          continue;
        }

        const fullUrl = `${linkUrl.origin}${linkUrl.pathname}`;
        if (discovered.has(fullUrl)) continue;

        const path = linkUrl.pathname.toLowerCase();
        let pageType = 'subpage';
        let priority = 1;

        // Categorize
        if (path.includes('/blog') || path.includes('/news') || path.includes('/article')) {
          pageType = 'blog';
          priority = options.includeBlog ? 3 : 0;
        } else if (path.includes('/product') || path.includes('/shop') || path.includes('/store')) {
          pageType = 'products';
          priority = options.includeProducts ? 4 : 0;
        } else if (path.includes('/about') || path.includes('/company') || path.includes('/team')) {
          pageType = 'about';
          priority = options.includeAbout ? 3 : 0;
        } else if (path.includes('/contact') || path.includes('/support')) {
          pageType = 'contact';
          priority = options.includeContact ? 2 : 0;
        } else if (path.includes('/service') || path.includes('/solution')) {
          pageType = 'services';
          priority = options.includeServices ? 4 : 0;
        } else if (path.includes('/pricing') || path.includes('/plan')) {
          pageType = 'pricing';
          priority = 4;
        } else if (path.includes('/feature') || path.includes('/how-it-works')) {
          pageType = 'features';
          priority = 3;
        } else if (path.includes('/faq') || path.includes('/help')) {
          pageType = 'support';
          priority = 2;
        } else if (path.includes('/case-stud') || path.includes('/testimonial') || path.includes('/result')) {
          pageType = 'social-proof';
          priority = 3;
        } else if (path.includes('/portfolio') || path.includes('/work') || path.includes('/project')) {
          pageType = 'portfolio';
          priority = 3;
        } else if (options.includeSubpages && path.split('/').filter(Boolean).length <= 2) {
          pageType = 'subpage';
          priority = 2;
        }

        if (priority > 0) {
          discovered.set(fullUrl, { url: fullUrl, pageType, priority });
        }
      } catch {
        // Invalid URL
      }
    }
  } catch {
    // Base URL parsing failed
  }

  return Array.from(discovered.values())
    .sort((a, b) => b.priority - a.priority || a.url.localeCompare(b.url))
    .slice(0, (options.maxPages || 10) - 1); // -1 for homepage
}

// ============================================
// CONTENT THEME IDENTIFICATION
// ============================================

function identifyContentThemes(pages: PageSEOData[]): string[] {
  const themes = new Set<string>();
  const allText = pages
    .map((p) => [
      ...p.seo.headings.h1,
      ...p.seo.headings.h2,
      ...p.keywords.extractedFromContent.slice(0, 5),
    ])
    .flat()
    .join(' ')
    .toLowerCase();

  const themePatterns = [
    { pattern: /product|service|solution|offering/i, theme: 'Products & Services' },
    { pattern: /about|company|team|mission|vision|value/i, theme: 'Company & Team' },
    { pattern: /pricing|cost|plan|subscription|package/i, theme: 'Pricing & Plans' },
    { pattern: /contact|support|help|faq|question/i, theme: 'Support & Contact' },
    { pattern: /blog|news|article|insight|resource/i, theme: 'Content & Resources' },
    { pattern: /feature|capability|function|benefit/i, theme: 'Features & Benefits' },
    { pattern: /security|privacy|compliance|trust/i, theme: 'Security & Trust' },
    { pattern: /integration|api|developer|technical/i, theme: 'Integration & Technical' },
    { pattern: /case.?study|testimonial|review|result/i, theme: 'Social Proof' },
    { pattern: /portfolio|work|project|gallery/i, theme: 'Portfolio & Work' },
    { pattern: /career|job|hiring|employment/i, theme: 'Careers' },
    { pattern: /partner|affiliate|reseller/i, theme: 'Partnerships' },
    { pattern: /demo|trial|free|start/i, theme: 'Lead Generation' },
    { pattern: /e-?commerce|shop|store|buy|cart/i, theme: 'E-Commerce' },
  ];

  themePatterns.forEach(({ pattern, theme }) => {
    if (pattern.test(allText)) themes.add(theme);
  });

  return Array.from(themes);
}

// ============================================
// API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const overallStart = Date.now();

  try {
    const requestBody = await request.json();
    const { url, options: rawOptions = {} } = requestBody;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid URL: "${url}". Must start with http:// or https://`,
        },
        { status: 400 }
      );
    }

    const options: PageDiscoveryOptions = {
      maxPages: rawOptions.maxPages ?? 10,
      includeSubpages: rawOptions.includeSubpages ?? true,
      includeBlog: rawOptions.includeBlog ?? true,
      includeProducts: rawOptions.includeProducts ?? true,
      includeAbout: rawOptions.includeAbout ?? true,
      includeContact: rawOptions.includeContact ?? true,
      includeServices: rawOptions.includeServices ?? true,
      maxDepth: rawOptions.maxDepth ?? 2,
    };

    console.log(`🌐 Multi-page scraping: ${url} (max ${options.maxPages} pages, serverless: ${isServerless})`);

    // Step 1: Fetch and parse homepage
    const homeStart = Date.now();
    const homepageHtml = await fetchHTML(url);
    const homepage = parsePageSEO(homepageHtml, url, 'homepage', 10, homeStart);

    // Step 2: Discover internal links from homepage
    const discoveredPages = discoverInternalLinks(homepageHtml, url, options);
    console.log(`🔍 Discovered ${discoveredPages.length} internal pages`);

    // Step 3: Scrape each discovered page
    const allPages: PageSEOData[] = [homepage];
    const pageTypes: Record<string, number> = { homepage: 1 };

    for (const discovered of discoveredPages) {
      try {
        const pageStart = Date.now();
        const pageHtml = await fetchHTML(discovered.url);
        const pageData = parsePageSEO(
          pageHtml,
          discovered.url,
          discovered.pageType,
          discovered.priority,
          pageStart
        );
        allPages.push(pageData);
        pageTypes[discovered.pageType] = (pageTypes[discovered.pageType] || 0) + 1;
        console.log(`✅ Scraped ${discovered.pageType}: ${discovered.url}`);
      } catch (error) {
        console.warn(
          `⚠️ Failed to scrape ${discovered.url}:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    // Step 4: Build site summary
    const allKeywords = [
      ...new Set(
        allPages.flatMap((p) => [
          ...p.keywords.metaKeywords,
          ...p.keywords.extractedFromContent.slice(0, 10),
          ...p.keywords.extractedFromHeadings,
        ])
      ),
    ];

    const allHeadings = [
      ...new Set(
        allPages.flatMap((p) => [
          ...p.seo.headings.h1,
          ...p.seo.headings.h2,
        ])
      ),
    ];

    const ga4Ids = [
      ...new Set(allPages.flatMap((p) => p.analytics.ga4MeasurementIds)),
    ];
    const gtmIds = [
      ...new Set(allPages.flatMap((p) => p.analytics.gtmContainerIds)),
    ];

    const totalWordCount = allPages.reduce((sum, p) => sum + p.wordCount, 0);
    const contentThemes = identifyContentThemes(allPages);

    const result: MultiPageResult = {
      url,
      totalPagesScraped: allPages.length,
      pages: allPages,
      siteMap: {
        totalPages: allPages.length,
        discoveredPages: allPages.map((p) => p.url),
        pageTypes,
      },
      siteSummary: {
        allKeywords,
        allHeadings,
        contentThemes,
        ga4MeasurementIds: ga4Ids,
        gtmContainerIds: gtmIds,
        totalWordCount,
        averageWordCount: Math.round(totalWordCount / allPages.length),
        pagesWithSchema: allPages.filter((p) => p.seo.hasSchemaMarkup).length,
        pagesWithCanonical: allPages.filter((p) => p.seo.hasCanonical).length,
        pagesWithOG: allPages.filter((p) => p.openGraph.title.length > 0).length,
        pagesWithTwitterCard: allPages.filter((p) => p.twitterCard.card.length > 0).length,
      },
      extractedAt: new Date().toISOString(),
    };

    const totalTime = Date.now() - overallStart;
    console.log(
      `✅ Multi-page scraping complete: ${allPages.length} pages in ${totalTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Multi-page scraping failed:', errorMessage);

    if (errorMessage.includes('blocked') || errorMessage.includes('403')) {
      return NextResponse.json(
        {
          success: false,
          error: `Website blocked the scraper. Try a different site or check if the URL is accessible.`,
          details: errorMessage,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Multi-page scraping failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

