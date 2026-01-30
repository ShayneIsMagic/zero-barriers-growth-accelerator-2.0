/**
 * Standardized Data Collection Service
 * Provides a unified data collection format that all assessment frameworks can use
 * Based on the content-comparison page approach
 *
 * BACKUP SCRAPER: UniversalPuppeteerScraper is kept as a fallback option
 * Primary: UniversalPuppeteerScraper (content-comparison approach)
 * Backup: UniversalPuppeteerScraper (same tool, different error handling)
 */

import { UniversalPuppeteerScraper } from '@/lib/universal-puppeteer-scraper';

export interface StandardizedWebsiteData {
  // Basic Info
  url: string;
  title: string;
  metaDescription: string;
  wordCount: number;

  // Content
  cleanText: string;
  extractedKeywords: string[];

  // Structure
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };

  // SEO Data
  seo: {
    metaTitle: string;
    metaDescription: string;
    extractedKeywords: string[];
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
    };
  };

  // Business Context
  business: {
    industry: string;
    confidence: number;
    tags: string[];
  };

  // Technical Data
  technical: {
    images: number;
    links: number;
    schemaTypes: number;
  };

  // Timestamps
  scrapedAt: string;
  analysisId: string;
}

export interface StandardizedProposedData {
  cleanText: string;
  wordCount: number;
  title: string;
  metaDescription: string;
  extractedKeywords: string[];
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
}

export class StandardizedDataCollector {
  /**
   * Collect website data using the same approach as content-comparison
   * Primary method with backup fallback
   */
  static async collectWebsiteData(
    url: string
  ): Promise<StandardizedWebsiteData> {
    console.log(`🔍 Collecting standardized data for: ${url}`);

    try {
      // Primary: Use the same scraper as content-comparison
      const scrapedData = await UniversalPuppeteerScraper.scrapeWebsite(url);
      return this.transformToStandardizedFormat(scrapedData, url);
    } catch (primaryError) {
      console.warn(`⚠️ Primary scraper failed, trying backup: ${primaryError}`);

      try {
        // Backup: Retry with the same scraper (different error handling)
        const scrapedData = await this.backupScrapeWebsite(url);
        return this.transformToStandardizedFormat(scrapedData, url);
      } catch (backupError) {
        console.error(`❌ Both primary and backup scrapers failed:`, {
          primaryError,
          backupError,
        });
        throw new Error(
          `Data collection failed: ${backupError instanceof Error ? backupError.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Backup scraper method (same tool, different error handling)
   */
  private static async backupScrapeWebsite(url: string) {
    console.log(`🔄 Attempting backup scrape for: ${url}`);

    // Same scraper but with additional retry logic
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Backup attempt ${attempt}/${maxRetries}`);
        return await UniversalPuppeteerScraper.scrapeWebsite(url);
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error('Unknown backup error');
        console.warn(`⚠️ Backup attempt ${attempt} failed:`, lastError.message);

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Backup scraper failed after all retries');
  }

  /**
   * Transform scraped data to standardized format
   */
  private static transformToStandardizedFormat(
    scrapedData: any,
    _url: string
  ): StandardizedWebsiteData {
    const standardizedData: StandardizedWebsiteData = {
      url: scrapedData.url,
      title: scrapedData.title,
      metaDescription: scrapedData.seo.metaDescription,
      wordCount: scrapedData.wordCount,
      cleanText: scrapedData.cleanText,
      extractedKeywords: scrapedData.seo.extractedKeywords,
      headings: scrapedData.seo.headings,
      seo: {
        metaTitle: scrapedData.title,
        metaDescription: scrapedData.seo.metaDescription,
        extractedKeywords: scrapedData.seo.extractedKeywords,
        headings: scrapedData.seo.headings,
      },
      business: {
        industry: scrapedData.business?.industry || 'UNKNOWN',
        confidence: scrapedData.business?.confidence || 0,
        tags: scrapedData.business?.tags || [],
      },
      technical: {
        images: scrapedData.images || 0,
        links: scrapedData.links || 0,
        schemaTypes: scrapedData.seo?.schemaTypes || 0,
      },
      scrapedAt: new Date().toISOString(),
      analysisId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    console.log(
      `✅ Collected standardized data: ${standardizedData.wordCount} words, ${standardizedData.extractedKeywords.length} keywords`
    );
    return standardizedData;
  }

  /**
   * Process proposed content into standardized format
   */
  static processProposedContent(
    proposedContent: string
  ): StandardizedProposedData {
    const cleanText = proposedContent.trim();
    const wordCount = cleanText.split(/\s+/).length;

    return {
      cleanText,
      wordCount,
      title: this.extractTitle(cleanText),
      metaDescription: this.extractMetaDescription(cleanText),
      extractedKeywords: this.extractKeywordsFromText(cleanText),
      headings: this.extractHeadings(cleanText),
    };
  }

  /**
   * Generate a standardized prompt for any assessment framework
   */
  static generateAssessmentPrompt(
    frameworkName: string,
    frameworkDescription: string,
    elements: string[],
    categories: Record<string, string[]>,
    existingData: StandardizedWebsiteData,
    proposedData?: StandardizedProposedData
  ): string {
    return `Analyze website content using ${frameworkName} framework:

${frameworkDescription}

URL: ${existingData.url}

EXISTING CONTENT:
- Word Count: ${existingData.wordCount}
- Title: ${existingData.title}
- Meta Description: ${existingData.metaDescription}
- Keywords: ${existingData.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${existingData.cleanText.substring(0, 2000)}

${
  proposedData
    ? `
PROPOSED CONTENT:
- Word Count: ${proposedData.wordCount}
- Title: ${proposedData.title}
- Meta Description: ${proposedData.metaDescription}
- Keywords: ${proposedData.extractedKeywords.slice(0, 10).join(', ')}
- Content: ${proposedData.cleanText.substring(0, 2000)}
`
    : 'No proposed content provided - analyze existing only'
}

FRAMEWORK ELEMENTS (${elements.length} total):
${Object.entries(categories)
  .map(
    ([category, categoryElements]) =>
      `${category.toUpperCase()} (${categoryElements.length} elements): ${categoryElements.join(', ')}`
  )
  .join('\n')}

For each element, provide:
- Present (Yes/No)
- Evidence (specific text snippets)
- Score (0-100)
- Revenue opportunity

Return structured analysis with overall scores and recommendations.`;
  }

  // Helper functions (same as content-comparison)
  private static extractTitle(content: string): string {
    const lines = content.split('\n');
    return lines[0]?.trim().substring(0, 60) || 'Proposed Title';
  }

  private static extractMetaDescription(content: string): string {
    const lines = content.split('\n');
    return (
      lines.slice(0, 3).join(' ').trim().substring(0, 160) ||
      'Proposed description'
    );
  }

  private static extractKeywordsFromText(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4);

    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private static extractHeadings(content: string): {
    h1: string[];
    h2: string[];
    h3: string[];
  } {
    const lines = content.split('\n');
    return {
      h1: lines
        .filter((l) => l.startsWith('# '))
        .map((l) => l.replace('# ', '').trim()),
      h2: lines
        .filter((l) => l.startsWith('## '))
        .map((l) => l.replace('## ', '').trim()),
      h3: lines
        .filter((l) => l.startsWith('### '))
        .map((l) => l.replace('### ', '').trim()),
    };
  }
}
