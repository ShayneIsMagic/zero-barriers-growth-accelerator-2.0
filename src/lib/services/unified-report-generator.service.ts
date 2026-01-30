/**
 * Unified Report Generator Service
 * Converts stored Markdown/JSON from Local Forage into printable formats
 * Simple: Read from Local Forage → Convert → Print/Save
 */

import { UnifiedLocalForageStorage, StoredReport } from './unified-localforage-storage.service';

export interface PrintableReport {
  html: string;
  markdown: string;
  json: any;
  pdf?: Blob; // Optional PDF generation
}

export class UnifiedReportGenerator {
  /**
   * Generate printable report from stored report ID
   */
  static async generateFromReportId(
    reportId: string
  ): Promise<PrintableReport> {
    const report = await UnifiedLocalForageStorage.getReport(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    return this.generateFromReport(report);
  }

  /**
   * Generate printable report from stored report
   */
  static async generateFromReport(
    report: StoredReport
  ): Promise<PrintableReport> {
    let markdown = '';
    let json: any = null;

    if (report.format === 'markdown') {
      markdown = typeof report.content === 'string' ? report.content : '';
      json = { report, content: report.content };
    } else {
      json = typeof report.content === 'object' ? report.content : report.content;
      markdown = this.jsonToMarkdown(json, report);
    }

    const html = this.markdownToHtml(markdown, report);

    return {
      html,
      markdown,
      json,
    };
  }

  /**
   * Generate report from Puppeteer data (for reuse across assessments)
   */
  static async generateFromPuppeteerData(
    url: string,
    assessmentType?: string
  ): Promise<PrintableReport> {
    const puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(url);
    if (!puppeteerData) {
      throw new Error(`No Puppeteer data found for: ${url}`);
    }

    const markdown = this.puppeteerDataToMarkdown(puppeteerData, assessmentType);
    const json = puppeteerData.data;
    const html = this.markdownToHtml(markdown, {
      id: 'puppeteer-report',
      url,
      type: 'markdown',
      content: markdown,
      format: 'markdown',
      timestamp: puppeteerData.timestamp,
      assessmentType,
    });

    return {
      html,
      markdown,
      json,
    };
  }

  /**
   * Convert Markdown to HTML (printable)
   */
  private static markdownToHtml(
    markdown: string,
    report: StoredReport
  ): string {
    // Simple markdown to HTML conversion
    const html = markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/^\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    // Wrap in printable HTML structure
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${report.url} - Analysis Report</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">Print Report</button>
    <button onclick="window.location.href='data:text/html;charset=utf-8,${encodeURIComponent(html)}'">Save HTML</button>
  </div>
  <div class="report-content">
    ${html}
  </div>
</body>
</html>`;
  }

  /**
   * Convert JSON to Markdown
   */
  private static jsonToMarkdown(json: any, report: StoredReport): string {
    let markdown = `# Analysis Report\n\n`;
    markdown += `**URL:** ${report.url}\n`;
    markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
    if (report.assessmentType) {
      markdown += `**Assessment Type:** ${report.assessmentType}\n`;
    }
    markdown += `\n---\n\n`;

    if (typeof json === 'object') {
      markdown += this.objectToMarkdown(json);
    } else {
      markdown += json.toString();
    }

    return markdown;
  }

  /**
   * Convert object to Markdown recursively
   */
  private static objectToMarkdown(obj: any, depth = 0): string {
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    let markdown = '';
    const indent = '  '.repeat(depth);
    const headingLevel = Math.min(depth + 2, 6);

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        markdown += `${indent}${index + 1}. `;
        if (typeof item === 'object') {
          markdown += '\n' + this.objectToMarkdown(item, depth + 1);
        } else {
          markdown += String(item) + '\n';
        }
      });
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          markdown += `${indent}${'#'.repeat(headingLevel)} ${key}\n\n`;
          markdown += this.objectToMarkdown(value, depth + 1) + '\n';
        } else {
          markdown += `${indent}**${key}:** ${String(value)}\n`;
        }
      });
    }

    return markdown;
  }

  /**
   * Convert Puppeteer data to Markdown
   */
  private static puppeteerDataToMarkdown(
    data: any,
    assessmentType?: string
  ): string {
    let markdown = `# Website Analysis Report\n\n`;
    markdown += `**URL:** ${data.url}\n`;
    markdown += `**Collected:** ${new Date(data.timestamp).toLocaleString()}\n`;
    if (assessmentType) {
      markdown += `**Assessment:** ${assessmentType}\n`;
    }
    markdown += `\n---\n\n`;

    // SEO Metadata
    if (data.metadata.tags) {
      markdown += `## SEO Metadata\n\n`;
      markdown += `- **Title:** ${data.metadata.tags.title || 'N/A'}\n`;
      markdown += `- **Description:** ${data.metadata.tags.description || 'N/A'}\n`;
      markdown += `- **Keywords:** ${data.metadata.tags.keywords || 'N/A'}\n`;
      markdown += `\n`;
    }

    // Keywords
    if (data.metadata.keywords?.allKeywords) {
      markdown += `## Keywords\n\n`;
      markdown += data.metadata.keywords.allKeywords.slice(0, 20).join(', ') + '\n\n';
    }

    // Analytics
    if (data.metadata.analytics) {
      markdown += `## Analytics\n\n`;
      if (data.metadata.analytics.googleAnalytics4?.measurementIds) {
        markdown += `- **GA4 IDs:** ${data.metadata.analytics.googleAnalytics4.measurementIds.join(', ')}\n`;
      }
      markdown += `\n`;
    }

    // Content Summary
    if (data.data?.content) {
      markdown += `## Content Summary\n\n`;
      markdown += `- **Total Words:** ${data.data.content.totalWords || 0}\n`;
      markdown += `- **Pages Analyzed:** ${data.data.pages?.length || 0}\n`;
      markdown += `\n`;
    }

    return markdown;
  }

  /**
   * Download report as file
   */
  static downloadReport(
    report: PrintableReport,
    filename: string,
    format: 'html' | 'markdown' | 'json' = 'html'
  ): void {
    let content = '';
    let mimeType = '';
    let extension = '';

    switch (format) {
      case 'html':
        content = report.html;
        mimeType = 'text/html';
        extension = 'html';
        break;
      case 'markdown':
        content = report.markdown;
        mimeType = 'text/markdown';
        extension = 'md';
        break;
      case 'json':
        content = JSON.stringify(report.json, null, 2);
        mimeType = 'application/json';
        extension = 'json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Print report
   */
  static printReport(report: PrintableReport): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    printWindow.document.write(report.html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

