/**
 * Optimized Content Collection System
 * Single comprehensive step that collects ALL content for parsing to different assessments
 */

import { ProductionExtractionResult } from './production-content-extractor';

export interface ComprehensiveContentData {
  // Core Content
  url: string;
  title: string;
  metaDescription: string;
  content: string;
  wordCount: number;

  // Technical Data
  technicalInfo: {
    images: number;
    links: number;
    forms: number;
    scripts: number;
    stylesheets: number;
  };

  // SEO Data
  seoData: {
    headings: { level: number; text: string; }[];
    metaTags: { name: string; content: string; }[];
    canonicalUrl?: string;
    robotsMeta?: string;
    sitemapUrl?: string;
  };

  // Content Structure
  contentStructure: {
    sections: { heading: string; content: string; }[];
    navigation: { text: string; url: string; }[];
    callToActions: { text: string; url: string; type: string; }[];
    testimonials: { quote: string; author: string; company?: string; }[];
  };

  // Performance Data
  performanceData: {
    loadTime?: number;
    pageSize?: number;
    requests?: number;
  };

  // Accessibility Data
  accessibilityData: {
    altTexts: { image: string; alt: string; }[];
    headings: { level: number; text: string; }[];
    links: { text: string; url: string; hasTitle: boolean; }[];
  };
}

export class OptimizedContentCollector {
  private url: string;
  private onProgressUpdate: ((step: string, progress: number) => void) | undefined;

  constructor(url: string, onProgressUpdate?: (step: string, progress: number) => void) {
    this.url = url;
    this.onProgressUpdate = onProgressUpdate;
  }

  /**
   * Single comprehensive content collection step
   * This is the PRIMARY step that collects ALL content for all assessments
   */
  async collectComprehensiveContent(): Promise<ComprehensiveContentData> {
    console.log(`🔍 Starting comprehensive content collection for: ${this.url}`);

    this.onProgressUpdate?.('Initializing content collection', 0);

    // Step 1: Basic content extraction
    this.onProgressUpdate?.('Extracting basic content', 20);
    const basicContent = await this.extractBasicContent();

    // Step 2: Technical analysis
    this.onProgressUpdate?.('Analyzing technical structure', 40);
    const technicalInfo = await this.extractTechnicalInfo(basicContent);

    // Step 3: SEO analysis
    this.onProgressUpdate?.('Extracting SEO data', 60);
    const seoData = await this.extractSEOData(basicContent);

    // Step 4: Content structure analysis
    this.onProgressUpdate?.('Analyzing content structure', 80);
    const contentStructure = await this.extractContentStructure(basicContent);

    // Step 5: Performance and accessibility data
    this.onProgressUpdate?.('Collecting performance data', 90);
    const performanceData = await this.extractPerformanceData();
    const accessibilityData = await this.extractAccessibilityData(basicContent);

    this.onProgressUpdate?.('Content collection complete', 100);

    const comprehensiveData: ComprehensiveContentData = {
      url: this.url,
      title: basicContent.title || '',
      metaDescription: basicContent.metaDescription || '',
      content: basicContent.content || '',
      wordCount: basicContent.wordCount || 0,
      technicalInfo,
      seoData,
      contentStructure,
      performanceData,
      accessibilityData
    };

    console.log(`✅ Comprehensive content collected: ${comprehensiveData.wordCount} words, ${comprehensiveData.technicalInfo.images} images, ${comprehensiveData.technicalInfo.links} links`);

    return comprehensiveData;
  }

  /**
   * Extract basic content using production extractor
   */
  private async extractBasicContent(): Promise<ProductionExtractionResult> {
    const { extractWithProduction } = await import('./production-content-extractor');
    return await extractWithProduction(this.url);
  }

  /**
   * Extract technical information
   */
  private async extractTechnicalInfo(content: ProductionExtractionResult): Promise<ComprehensiveContentData['technicalInfo']> {
    return {
      images: content.imageCount || 0,
      links: content.linkCount || 0,
      forms: content.formCount || 0,
      scripts: 0, // Will be populated by page analysis
      stylesheets: 0 // Will be populated by page analysis
    };
  }

