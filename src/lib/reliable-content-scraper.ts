/**
 * Reliable Content Scraper
 * Extracts content, meta tags, and keywords from any website
 */

export interface ScrapedData {
  // Main Content
  content: string;
  cleanText: string;
  wordCount: number;

  // Meta Tags
  title: string;
  metaDescription: string;
  metaKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;

  // Structure
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };

  // Keywords & Rankings
  extractedKeywords: string[];
  topicClusters: string[];

  // Technical
  imageCount: number;
  linkCount: number;
  hasSSL: boolean;
  loadTime: number;

  // SEO
  schemaTypes: string[];
  structuredData: any[];

  timestamp: string;
}

export async function scrapeWebsiteContent(url: string): Promise<ScrapedData> {
  const startTime = Date.now();

  try {
    // Use Puppeteer for reliable scraping
    const puppeteer = require('puppeteer');

    console.log(`🔍 Launching browser for: ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log(`📄 Page loaded, extracting content...`);

    // Extract all data in one evaluation
    const scrapedData = await page.evaluate(() => {
      // Get main text content
      const bodyText = document.body.innerText || '';
      const cleanText = bodyText.replace(/\s+/g, ' ').trim();

      // Get meta tags
      const getMetaContent = (name: string) => {
        const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return meta?.getAttribute('content') || '';
      };

      // Extract headings
      const h1Elements = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
      const h2Elements = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim());
      const h3Elements = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim());

      // Get structured data
      const schemaScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const structuredData = schemaScripts.map(script => {
        try {
          return JSON.parse(script.textContent || '');
        } catch {
          return null;
        }
      }).filter(Boolean);

      const schemaTypes = structuredData.map((data: any) => data['@type']).filter(Boolean);

      return {
        content: document.documentElement.innerHTML,
        cleanText: cleanText.substring(0, 50000), // First 50k chars
        wordCount: cleanText.split(/\s+/).length,
        title: document.title || '',
        metaDescription: getMetaContent('description'),
        metaKeywords: (getMetaContent('keywords') || '').split(',').map(k => k.trim()).filter(Boolean),
        ogTitle: getMetaContent('og:title'),
        ogDescription: getMetaContent('og:description'),
        ogImage: getMetaContent('og:image'),
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
        headings: {
          h1: h1Elements,
          h2: h2Elements,
          h3: h3Elements
        },
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a').length,
        structuredData,
        schemaTypes
      };
    });

    await browser.close();

    const loadTime = Date.now() - startTime;

    // Extract keywords from content
    const extractedKeywords = extractKeywords(scrapedData.cleanText, scrapedData.headings);
    const topicClusters = findTopicClusters(scrapedData.headings.h2);

    console.log(`✅ Scraping complete - ${scrapedData.wordCount} words, ${extractedKeywords.length} keywords`);

    return {
      ...scrapedData,
      extractedKeywords,
      topicClusters,
      hasSSL: url.startsWith('https'),
      loadTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Puppeteer scraping failed:', error);

    // Fallback to basic fetch
    return await fallbackScrape(url);
  }
}

/**
 * Extract keywords from content and headings
 */
function extractKeywords(text: string, headings: { h1: string[]; h2: string[]; h3: string[] }): string[] {
  const keywords: string[] = [];

  // From H1 (highest weight)
  headings.h1.forEach(h1 => {
    const words = h1.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    keywords.push(...words);
  });

  // From H2 (medium weight)
  headings.h2.forEach(h2 => {
    const words = h2.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);
    keywords.push(...words);
  });

  // From main content (extract frequent terms)
  const contentWords = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 5);

  // Count word frequency
  const wordFreq: Record<string, number> = {};
  contentWords.forEach(word => {
    if (!isStopWord(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Get top 20 most frequent words
  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);

  keywords.push(...topWords);

  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Find topic clusters from H2 headings
 */
function findTopicClusters(h2Headings: string[]): string[] {
  return h2Headings
    .map(h => h.toLowerCase().trim())
    .filter(h => h.length > 0)
    .slice(0, 10); // Top 10 topics
}

/**
 * Check if word is a stop word
 */
function isStopWord(word: string): boolean {
  const stopWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'will', 'your', 'our', 'their', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once'];
  return stopWords.includes(word);
}

/**
 * Fallback scraping (basic fetch)
 */
async function fallbackScrape(url: string): Promise<ScrapedData> {
  console.log('⚠️ Using fallback scraper (basic fetch)');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZeroBarriersBot/1.0)'
      }
    });

    const html = await response.text();

    // Basic extraction
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';

    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
    const metaDescription = metaDescMatch ? metaDescMatch[1] : '';

    const cleanText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      content: html,
      cleanText: cleanText.substring(0, 50000),
      wordCount: cleanText.split(/\s+/).length,
      title,
      metaDescription,
      metaKeywords: [],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      canonicalUrl: '',
      headings: { h1: [], h2: [], h3: [] },
      extractedKeywords: extractKeywords(cleanText, { h1: [], h2: [], h3: [] }),
      topicClusters: [],
      imageCount: (html.match(/<img/gi) || []).length,
      linkCount: (html.match(/<a/gi) || []).length,
      hasSSL: url.startsWith('https'),
      loadTime: 0,
      schemaTypes: [],
      structuredData: [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to scrape content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

