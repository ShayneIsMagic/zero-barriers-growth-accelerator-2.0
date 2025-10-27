'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  copyToClipboard,
  downloadHTML,
  downloadMarkdown,
  emailReport,
  exportAsPDF,
} from '@/lib/report-export';
import { Copy, Download, FileCode, FileText, Mail } from 'lucide-react';
import { useState } from 'react';

interface ReportExportButtonsProps {
  analysis: any;
  className?: string;
}

/**
 * Export buttons for analysis reports
 * Allows downloading as PDF, Markdown, or HTML
 */
export function ReportExportButtons({
  analysis,
  className = '',
}: ReportExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadMarkdown = () => {
    try {
      downloadMarkdown(analysis);
      toast.success('Report downloaded as Markdown file');
    } catch (error) {
      toast.error('Failed to download Markdown');
    }
  };

  const handleDownloadHTML = () => {
    try {
      downloadHTML(analysis);
      toast.success('Report downloaded as HTML file');
    } catch (error) {
      toast.error('Failed to download HTML');
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportAsPDF(analysis);
      toast.success('Print dialog opened. Choose "Save as PDF"');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleEmailReport = () => {
    try {
      const email = prompt('Enter recipient email address:');
      if (email) {
        emailReport(analysis, email);
        toast.success('Report prepared for email');
      }
    } catch (error) {
      toast.error('Failed to prepare email');
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const success = await copyToClipboard(analysis, 'markdown');
      if (success) {
        toast.success('Report copied to clipboard as Markdown');
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        onClick={handleDownloadMarkdown}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Download Markdown
      </Button>

      <Button
        onClick={handleDownloadHTML}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <FileCode className="h-4 w-4" />
        Download HTML
      </Button>

      <Button
        onClick={handleExportPDF}
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export PDF'}
      </Button>

      <Button
        onClick={handleEmailReport}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Email Report
      </Button>

      <Button
        onClick={handleCopyMarkdown}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
    </div>
  );
}
