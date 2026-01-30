/**
 * Data Save Selector Component
 * Allows users to choose what data to save to Local Forage
 * Can save: Puppeteer data, Metadata, Reports, Analysis results
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { Save, Database, CheckCircle2, Loader2 } from 'lucide-react';
// Toast will be handled via callback or console for now

interface SaveOptions {
  puppeteerData: boolean; // Full Puppeteer collection result
  metadata: boolean; // SEO titles, descriptions, tags, keywords, analytics
  content: boolean; // Clean text content
  analysisResult: boolean; // AI analysis result
  report: boolean; // Generated report (Markdown/JSON)
}

interface DataSaveSelectorProps {
  url: string;
  puppeteerData?: any; // Full PuppeteerComprehensiveCollector result
  metadata?: any; // Extracted metadata
  content?: string; // Clean text content
  analysisResult?: any; // AI analysis result
  report?: string | any; // Report content
  assessmentType?: string; // Which assessment generated this
  allowPageSelection?: boolean; // Allow saving individual pages
  onSaved?: () => void;
}

export function DataSaveSelector({
  url,
  puppeteerData,
  metadata,
  content,
  analysisResult,
  report,
  assessmentType,
  allowPageSelection = false,
  onSaved,
}: DataSaveSelectorProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [saveOptions, setSaveOptions] = useState<SaveOptions>({
    puppeteerData: true, // Default: save Puppeteer data
    metadata: true, // Default: save metadata
    content: true, // Default: save content
    analysisResult: false, // Optional: analysis results
    report: false, // Optional: reports
  });

  // Extract available pages from Puppeteer data
  const availablePages = puppeteerData?.pages || [];

  const hasData = {
    puppeteerData: !!puppeteerData,
    metadata: !!metadata,
    content: !!content,
    analysisResult: !!analysisResult,
    report: !!report,
  };

  const handleSave = async () => {
    if (!url.trim()) {
      alert('URL is required to save data');
      return;
    }

    setSaving(true);

    try {
      const savePromises: Promise<void>[] = [];

      // Save individual pages if selected
      if (allowPageSelection && selectedPages.size > 0 && puppeteerData?.pages) {
        for (const pageUrl of selectedPages) {
          const page = puppeteerData.pages.find((p: any) => p.url === pageUrl);
          if (page) {
            savePromises.push(
              UnifiedLocalForageStorage.storePage(pageUrl, page, url)
            );
          }
        }
      }

      // Save full Puppeteer data (if not saving individual pages, or if saving both)
      if (saveOptions.puppeteerData && puppeteerData) {
        if (!allowPageSelection || selectedPages.size === 0) {
          // Only save full data if not saving individual pages
          savePromises.push(
            UnifiedLocalForageStorage.storePuppeteerData(url, puppeteerData)
          );
        }
      }

      // Save metadata separately (as part of Puppeteer data, but also as standalone)
      if (saveOptions.metadata && metadata) {
        // Metadata is already included in Puppeteer data, but we can save it separately if needed
        // For now, it's included in the Puppeteer data structure
      }

      await Promise.all(savePromises);

      // Save report separately (returns Promise<string>)
      if (saveOptions.report && report) {
        const reportFormat = typeof report === 'string' ? 'markdown' : 'json';
        await UnifiedLocalForageStorage.storeReport(
          url,
          report,
          reportFormat,
          assessmentType
        );
      }

      const savedItems = Object.entries(saveOptions)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ');

      console.log(`✅ Saved to Local Forage: ${savedItems}`);
      setOpen(false);
      onSaved?.();
      // Show success message (you can integrate with your toast system)
      alert(`Saved to Local Forage: ${savedItems}`);
    } catch (error) {
      console.error('Failed to save data:', error);
      const errorMsg = `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const availableCount = Object.values(hasData).filter(Boolean).length;
  const selectedCount = Object.values(saveOptions).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="mr-2 h-4 w-4" />
          Save to Local Forage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Choose What to Save
          </DialogTitle>
          <DialogDescription>
            Select which data to save to Local Forage for reuse across assessments.
            Data is stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Available Data</CardTitle>
                <Badge variant="outline">
                  {availableCount} type{availableCount !== 1 ? 's' : ''} available
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {hasData.puppeteerData ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>Puppeteer Data</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasData.metadata ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>Metadata</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasData.content ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>Content</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasData.analysisResult ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>Analysis Result</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasData.report ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                  <span>Report</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Selection (if enabled) */}
          {allowPageSelection && availablePages.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Select Pages to Save</CardTitle>
                  <Badge variant="secondary">
                    {selectedPages.size} of {availablePages.length} selected
                  </Badge>
                </div>
                <CardDescription>
                  Save individual pages for targeted comparison
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {availablePages.map((page: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Checkbox
                      id={`page-${index}`}
                      checked={selectedPages.has(page.url)}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedPages);
                        if (checked) {
                          newSelected.add(page.url);
                        } else {
                          newSelected.delete(page.url);
                        }
                        setSelectedPages(newSelected);
                      }}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`page-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {page.pageLabel || 'Page'} ({page.pageType})
                      </Label>
                      <p className="text-xs text-muted-foreground truncate">
                        {page.url}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPages(new Set(availablePages.map((p: any) => p.url)));
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPages(new Set())}
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Options */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Save Options</CardTitle>
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Puppeteer Data */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-puppeteer"
                  checked={saveOptions.puppeteerData}
                  disabled={!hasData.puppeteerData}
                  onCheckedChange={(checked) =>
                    setSaveOptions((prev) => ({
                      ...prev,
                      puppeteerData: checked === true,
                    }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="save-puppeteer"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Puppeteer Collected Data
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Full collection result: pages, metadata, keywords, analytics, semantic tags.
                    Required for reuse across assessments.
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-metadata"
                  checked={saveOptions.metadata}
                  disabled={!hasData.metadata}
                  onCheckedChange={(checked) =>
                    setSaveOptions((prev) => ({
                      ...prev,
                      metadata: checked === true,
                    }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="save-metadata"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    SEO Metadata
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Titles, descriptions, tags, keywords, GA4/GTM IDs. Included in Puppeteer data.
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-content"
                  checked={saveOptions.content}
                  disabled={!hasData.content}
                  onCheckedChange={(checked) =>
                    setSaveOptions((prev) => ({
                      ...prev,
                      content: checked === true,
                    }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="save-content"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Clean Text Content
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Extracted clean text from pages. Included in Puppeteer data.
                  </p>
                </div>
              </div>

              {/* Analysis Result */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-analysis"
                  checked={saveOptions.analysisResult}
                  disabled={!hasData.analysisResult}
                  onCheckedChange={(checked) =>
                    setSaveOptions((prev) => ({
                      ...prev,
                      analysisResult: checked === true,
                    }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="save-analysis"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    AI Analysis Result
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Framework analysis results. Optional - can regenerate later.
                  </p>
                </div>
              </div>

              {/* Report */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="save-report"
                  checked={saveOptions.report}
                  disabled={!hasData.report}
                  onCheckedChange={(checked) =>
                    setSaveOptions((prev) => ({
                      ...prev,
                      report: checked === true,
                    }))
                  }
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="save-report"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Generated Report
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Markdown or JSON report. Optional - can regenerate later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL Info */}
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-xs font-medium mb-1">Saving for URL:</p>
            <p className="text-xs text-muted-foreground break-all">{url}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || selectedCount === 0}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save {selectedCount} item{selectedCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

