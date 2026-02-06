'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FileText, CheckCircle2, Globe, ChevronDown, ChevronUp, Tag, Search, BarChart3, Code, FileCode } from 'lucide-react';

interface Page {
  url: string;
  pageLabel: string;
  pageType: string;
  title?: string;
  metaDescription?: string;
  // Enhanced metadata
  metaTags?: any;
  allMetaTags?: Array<{ name: string; content: string; httpEquiv: string }>;
  keywords?: {
    metaKeywords?: string[];
    contentKeywords?: string[];
    headingKeywords?: string[];
    altTextKeywords?: string[];
    allKeywords?: string[];
  };
  analytics?: {
    googleAnalytics4?: { measurementIds?: string[] };
    googleTagManager?: { containerIds?: string[] };
    facebookPixel?: { pixelId?: string | null };
    otherAnalytics?: string[];
  };
  semanticTags?: any;
  content?: {
    text?: string;
    wordCount?: number;
  };
}

interface MultiPageSelectorProps {
  pages: Page[];
  selectedPages: string[];
  onSelectionChange: (selectedUrls: string[]) => void;
  allowMultiSelect?: boolean;
}

export function MultiPageSelector({
  pages,
  selectedPages,
  onSelectionChange,
  allowMultiSelect = true,
}: MultiPageSelectorProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedPages);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalSelection(selectedPages);
  }, [selectedPages]);

  const toggleExpand = (url: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const togglePage = (url: string) => {
    if (!allowMultiSelect) {
      setLocalSelection([url]);
      onSelectionChange([url]);
      return;
    }

    const newSelection = localSelection.includes(url)
      ? localSelection.filter((u) => u !== url)
      : [...localSelection, url];

    setLocalSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const selectAll = () => {
    const allUrls = pages.map((p) => p.url);
    setLocalSelection(allUrls);
    onSelectionChange(allUrls);
  };

  const deselectAll = () => {
    setLocalSelection([]);
    onSelectionChange([]);
  };

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No pages available</p>
          <p className="text-xs mt-2">Collect content first to see available pages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Select Pages to Review</CardTitle>
            <CardDescription>
              {pages.length} page{pages.length !== 1 ? 's' : ''} available
              {localSelection.length > 0 && ` • ${localSelection.length} selected`}
            </CardDescription>
          </div>
          {allowMultiSelect && pages.length > 1 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pages.map((page) => {
            const isSelected = localSelection.includes(page.url);
            return (
              <div
                key={page.url}
                className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => togglePage(page.url)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => togglePage(page.url)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="font-medium cursor-pointer">
                      {page.pageLabel || 'Page'}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {page.pageType || 'page'}
                    </Badge>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-1">
                    {page.url}
                  </p>
                  
                  {/* Basic Info - Always Visible */}
                  <div className="space-y-1 mb-2">
                    {page.title && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground">Title:</span>
                        <p className="text-sm font-medium">{page.title}</p>
                      </div>
                    )}
                    {page.metaDescription && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground">Meta Description:</span>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {page.metaDescription}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Expandable Metadata */}
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(page.url);
                      }}
                    >
                      {expandedPages.has(page.url) ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Show Full Metadata
                        </>
                      )}
                    </Button>
                    {expandedPages.has(page.url) && (
                      <div className="mt-2 space-y-3 pt-2 border-t">
                      {/* Keywords */}
                      {page.keywords && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <Search className="h-3 w-3" />
                            <span className="font-semibold">Keywords:</span>
                          </div>
                          <div className="pl-4 space-y-1">
                            {page.keywords.metaKeywords && page.keywords.metaKeywords.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Meta:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {page.keywords.metaKeywords.slice(0, 10).map((kw, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {kw}
                                    </Badge>
                                  ))}
                                  {page.keywords.metaKeywords.length > 10 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{page.keywords.metaKeywords.length - 10} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {page.keywords.allKeywords && page.keywords.allKeywords.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">All ({page.keywords.allKeywords.length}):</span>
                                <p className="text-muted-foreground mt-1 line-clamp-2">
                                  {page.keywords.allKeywords.slice(0, 20).join(', ')}
                                  {page.keywords.allKeywords.length > 20 && '...'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Analytics Tracking */}
                      {page.analytics && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <BarChart3 className="h-3 w-3" />
                            <span className="font-semibold">Analytics Tracking:</span>
                          </div>
                          <div className="pl-4 space-y-1">
                            {page.analytics.googleAnalytics4?.measurementIds && page.analytics.googleAnalytics4.measurementIds.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">GA4:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {page.analytics.googleAnalytics4.measurementIds.map((id, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {id}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {page.analytics.googleTagManager?.containerIds && page.analytics.googleTagManager.containerIds.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">GTM:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {page.analytics.googleTagManager.containerIds.map((id, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {id}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {page.analytics.facebookPixel?.pixelId && (
                              <div>
                                <span className="text-muted-foreground">Facebook Pixel:</span>
                                <Badge variant="outline" className="text-xs ml-1">
                                  {page.analytics.facebookPixel.pixelId}
                                </Badge>
                              </div>
                            )}
                            {page.analytics.otherAnalytics && page.analytics.otherAnalytics.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Other:</span>
                                <p className="text-muted-foreground mt-1">
                                  {page.analytics.otherAnalytics.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* HTML Semantic Tags */}
                      {page.semanticTags && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <Code className="h-3 w-3" />
                            <span className="font-semibold">HTML Semantic Tags:</span>
                          </div>
                          <div className="pl-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(page.semanticTags).slice(0, 10).map(([tag, count]: [string, any]) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}: {count}
                                </Badge>
                              ))}
                              {Object.keys(page.semanticTags).length > 10 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{Object.keys(page.semanticTags).length - 10} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* All Meta Tags */}
                      {page.allMetaTags && page.allMetaTags.length > 0 && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <Tag className="h-3 w-3" />
                            <span className="font-semibold">All Meta Tags ({page.allMetaTags.length}):</span>
                          </div>
                          <div className="pl-4 space-y-1 max-h-32 overflow-y-auto">
                            {page.allMetaTags.slice(0, 10).map((tag: any, i: number) => (
                              <div key={i} className="text-muted-foreground">
                                <span className="font-mono text-xs">
                                  {tag.name || tag.httpEquiv}: {tag.content}
                                </span>
                              </div>
                            ))}
                            {page.allMetaTags.length > 10 && (
                              <p className="text-muted-foreground italic">
                                +{page.allMetaTags.length - 10} more tags
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Content Preview */}
                      {page.content?.text && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 mb-1">
                            <FileCode className="h-3 w-3" />
                            <span className="font-semibold">Content Preview:</span>
                            {page.content.wordCount && (
                              <Badge variant="outline" className="text-xs ml-1">
                                {page.content.wordCount} words
                              </Badge>
                            )}
                          </div>
                          <div className="pl-4">
                            <p className="text-muted-foreground line-clamp-4 text-xs">
                              {page.content.text.substring(0, 300)}
                              {page.content.text.length > 300 && '...'}
                            </p>
                          </div>
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })}
        </div>

        {localSelection.length === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              ⚠️ Please select at least one page to review
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

