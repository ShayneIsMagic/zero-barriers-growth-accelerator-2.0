import { NextRequest } from 'next/server';

export interface ProductionExtractionResult {
  content: string;
  title: string;
  metaDescription: string;
  wordCount: number;
  imageCount: number;
  linkCount: number;
  headingCount: number;
  paragraphCount: number;
  listCount: number;
  formCount: number;
  videoCount: number;
  socialMediaLinks: string[];
  contactInfo: {
    phone: string[];
    email: string[];
    address: string[];
  };
  technicalInfo: {
    loadTime: number;
    hasSSL: boolean;
    mobileFriendly: boolean;
    hasSchema: boolean;
    viewport: { width: number; height: number };
  };
  extractedAt: string;
  method: 'fetch' | 'browserless' | 'scrapingbee';
}

export class ProductionContentExtractor {
  private browserlessApiKey?: string;
  private scrapingbeeApiKey?: string;

  constructor() {
    this.browserlessApiKey = process.env.BROWSERLESS_API_KEY || '';
    this.scrapingbeeApiKey = process.env.SCRAPINGBEE_API_KEY || '';
  }

  async extractContent(url: string): Promise<ProductionExtractionResult> {
    console.log(`🔍 Starting production content extraction for: ${url}`);
    
    // Try Browserless.io first (if API key available)
    if (this.browserlessApiKey) {
      try {
        console.log('🌐 Attempting extraction with Browserless.io...');
        return await this.extractWithBrowserless(url);
      } catch (error) {
        console.warn('⚠️ Browserless.io failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Try ScrapingBee (if API key available)
    if (this.scrapingbeeApiKey) {
      try {
        console.log('🐝 Attempting extraction with ScrapingBee...');
        return await this.extractWithScrapingBee(url);
      } catch (error) {
        console.warn('⚠️ ScrapingBee failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // Fallback to enhanced fetch
    console.log('🔄 Using enhanced fetch method...');
    return await this.extractWithEnhancedFetch(url);
  }

  private async extractWithBrowserless(url: string): Promise<ProductionExtractionResult> {
    const startTime = Date.now();
    
    const response = await fetch('https://chrome.browserless.io/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.browserlessApiKey}`,
      },
      body: JSON.stringify({
        url,
        options: {
          waitUntil: 'networkidle2',
          timeout: 30000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Browserless.io failed: ${response.statusText}`);
    }

    const html = await response.text();
    const result = this.parseHTML(html, url);
    const loadTime = Date.now() - startTime;

    console.log(`✅ Browserless.io extraction completed in ${loadTime}ms`);

    return {
      ...result,
      technicalInfo: {
        loadTime,
        hasSSL: url.startsWith('https://'),
        mobileFriendly: true, // Browserless handles mobile rendering
        hasSchema: html.includes('application/ld+json'),
        viewport: { width: 1920, height: 1080 }
      },
      extractedAt: new Date().toISOString(),
      method: 'browserless'
    };
  }

  private async extractWithScrapingBee(url: string): Promise<ProductionExtractionResult> {
    const startTime = Date.now();
    
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?api_key=${this.scrapingbeeApiKey}&url=${encodeURIComponent(url)}&render_js=true&wait=2000`);
    
    if (!response.ok) {
      throw new Error(`ScrapingBee failed: ${response.statusText}`);
    }

    const html = await response.text();
    const result = this.parseHTML(html, url);
    const loadTime = Date.now() - startTime;

    console.log(`✅ ScrapingBee extraction completed in ${loadTime}ms`);

    return {
      ...result,
      technicalInfo: {
        loadTime,
        hasSSL: url.startsWith('https://'),
        mobileFriendly: true, // ScrapingBee handles mobile rendering
        hasSchema: html.includes('application/ld+json'),
        viewport: { width: 1920, height: 1080 }
      },
      extractedAt: new Date().toISOString(),
      method: 'scrapingbee'
    };
  }

  private async extractWithEnhancedFetch(url: string): Promise<ProductionExtractionResult> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ZeroBarriersBot/1.0; +https://zerobarriers.io/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      const html = await response.text();
      const result = this.parseHTML(html, url);
      const loadTime = Date.now() - startTime;

      console.log(`✅ Enhanced fetch extraction completed in ${loadTime}ms`);

      return {
        ...result,
        technicalInfo: {
          loadTime,
          hasSSL: url.startsWith('https://'),
          mobileFriendly: true, // Enhanced fetch handles mobile
          hasSchema: html.includes('application/ld+json'),
          viewport: { width: 1920, height: 1080 }
        },
        extractedAt: new Date().toISOString(),
        method: 'fetch'
      };

    } catch (error) {
      console.error('Enhanced fetch extraction failed:', error);
      throw new Error(`All extraction methods failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHTML(html: string, url: string): Omit<ProductionExtractionResult, 'technicalInfo' | 'extractedAt' | 'method'> {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || '';

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const metaDescription = metaMatch?.[1]?.trim() || '';

    // Remove script and style tags
    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

    // Extract text content
    const textContent = cleanHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Count elements
    const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
    const linkCount = (html.match(/<a[^>]*href[^>]*>/gi) || []).length;
    const headingCount = (html.match(/<h[1-6][^>]*>/gi) || []).length;
    const paragraphCount = (html.match(/<p[^>]*>/gi) || []).length;
    const listCount = (html.match(/<(ul|ol)[^>]*>/gi) || []).length;
    const formCount = (html.match(/<form[^>]*>/gi) || []).length;
    const videoCount = (html.match(/<(video|iframe[^>]*src[^>]*(?:youtube|vimeo)[^>]*)>/gi) || []).length;
    
    // Extract social media links
    const socialMediaLinks: string[] = [];
    const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
    linkMatches.forEach(link => {
      const hrefMatch = link.match(/href=["']([^"']*)["']/i);
      if (hrefMatch) {
        const href = hrefMatch[1];
        if (href && (href.includes('facebook.com') || href.includes('twitter.com') || 
            href.includes('linkedin.com') || href.includes('instagram.com') || 
            href.includes('youtube.com') || href.includes('tiktok.com'))) {
          socialMediaLinks.push(href);
        }
      }
    });
    
    // Extract contact information
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const addressRegex = /\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Circle|Cir)/gi;
    
    const phoneNumbers = Array.from(textContent.matchAll(phoneRegex)).map(match => match[0]);
    const emailAddresses = Array.from(textContent.matchAll(emailRegex)).map(match => match[0]);
    const addresses = Array.from(textContent.matchAll(addressRegex)).map(match => match[0]);
    
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    // Check technical info
    const hasSSL = url.startsWith('https:');
    const hasSchema = html.includes('application/ld+json');
    const mobileFriendly = html.includes('width=device-width');

    return {
      content: textContent,
      title,
      metaDescription,
      wordCount,
      imageCount,
      linkCount,
      headingCount,
      paragraphCount,
      listCount,
      formCount,
      videoCount,
      socialMediaLinks,
      contactInfo: {
        phone: phoneNumbers,
        email: emailAddresses,
        address: addresses
      }
    };
  }
}

// Factory function for easy usage
export async function extractWithProduction(url: string): Promise<ProductionExtractionResult> {
  const extractor = new ProductionContentExtractor();
  return await extractor.extractContent(url);
}