  /**
   * Extract SEO-specific data
   */
  private async extractSEOData(content: ProductionExtractionResult): Promise<ComprehensiveContentData['seoData']> {
    // Parse headings from content
    const headings = this.parseHeadings(content.content || '');

    // Extract meta tags (simplified - in real implementation would parse HTML)
    const metaTags = [
      { name: 'description', content: content.metaDescription || '' },
      { name: 'keywords', content: '' }, // Would extract from meta tags
      { name: 'author', content: '' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ].filter(meta => meta.content);

    return {
      headings,
      metaTags
      // canonicalUrl, robotsMeta, and sitemapUrl will be extracted from HTML/robots.txt
    };
  }

  /**
   * Extract content structure
   */
  private async extractContentStructure(content: ProductionExtractionResult): Promise<ComprehensiveContentData['contentStructure']> {
    const sections = this.parseSections(content.content || '');
    const navigation: { text: string; url: string; }[] = []; // Will be extracted from HTML
    const callToActions = this.parseCallToActions(content.content || '');
    const testimonials = this.parseTestimonials(content.content || '');

    return {
      sections,
      navigation,
      callToActions,
      testimonials
    };
  }

  /**
   * Extract performance data (simplified)
   */
  private async extractPerformanceData(): Promise<ComprehensiveContentData['performanceData']> {
    // In real implementation, this would use Lighthouse or similar
    return {
      loadTime: 0, // Would be populated by actual performance measurement
      pageSize: 0,
      requests: 0
    };
  }

  /**
   * Extract accessibility data
   */
  private async extractAccessibilityData(content: ProductionExtractionResult): Promise<ComprehensiveContentData['accessibilityData']> {
    const altTexts: { image: string; alt: string; }[] = []; // Will be extracted from HTML
    const headings = this.parseHeadings(content.content || '');
    const links: { text: string; url: string; hasTitle: boolean; }[] = []; // Will be extracted from HTML

    return {
      altTexts,
      headings,
      links
    };
  }

  /**
   * Parse headings from content
   */
  private parseHeadings(content: string): { level: number; text: string; }[] {
    const headingRegex = /<(h[1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: { level: number; text: string; }[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        const level = parseInt(match[1].substring(1));
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        if (text) {
          headings.push({ level, text });
        }
      }
    }

    return headings;
  }

  /**
   * Parse sections from content
   */
  private parseSections(content: string): { heading: string; content: string; }[] {
    const sections: { heading: string; content: string; }[] = [];

    // Simple section parsing - in real implementation would be more sophisticated
    const headingMatches = content.match(/<(h[1-3])[^>]*>(.*?)<\/h[1-3]>/gi);

    if (headingMatches) {
      headingMatches.forEach((heading, index) => {
        const headingText = heading.replace(/<[^>]*>/g, '').trim();
        const nextHeading = headingMatches[index + 1];

        if (headingText) {
          const startIndex = content.indexOf(heading);
          const endIndex = nextHeading ? content.indexOf(nextHeading) : content.length;
          const sectionContent = content.substring(startIndex + heading.length, endIndex).trim();

          sections.push({
            heading: headingText,
            content: sectionContent.substring(0, 500) // Limit content length
          });
        }
      });
    }

    return sections;
  }

  /**
   * Parse navigation links
   */
  private parseNavigation(links: string[]): { text: string; url: string; }[] {
    return links.map(link => ({
      text: link.replace(/<[^>]*>/g, '').trim(),
      url: link
    }));
  }

  /**
   * Parse call-to-actions from content
   */
  private parseCallToActions(content: string): { text: string; url: string; type: string; }[] {
    const ctaRegex = /<(a|button)[^>]*>(.*?)<\/(a|button)>/gi;
    const ctas: { text: string; url: string; type: string; }[] = [];
    let match;

    while ((match = ctaRegex.exec(content)) !== null) {
      if (match[0] && match[2]) {
        const text = match[2].replace(/<[^>]*>/g, '').trim();
        const hrefMatch = match[0].match(/href=["']([^"']*)["']/);
        const url = hrefMatch && hrefMatch[1] ? hrefMatch[1] : '';

        if (text && (text.toLowerCase().includes('click') || text.toLowerCase().includes('get') || text.toLowerCase().includes('start'))) {
          ctas.push({
            text,
            url,
            type: 'button'
          });
        }
      }
    }

    return ctas;
  }

  /**
   * Parse testimonials from content
   */
  private parseTestimonials(content: string): { quote: string; author: string; company?: string; }[] {
    const testimonials: { quote: string; author: string; company?: string; }[] = [];

    // Simple testimonial parsing - look for quoted text with attribution
    const testimonialRegex = /"([^"]{50,200})"\s*[-\u2013]\s*([^,\n]+)(?:,\s*([^,\n]+))?/gi;
    let match;

    while ((match = testimonialRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        const testimonial: { quote: string; author: string; company?: string } = {
          quote: match[1].trim(),
          author: match[2].trim()
        };
        if (match[3]) {
          testimonial.company = match[3].trim();
        }
        testimonials.push(testimonial);
      }
    }

    return testimonials;
  }

  /**
   * Parse alt texts from images
   */
  private parseAltTexts(images: string[]): { image: string; alt: string; }[] {
    return images.map(img => {
      const altMatch = img.match(/alt=["']([^"']*)["']/);
      return {
        image: img,
        alt: altMatch && altMatch[1] ? altMatch[1] : ''
      };
    });
  }

  /**
   * Parse links for accessibility
   */
  private parseLinks(links: string[]): { text: string; url: string; hasTitle: boolean; }[] {
    return links.map(link => {
      const textMatch = link.match(/>([^<]+)</);
      const urlMatch = link.match(/href=["']([^"']*)["']/);
      const titleMatch = link.match(/title=["']([^"']*)["']/);

      return {
        text: textMatch && textMatch[1] ? textMatch[1].trim() : '',
        url: urlMatch && urlMatch[1] ? urlMatch[1] : '',
        hasTitle: !!titleMatch
      };
    });
  }
}
