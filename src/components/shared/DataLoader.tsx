/**
 * Data Loader Component
 * Loads saved data from Local Forage for reuse in assessments
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { Database, Loader2, CheckCircle2, FileText, Upload } from 'lucide-react';
// Toast will be handled via callback or console for now
// Format date helper
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

interface DataLoaderProps {
  onDataLoaded: (data: {
    puppeteerData?: any;
    url?: string;
    metadata?: any;
    content?: string;
    selectedPage?: any; // Single page if selected
  }) => void;
  currentUrl?: string;
  allowPageSelection?: boolean; // Allow selecting individual pages
  showPageSelector?: boolean; // Show page selector UI
}

export function DataLoader({
  onDataLoaded,
  currentUrl,
  allowPageSelection = false,
  showPageSelector = false,
}: DataLoaderProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedPageUrl, setSelectedPageUrl] = useState<string | null>(null);
  const [availablePages, setAvailablePages] = useState<Array<{ url: string; pageLabel: string; pageType: string }>>([]);
  const [dataInfo, setDataInfo] = useState<{
    hasPuppeteer: boolean;
    hasReports: boolean;
    timestamp?: string;
    pages?: Array<{ url: string; pageLabel: string; pageType: string }>;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadSavedUrls();
    }
  }, [open]);

  useEffect(() => {
    if (selectedUrl) {
      loadDataInfo(selectedUrl);
    }
  }, [selectedUrl]);

  const loadSavedUrls = async () => {
    setLoading(true);
    try {
      const urls = await UnifiedLocalForageStorage.getAllStoredUrls();
      setSavedUrls(urls);
      
      // Auto-select current URL if it exists
      if (currentUrl && urls.includes(currentUrl)) {
        setSelectedUrl(currentUrl);
      } else if (urls.length > 0) {
        setSelectedUrl(urls[0]);
      }
    } catch (error) {
      console.error('Failed to load saved URLs:', error);
      alert('Failed to load saved data');
    } finally {
      setLoading(false);
    }
  };

  const loadDataInfo = async (url: string) => {
    try {
      const puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(url);
      const reports = await UnifiedLocalForageStorage.getReportsForUrl(url);
      const pages = puppeteerData?.data?.pages?.map((page: any) => ({
        url: page.url,
        pageLabel: page.pageLabel || 'Page',
        pageType: page.pageType || 'page',
      })) || [];

      setAvailablePages(pages);
      setDataInfo({
        hasPuppeteer: !!puppeteerData,
        hasReports: reports.length > 0,
        timestamp: puppeteerData?.timestamp,
        pages,
      });
    } catch (error) {
      console.error('Failed to load data info:', error);
    }
  };

  const handleLoad = async () => {
    if (!selectedUrl) {
      alert('Please select a URL');
      return;
    }

    // If page selection is enabled and a page is selected, load just that page
    if (allowPageSelection && selectedPageUrl) {
      const pageData = await UnifiedLocalForageStorage.getPage(selectedPageUrl);
      if (pageData && pageData.data?.pages?.[0]) {
        const page = pageData.data.pages[0];
        onDataLoaded({
          puppeteerData: { pages: [page], url: selectedUrl },
          url: selectedPageUrl,
          metadata: {
            titles: [{
              pageLabel: page.pageLabel,
              pageType: page.pageType,
              url: page.url,
              title: page.title,
              ogTitle: page.metaTags?.ogTitle,
              twitterTitle: page.metaTags?.twitterTitle,
            }],
            descriptions: [{
              pageLabel: page.pageLabel,
              pageType: page.pageType,
              url: page.url,
              metaDescription: page.metaDescription,
            }],
            keywords: [{
              pageLabel: page.pageLabel,
              pageType: page.pageType,
              url: page.url,
              ...page.keywords,
            }],
            analytics: [{
              pageLabel: page.pageLabel,
              pageType: page.pageType,
              url: page.url,
              ...page.analytics,
            }],
          },
          content: page.content?.text || '',
          selectedPage: page,
        });
        alert('Page loaded successfully');
        setOpen(false);
        return;
      }
    }

    setLoading(true);

    try {
      const puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(selectedUrl);

      if (!puppeteerData) {
        alert('No saved data found for this URL');
        return;
      }

      // Extract metadata and content from Puppeteer data
      const metadata = {
        titles: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          title: page.title,
          ogTitle: page.metaTags?.ogTitle,
          twitterTitle: page.metaTags?.twitterTitle,
        })),
        descriptions: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          metaDescription: page.metaDescription,
          ogDescription: page.metaTags?.ogDescription,
          twitterDescription: page.metaTags?.twitterDescription,
        })),
        keywords: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          ...page.keywords,
        })),
        analytics: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          ...page.analytics,
        })),
        metaTags: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          metaTags: page.metaTags,
          allMetaTags: page.metaTags?.allMetaTags,
        })),
        htmlTags: puppeteerData.data?.pages?.map((page: any) => ({
          pageLabel: page.pageLabel,
          pageType: page.pageType,
          url: page.url,
          semanticTags: page.tags?.semanticTags,
          totalSemanticTags: page.tags?.totalSemanticTags,
        })),
      };

      const content = puppeteerData.data?.pages
        ?.map((page: any) => page.content?.text || '')
        .join('\n\n--- PAGE BREAK ---\n\n') || '';

      onDataLoaded({
        puppeteerData: puppeteerData.data,
        url: selectedUrl,
        metadata,
        content,
      });

      console.log('✅ Data loaded successfully');
      setOpen(false);
      alert('Data loaded successfully');
    } catch (error) {
      console.error('Failed to load data:', error);
      const errorMsg = `Failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`;
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Database className="mr-2 h-4 w-4" />
          Load Saved Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Load Saved Data from Local Forage
          </DialogTitle>
          <DialogDescription>
            Select a previously saved URL to load its data for reuse in assessments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && savedUrls.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : savedUrls.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved data found</p>
                <p className="text-xs mt-2">
                  Save data from Content Comparison to use it here
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* URL Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Saved URLs</CardTitle>
                  <CardDescription>
                    {savedUrls.length} URL{savedUrls.length !== 1 ? 's' : ''} with saved data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {savedUrls.map((url) => (
                    <div
                      key={url}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedUrl === url
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedUrl(url)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{url}</p>
                        {dataInfo && selectedUrl === url && dataInfo.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Saved: {formatDate(dataInfo.timestamp)}
                          </p>
                        )}
                      </div>
                      {selectedUrl === url && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Data Info */}
              {selectedUrl && dataInfo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Available Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        {dataInfo.hasPuppeteer ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span className="text-sm">Puppeteer Data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {dataInfo.hasReports ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span className="text-sm">Reports</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleLoad}
                  disabled={loading || !selectedUrl}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Load Data
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

