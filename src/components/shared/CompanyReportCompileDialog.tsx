'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';
import {
  compileCompanyReports,
  filterReportsForCompile,
} from '@/lib/framework/report-compiler';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyReportCompileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyKey: string;
  reports: StoredReport[];
}

export function CompanyReportCompileDialog({
  open,
  onOpenChange,
  companyKey,
  reports,
}: CompanyReportCompileDialogProps) {
  const compiled = useMemo(() => {
    if (!open || reports.length === 0) {
      return null;
    }
    return compileCompanyReports(
      companyKey,
      filterReportsForCompile(reports).length > 0
        ? reports
        : reports.filter((r) => r.format === 'json')
    );
  }, [open, companyKey, reports]);

  const handleCopy = async () => {
    if (!compiled) {
      return;
    }
    await navigator.clipboard.writeText(compiled.markdown);
    toast.success('Compiled report copied');
  };

  const handleDownload = () => {
    if (!compiled) {
      return;
    }
    const blob = new Blob([compiled.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyKey.replace(/[^a-z0-9.-]/gi, '_')}-compiled-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Compiled report downloaded');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Compiled report — {companyKey}</DialogTitle>
          <DialogDescription>
            {compiled
              ? `${compiled.jsonReportCount} structured runs · ${compiled.reportCount} total artifacts · timeline with score changes`
              : 'Select reports to compile'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {compiled ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
              {compiled.markdown}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              No reports available to compile for this company.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCopy} disabled={!compiled}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={!compiled}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
