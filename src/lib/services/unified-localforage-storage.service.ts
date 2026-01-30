/**
 * Unified Local Forage Storage Service
 * Simple storage for: Puppeteer data, Reports, Markdown, JSON
 * Everything stored in Local Forage for easy access and reuse
 */

import localforage from 'localforage';

// Store configurations
const puppeteerStore = localforage.createInstance({
  name: 'ZeroBarriers',
  storeName: 'puppeteer_data',
  description: 'Puppeteer scraped content, tags, keywords, metadata',
});

const reportsStore = localforage.createInstance({
  name: 'ZeroBarriers',
  storeName: 'reports',
  description: 'Analysis reports in Markdown and JSON format',
});

const importedFilesStore = localforage.createInstance({
  name: 'ZeroBarriers',
  storeName: 'imported_files',
  description: 'Uploaded Markdown/JSON files',
});

export interface StoredPuppeteerData {
  url: string;
  data: any; // Full PuppeteerComprehensiveCollector result
  timestamp: string;
  metadata: {
    tags: any;
    keywords: any;
    seo: any;
    analytics: any;
  };
}

export interface StoredReport {
  id: string;
  url: string;
  domain?: string; // Extracted domain name (e.g., "zerobarriers.io")
  displayName?: string; // Human-readable identifier (e.g., "zerobarriers.io - Content Comparison - Jan 30, 2025")
  type: 'markdown' | 'json' | 'analysis';
  content: string | any; // Markdown string or JSON object
  format: 'markdown' | 'json';
  timestamp: string;
  formattedDate?: string; // Human-readable date (e.g., "Jan 30, 2025 3:45 PM")
  version?: number; // Version number for same URL + assessment type
  assessmentType?: string; // Which assessment generated this
  assessmentDisplayName?: string; // Human-readable assessment name (e.g., "Content Comparison Analysis")
}

export interface ImportedFile {
  id: string;
  filename: string;
  type: 'markdown' | 'json';
  content: string | any;
  uploadedAt: string;
}

export class UnifiedLocalForageStorage {
  // ============================================
  // PUPPETEER DATA STORAGE
  // ============================================

  /**
   * Store Puppeteer collected data
   */
  static async storePuppeteerData(
    url: string,
    puppeteerData: any
  ): Promise<void> {
    const stored: StoredPuppeteerData = {
      url,
      data: puppeteerData,
      timestamp: new Date().toISOString(),
      metadata: {
        tags: puppeteerData.pages?.[0]?.metaTags || {},
        keywords: puppeteerData.pages?.[0]?.keywords || {},
        seo: puppeteerData.seo || {},
        analytics: puppeteerData.pages?.[0]?.analytics || {},
      },
    };

    await puppeteerStore.setItem(url, stored);
  }

  /**
   * Get stored Puppeteer data
   */
  static async getPuppeteerData(
    url: string
  ): Promise<StoredPuppeteerData | null> {
    return await puppeteerStore.getItem<StoredPuppeteerData>(url);
  }

  /**
   * Get all stored URLs
   */
  static async getAllStoredUrls(): Promise<string[]> {
    return (await puppeteerStore.keys()) as string[];
  }

  /**
   * Store a single page (extracted from comprehensive data)
   */
  static async storePage(
    pageUrl: string,
    pageData: any,
    siteUrl?: string
  ): Promise<void> {
    const stored: StoredPuppeteerData = {
      url: pageUrl,
      data: {
        url: siteUrl || pageUrl,
        timestamp: new Date().toISOString(),
        pages: [pageData], // Single page in pages array
        summary: {
          totalPages: 1,
          pagesAnalyzed: 1,
        },
      },
      timestamp: new Date().toISOString(),
      metadata: {
        tags: pageData.metaTags || {},
        keywords: pageData.keywords || {},
        seo: pageData.seo || {},
        analytics: pageData.analytics || {},
      },
    };

    // Store with page URL as key (e.g., "https://example.com/services")
    await puppeteerStore.setItem(pageUrl, stored);
  }

  /**
   * Get stored page by URL
   */
  static async getPage(pageUrl: string): Promise<StoredPuppeteerData | null> {
    return await puppeteerStore.getItem<StoredPuppeteerData>(pageUrl);
  }

  /**
   * Get all pages for a site URL
   */
  static async getPagesForSite(siteUrl: string): Promise<Array<{ url: string; pageLabel: string; pageType: string }>> {
    const allKeys = await puppeteerStore.keys();
    const pages: Array<{ url: string; pageLabel: string; pageType: string }> = [];

    for (const key of allKeys) {
      const stored = await puppeteerStore.getItem<StoredPuppeteerData>(key);
      if (stored && stored.data?.pages) {
        // Check if this is a page from the site
        for (const page of stored.data.pages) {
          if (page.url.startsWith(siteUrl) || stored.url.startsWith(siteUrl)) {
            pages.push({
              url: page.url,
              pageLabel: page.pageLabel || 'Page',
              pageType: page.pageType || 'page',
            });
          }
        }
      }
    }

    return pages;
  }

  // ============================================
  // REPORT STORAGE
  // ============================================

