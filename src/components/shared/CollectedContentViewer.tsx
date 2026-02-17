/**
 * Collected Content Viewer Component
 * Displays all collected content (puppeteer_data) stored in Local Forage
 * Allows selecting specific pages for assessment and comparison
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
import { Input } from '@/components/ui/input';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import {
  Database,
  Search,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { MultiPageSelector } from './MultiPageSelector';

interface CollectedContent {
  siteUrl: string;
  domain: string;
  timestamp: string;
  pageCount: number;
  pages: Array<{
    url: string;
    pageLabel: string;
    pageType: string;
    title?: string;
    metaDescription?: string;
  }>;
}

interface CollectedContentViewerProps {
  onContentSelected?: (siteUrl: string, selectedPages: string[]) => void;
  allowSelection?: boolean;
}

export function CollectedContentViewer({
  onContentSelected,
  allowSelection = false,
}: CollectedContentViewerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collectedContent, setCollectedContent] = useState<CollectedContent[]>([]);
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      loadCollectedContent();
    }
  }, [open]);

  const loadCollectedContent = async () => {
    setLoading(true);
    try {
      const content = await UnifiedLocalForageStorage.getAllCollectedContent();
      setCollectedContent(content);
    } catch (_error) {
      // Failed to load collected content - silently handle
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = collectedContent.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.domain.toLowerCase().includes(searchLower) ||
      item.siteUrl.toLowerCase().includes(searchLower) ||
      item.pages.some(
        (page) =>
          page.pageLabel.toLowerCase().includes(searchLower) ||
          page.url.toLowerCase().includes(searchLower) ||
          (page.title && page.title.toLowerCase().includes(searchLower))
      )
    );
  });

  const handleSelectContent = (siteUrl: string) => {
    setSelectedSiteUrl(siteUrl);
    const content = collectedContent.find((c) => c.siteUrl === siteUrl);
    if (content) {
      // Auto-select all pages
      setSelectedPages(content.pages.map((p) => p.url));
    }
  };

  const handleConfirmSelection = () => {
    if (selectedSiteUrl && selectedPages.length > 0 && onContentSelected) {
      onContentSelected(selectedSiteUrl, selectedPages);
      setOpen(false);
      setSelectedSiteUrl(null);
      setSelectedPages([]);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const selectedContent = selectedSiteUrl
    ? collectedContent.find((c) => c.siteUrl === selectedSiteUrl)
    : null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Database className="mr-2 h-4 w-4" />
            Use Collected Content
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Collected Content
            </DialogTitle>
            <DialogDescription>
              Select collected content to use for assessments. Choose specific pages to analyze and compare.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by domain, URL, or page name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Content List or Page Selector */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedContent ? (
              <div className="flex-1 overflow-y-auto space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          {selectedContent.domain}
                        </CardTitle>
                        <CardDescription>
                          {selectedContent.pageCount} page
                          {selectedContent.pageCount !== 1 ? 's' : ''} collected •{' '}
                          {formatDate(selectedContent.timestamp)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSiteUrl(null);
                          setSelectedPages([]);
                        }}
                      >
                        Back to List
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <MultiPageSelector
                      pages={selectedContent.pages.map((p) => ({
                        url: p.url,
                        pageLabel: p.pageLabel,
                        pageType: p.pageType,
                        title: p.title,
                        metaDescription: p.metaDescription,
                      }))}
                      selectedPages={selectedPages}
                      onSelectionChange={setSelectedPages}
                      allowMultiSelect={true}
                    />
                    {allowSelection && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedSiteUrl(null);
                            setSelectedPages([]);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmSelection}
                          disabled={selectedPages.length === 0}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Use Selected Pages
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : filteredContent.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No collected content found</p>
                  <p className="text-xs mt-2">
                    Collect content first by running a content analysis
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {filteredContent
                    .sort((a, b) => {
                      // Sort by most recent first
                      return (
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                      );
                    })
                    .map((content) => (
                      <Card
                        key={content.siteUrl}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (allowSelection) {
                            handleSelectContent(content.siteUrl);
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                <span className="truncate font-semibold">
                                  {content.domain}
                                </span>
                              </CardTitle>
                              <CardDescription className="space-y-1">
                                <div>
                                  {content.pageCount} page
                                  {content.pageCount !== 1 ? 's' : ''} collected
                                </div>
                                <div className="text-xs">
                                  {formatDate(content.timestamp)}
                                </div>
                              </CardDescription>
                            </div>
                            {allowSelection && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectContent(content.siteUrl);
                                }}
                              >
                                Select
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground mb-2">
                              Pages:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {content.pages.slice(0, 5).map((page) => (
                                <Badge
                                  key={page.url}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {page.pageLabel}
                                </Badge>
                              ))}
                              {content.pages.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{content.pages.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredContent.length} site
                {filteredContent.length !== 1 ? 's' : ''} with collected content
              </p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export default for dynamic import compatibility
export default CollectedContentViewer;


