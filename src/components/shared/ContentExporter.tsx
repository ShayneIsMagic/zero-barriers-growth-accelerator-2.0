/**
 * Content Exporter Component
 * Easy download/clipboard functions for collected Puppeteer data
 * Reusable across all analysis pages
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy, FileJson, FileText, Database, Tags } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportMetadataAsJSON,
  exportMetadataAsMarkdown,
  exportMetadataAsCSV,
} from '@/lib/utils/metadata-exporter';

interface ContentExporterProps {
  data: any;
  url: string;
  format?: 'puppeteer' | 'analysis' | 'both';
  filename?: string;
}

export function ContentExporter({
  data,
  url,
  format = 'both',
  filename,
}: ContentExporterProps) {
  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const handleCopyPuppeteerData = () => {
    if (!data?.comprehensive) {
      toast.error('No Puppeteer data available');
      return;
    }
    const jsonString = JSON.stringify(data.comprehensive, null, 2);
    copyToClipboard(jsonString, 'Puppeteer data');
  };

  const handleCopyAnalysisResult = () => {
    if (!data) {
      toast.error('No analysis data available');
      return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    copyToClipboard(jsonString, 'Analysis result');
  };

  const handleDownloadPuppeteerJSON = () => {
    if (!data?.comprehensive) {
      toast.error('No Puppeteer data available');
      return;
    }
    const jsonString = JSON.stringify(data.comprehensive, null, 2);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      jsonString,
      `${filename || `puppeteer-data-${safeUrl}-${timestamp}`}.json`,
      'application/json'
    );
  };

  const handleDownloadAnalysisJSON = () => {
    if (!data) {
      toast.error('No analysis data available');
      return;
    }
    const jsonString = JSON.stringify(data, null, 2);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      jsonString,
      `${filename || `analysis-result-${safeUrl}-${timestamp}`}.json`,
      'application/json'
    );
  };

  const handleDownloadMarkdown = () => {
    if (!data) {
      toast.error('No data available');
      return;
    }

    // Generate markdown report
    const markdown = generateMarkdownReport(data, url);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      markdown,
      `${filename || `content-report-${safeUrl}-${timestamp}`}.md`,
      'text/markdown'
    );
  };

  const handleCopyAll = () => {
    if (!data) {
      toast.error('No data available');
      return;
    }

    const allData = {
      url,
      timestamp: new Date().toISOString(),
      puppeteerData: data.comprehensive || null,
      analysisResult: data,
    };

    const jsonString = JSON.stringify(allData, null, 2);
    copyToClipboard(jsonString, 'All data');
  };

  // Metadata export handlers
  const handleCopyMetadata = () => {
    if (!data?.metadata) {
      toast.error('No metadata available');
      return;
    }
    const jsonString = exportMetadataAsJSON(data.metadata);
    copyToClipboard(jsonString, 'Metadata');
  };

  const handleDownloadMetadataJSON = () => {
    if (!data?.metadata) {
      toast.error('No metadata available');
      return;
    }
    const jsonString = exportMetadataAsJSON(data.metadata);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      jsonString,
      `${filename || `metadata-${safeUrl}-${timestamp}`}.json`,
      'application/json'
    );
  };

  const handleDownloadMetadataMarkdown = () => {
    if (!data?.metadata) {
      toast.error('No metadata available');
      return;
    }
    const markdown = exportMetadataAsMarkdown(data.metadata);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      markdown,
      `${filename || `metadata-${safeUrl}-${timestamp}`}.md`,
      'text/markdown'
    );
  };

  const handleDownloadMetadataCSV = () => {
    if (!data?.metadata) {
      toast.error('No metadata available');
      return;
    }
    const csv = exportMetadataAsCSV(data.metadata);
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(
      csv,
      `${filename || `metadata-${safeUrl}-${timestamp}`}.csv`,
      'text/csv'
    );
  };

  if (!data) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {format === 'puppeteer' || format === 'both' ? (
          <>
            <DropdownMenuItem onClick={handleCopyPuppeteerData}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Puppeteer Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPuppeteerJSON}>
              <FileJson className="mr-2 h-4 w-4" />
              Download Puppeteer JSON
            </DropdownMenuItem>
          </>
        ) : null}
        {format === 'analysis' || format === 'both' ? (
          <>
            <DropdownMenuItem onClick={handleCopyAnalysisResult}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Analysis Result
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadAnalysisJSON}>
              <FileJson className="mr-2 h-4 w-4" />
              Download Analysis JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadMarkdown}>
              <FileText className="mr-2 h-4 w-4" />
              Download Markdown Report
            </DropdownMenuItem>
          </>
        ) : null}
        {data?.metadata ? (
          <>
            <DropdownMenuItem onClick={handleCopyMetadata}>
              <Tags className="mr-2 h-4 w-4" />
              Copy Metadata
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadMetadataJSON}>
              <FileJson className="mr-2 h-4 w-4" />
              Download Metadata JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadMetadataMarkdown}>
              <FileText className="mr-2 h-4 w-4" />
              Download Metadata Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadMetadataCSV}>
              <FileText className="mr-2 h-4 w-4" />
              Download Metadata CSV
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuItem onClick={handleCopyAll}>
          <Copy className="mr-2 h-4 w-4" />
          Copy All Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function generateMarkdownReport(data: any, url: string): string {
  const timestamp = new Date().toLocaleString();
  
  let markdown = `# Content Analysis Report\n\n`;
  markdown += `**URL:** ${url}\n`;
  markdown += `**Date:** ${timestamp}\n\n`;
  markdown += `---\n\n`;

  // Add Puppeteer data summary if available
  if (data.comprehensive) {
    markdown += `## Collected Data Summary\n\n`;
    const pages = data.comprehensive.pages || [];
    markdown += `- **Pages Scraped:** ${pages.length}\n`;
    markdown += `- **Total Words:** ${pages.reduce((sum: number, p: any) => sum + (p.content?.wordCount || 0), 0)}\n`;
    markdown += `- **Keywords Found:** ${pages.reduce((sum: number, p: any) => sum + (p.keywords?.allKeywords?.length || 0), 0)}\n\n`;
    
    if (pages[0]?.metaTags) {
      markdown += `### SEO Metadata\n\n`;
      markdown += `- **Title:** ${pages[0].metaTags.title || 'N/A'}\n`;
      markdown += `- **Meta Description:** ${pages[0].metaTags.description || 'N/A'}\n`;
      markdown += `- **Canonical URL:** ${pages[0].metaTags.canonical || 'N/A'}\n\n`;
    }

    if (pages[0]?.analytics) {
      markdown += `### Analytics\n\n`;
      if (pages[0].analytics.googleAnalytics4?.measurementIds?.length > 0) {
        markdown += `- **GA4 IDs:** ${pages[0].analytics.googleAnalytics4.measurementIds.join(', ')}\n`;
      }
      if (pages[0].analytics.googleTagManager?.containerIds?.length > 0) {
        markdown += `- **GTM IDs:** ${pages[0].analytics.googleTagManager.containerIds.join(', ')}\n`;
      }
      markdown += `\n`;
    }
  }

  // Add analysis results
  if (data.comparison || data.analysis || data.elements) {
    markdown += `## Analysis Results\n\n`;
    markdown += `\`\`\`json\n`;
    markdown += JSON.stringify(
      data.comparison || data.analysis || data.elements,
      null,
      2
    );
    markdown += `\n\`\`\`\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*Generated by Zero Barriers Growth Accelerator*\n`;

  return markdown;
}