  /**
   * Extract domain from URL
   */
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      return match ? match[1] : url;
    }
  }

  /**
   * Get human-readable assessment name
   */
  private static getAssessmentDisplayName(assessmentType?: string): string {
    const names: Record<string, string> = {
      'content-comparison': 'Content Comparison Analysis',
      'b2c-elements': 'B2C Elements of Value',
      'b2b-elements': 'B2B Elements of Value',
      'clifton-strengths': 'CliftonStrengths Analysis',
      'golden-circle': 'Golden Circle Analysis',
      'jambojon-archetypes': 'Jambojon Brand Archetypes',
      'google-tools': 'Google Tools Analysis',
      'automated-google-tools': 'Automated Google Tools',
    };
    return assessmentType ? (names[assessmentType] || assessmentType) : 'Report';
  }

  /**
   * Format date for display
   */
  private static formatDateForDisplay(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get version number for reports with same URL and assessment type
   */
  private static async getNextVersion(
    url: string,
    assessmentType?: string
  ): Promise<number> {
    const existingReports = await this.getAllReports();
    const matchingReports = existingReports.filter(
      (r) => r.url === url && r.assessmentType === assessmentType
    );
    return matchingReports.length + 1;
  }

  /**
   * Store a report (Markdown or JSON)
   */
  static async storeReport(
    url: string,
    content: string | any,
    format: 'markdown' | 'json',
    assessmentType?: string
  ): Promise<string> {
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const domain = this.extractDomain(url);
    const formattedDate = this.formatDateForDisplay(timestamp);
    const version = await this.getNextVersion(url, assessmentType);
    const assessmentDisplayName = this.getAssessmentDisplayName(assessmentType);
    const displayName = `${domain} - ${assessmentDisplayName} - ${formattedDate.split(',')[0]}${version > 1 ? ` (v${version})` : ''}`;

    const report: StoredReport = {
      id: reportId,
      url,
      domain,
      displayName,
      type: format === 'markdown' ? 'markdown' : 'json',
      content,
      format,
      timestamp,
      formattedDate,
      version,
      assessmentType,
      assessmentDisplayName,
    };

    await reportsStore.setItem(reportId, report);
    return reportId;
  }

  /**
   * Get a report by ID
   */
  static async getReport(reportId: string): Promise<StoredReport | null> {
    return await reportsStore.getItem<StoredReport>(reportId);
  }

  /**
   * Get all reports for a URL
   */
  static async getReportsForUrl(url: string): Promise<StoredReport[]> {
    const keys = await reportsStore.keys();
    const reports: StoredReport[] = [];

    for (const key of keys) {
      const report = await reportsStore.getItem<StoredReport>(key);
      if (report && report.url === url) {
        reports.push(report);
      }
    }

    return reports.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get all reports
   */
  static async getAllReports(): Promise<StoredReport[]> {
    const keys = await reportsStore.keys();
    const reports: StoredReport[] = [];

    for (const key of keys) {
      const report = await reportsStore.getItem<StoredReport>(key);
      if (report) {
        reports.push(report);
      }
    }

    return reports.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // ============================================
  // FILE IMPORT/UPLOAD
  // ============================================

  /**
   * Import/upload a Markdown or JSON file
   */
  static async importFile(
    file: File
  ): Promise<{ id: string; data: any }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const fileId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          let parsedContent: any;

          if (file.type === 'application/json' || file.name.endsWith('.json')) {
            parsedContent = JSON.parse(content);
          } else {
            // Markdown or text
            parsedContent = content;
          }

          const imported: ImportedFile = {
            id: fileId,
            filename: file.name,
            type:
              file.type === 'application/json' || file.name.endsWith('.json')
                ? 'json'
                : 'markdown',
            content: parsedContent,
            uploadedAt: new Date().toISOString(),
          };

          await importedFilesStore.setItem(fileId, imported);

          resolve({
            id: fileId,
            data: parsedContent,
          });
        } catch (error) {
          reject(
            new Error(
              `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Get imported file
   */
  static async getImportedFile(fileId: string): Promise<ImportedFile | null> {
    return await importedFilesStore.getItem<ImportedFile>(fileId);
  }

  /**
   * Get all imported files
   */
  static async getAllImportedFiles(): Promise<ImportedFile[]> {
    const keys = await importedFilesStore.keys();
    const files: ImportedFile[] = [];

    for (const key of keys) {
      const file = await importedFilesStore.getItem<ImportedFile>(key);
      if (file) {
        files.push(file);
      }
    }

    return files.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Clear all data
   */
  static async clearAll(): Promise<void> {
    await Promise.all([
      puppeteerStore.clear(),
      reportsStore.clear(),
      importedFilesStore.clear(),
    ]);
  }

  /**
   * Get storage info
   */
  static async getStorageInfo(): Promise<{
    puppeteerUrls: number;
    reports: number;
    importedFiles: number;
  }> {
    return {
      puppeteerUrls: (await puppeteerStore.keys()).length,
      reports: (await reportsStore.keys()).length,
      importedFiles: (await importedFilesStore.keys()).length,
    };
  }
}

