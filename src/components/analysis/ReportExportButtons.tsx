'use client';

import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Mail, 
  Copy,
  FileCode 
} from 'lucide-react';
import { 
  downloadMarkdown, 
  downloadHTML, 
  exportAsPDF,
  emailReport,
  copyToClipboard 
} from '@/lib/report-export';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ReportExportButtonsProps {
  analysis: any;
  className?: string;
}

/**
 * Export buttons for analysis reports
 * Allows downloading as PDF, Markdown, or HTML
 */
export function ReportExportButtons({ analysis, className = '' }: ReportExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleDownloadMarkdown = () => {
    try {
      downloadMarkdown(analysis);
      toast({
        title: 'Downloaded',
        description: 'Report downloaded as Markdown file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download Markdown',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadHTML = () => {
    try {
      downloadHTML(analysis);
      toast({
        title: 'Downloaded',
        description: 'Report downloaded as HTML file',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download HTML',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      exportAsPDF(analysis);
      toast({
        title: 'PDF Export',
        description: 'Print dialog opened. Choose "Save as PDF"',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export PDF',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleEmailReport = () => {
    try {
      const email = prompt('Enter recipient email address:');
      if (email) {
        emailReport(analysis, email);
        toast({
          title: 'Email Client Opened',
          description: 'Report prepared for email',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to prepare email',
        variant: 'destructive',
      });
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const success = await copyToClipboard(analysis, 'markdown');
      if (success) {
        toast({
          title: 'Copied',
          description: 'Report copied to clipboard as Markdown',
        });
      } else {
        throw new Error('Copy failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
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

