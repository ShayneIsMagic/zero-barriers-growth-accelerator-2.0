/**
 * Page Metadata Display Component
 * Template for displaying collected metadata organized by page
 * Puppeteer extracts raw data, this component organizes and displays it
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Tag,
  Search,
  BarChart3,
  Code,
  Database,
  ExternalLink,
} from 'lucide-react';

interface PageMetadata {
  pageLabel: string;
  pageType: string;
  url: string;
  title?: string;
  metaDescription?: string;
  ogTitle?: string;
  twitterTitle?: string;
  ogDescription?: string;
  twitterDescription?: string;
  metaTags?: Record<string, any>;
  allMetaTags?: Array<{ name: string; content: string; httpEquiv: string }>;
  semanticTags?: Record<string, number>;
  totalSemanticTags?: number;
  metaKeywords?: string[];
  contentKeywords?: string[];
  headingKeywords?: string[];
  altTextKeywords?: string[];
  allKeywords?: string[];
  keywordFrequency?: Record<string, number>;
  googleAnalytics4?: {
    measurementIds: string[];
    config: any;
    scriptsFound: number;
  };
  googleTagManager?: {
    containerIds: string[];
    scriptsFound: number;
  };
  facebookPixel?: {
    pixelId: string | null;
    found: boolean;
  };
  otherAnalytics?: string[];
}

interface PageMetadataDisplayProps {
  metadata: {
    titles?: Array<PageMetadata>;
    descriptions?: Array<PageMetadata>;
    metaTags?: Array<PageMetadata>;
    htmlTags?: Array<PageMetadata>;
    keywords?: Array<PageMetadata>;
    analytics?: Array<PageMetadata>;
  };
  comprehensiveData?: {
    pages?: Array<{
      pageLabel?: string;
      pageType?: string;
      url: string;
      title?: string;
      metaDescription?: string;
      metaTags?: any;
      keywords?: any;
      analytics?: any;
      tags?: any;
    }>;
  };
}

export function PageMetadataDisplay({
  metadata,
  comprehensiveData,
}: PageMetadataDisplayProps) {
  // Merge metadata from both sources and organize by page
  const pages: PageMetadata[] = [];

  // Get page count
  const pageCount = Math.max(
    metadata.titles?.length || 0,
    metadata.descriptions?.length || 0,
    metadata.keywords?.length || 0,
    metadata.analytics?.length || 0,
    comprehensiveData?.pages?.length || 0
  );

  // Build unified page data
  for (let i = 0; i < pageCount; i++) {
    const title = metadata.titles?.[i];
    const desc = metadata.descriptions?.[i];
    const metaTag = metadata.metaTags?.[i];
    const htmlTag = metadata.htmlTags?.[i];
    const keyword = metadata.keywords?.[i];
    const analytic = metadata.analytics?.[i];
    const comprehensivePage = comprehensiveData?.pages?.[i];

    // Prefer comprehensive data, fallback to metadata arrays
    const pageLabel =
      comprehensivePage?.pageLabel ||
      title?.pageLabel ||
      desc?.pageLabel ||
      keyword?.pageLabel ||
      analytic?.pageLabel ||
      `Page ${i + 1}`;

    const pageType =
      comprehensivePage?.pageType ||
      title?.pageType ||
      desc?.pageType ||
      keyword?.pageType ||
      analytic?.pageType ||
      'page';

    const url =
      comprehensivePage?.url ||
      title?.url ||
      desc?.url ||
      keyword?.url ||
      analytic?.url ||
      '';

    pages.push({
      pageLabel,
      pageType,
      url,
      title:
        comprehensivePage?.title ||
        title?.title ||
        comprehensivePage?.metaTags?.title ||
        '',
      metaDescription:
        comprehensivePage?.metaDescription ||
        desc?.metaDescription ||
        comprehensivePage?.metaTags?.description ||
        '',
      ogTitle: title?.ogTitle || comprehensivePage?.metaTags?.ogTitle || '',
      twitterTitle:
        title?.twitterTitle || comprehensivePage?.metaTags?.twitterTitle || '',
      ogDescription:
        desc?.ogDescription || comprehensivePage?.metaTags?.ogDescription || '',
      twitterDescription:
        desc?.twitterDescription ||
        comprehensivePage?.metaTags?.twitterDescription ||
        '',
      metaTags:
        comprehensivePage?.metaTags || metaTag?.metaTags || {},
      allMetaTags:
        metaTag?.allMetaTags || comprehensivePage?.metaTags?.allMetaTags || [],
      semanticTags:
        comprehensivePage?.tags?.semanticTags ||
        htmlTag?.semanticTags ||
        {},
      totalSemanticTags:
        comprehensivePage?.tags?.totalSemanticTags ||
        htmlTag?.totalSemanticTags ||
        0,
      metaKeywords:
        comprehensivePage?.keywords?.metaKeywords ||
        keyword?.metaKeywords ||
        [],
      contentKeywords:
        comprehensivePage?.keywords?.contentKeywords ||
        keyword?.contentKeywords ||
        [],
      headingKeywords:
        comprehensivePage?.keywords?.headingKeywords ||
        keyword?.headingKeywords ||
        [],
      altTextKeywords:
        comprehensivePage?.keywords?.altTextKeywords ||
        keyword?.altTextKeywords ||
        [],
      allKeywords:
        comprehensivePage?.keywords?.allKeywords || keyword?.allKeywords || [],
      keywordFrequency:
        comprehensivePage?.keywords?.keywordFrequency ||
        keyword?.keywordFrequency ||
        {},
      googleAnalytics4:
        comprehensivePage?.analytics?.googleAnalytics4 ||
        analytic?.googleAnalytics4 ||
        {},
      googleTagManager:
        comprehensivePage?.analytics?.googleTagManager ||
        analytic?.googleTagManager ||
        {},
      facebookPixel:
        comprehensivePage?.analytics?.facebookPixel ||
        analytic?.facebookPixel ||
        {},
      otherAnalytics:
        comprehensivePage?.analytics?.otherAnalytics ||
        analytic?.otherAnalytics ||
        [],
    });
  }

  if (pages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No page metadata available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Metadata by Page</h2>
          <p className="text-muted-foreground">
            All metadata organized by page label from navbar
          </p>
        </div>
        <Badge variant="outline">{pages.length} Pages</Badge>
      </div>

      <Tabs defaultValue="all-pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-pages">All Pages</TabsTrigger>
          {pages.map((page, index) => (
            <TabsTrigger key={index} value={`page-${index}`}>
              {page.pageLabel}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Pages Overview */}
        <TabsContent value="all-pages">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{page.pageLabel}</CardTitle>
                    <Badge variant="secondary">{page.pageType}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline"
                    >
                      {page.url}
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Title:</strong> {page.title || 'N/A'}
                  </div>
                  <div>
                    <strong>GA4 IDs:</strong>{' '}
                    {page.googleAnalytics4?.measurementIds?.join(', ') ||
                      'None'}
                  </div>
                  <div>
                    <strong>GTM IDs:</strong>{' '}
                    {page.googleTagManager?.containerIds?.join(', ') || 'None'}
                  </div>
                  <div>
                    <strong>Keywords:</strong>{' '}
                    {page.allKeywords?.length || 0} total
                  </div>
                  <div>
                    <strong>Semantic Tags:</strong> {page.totalSemanticTags || 0}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Page Details */}
        {pages.map((page, index) => (
          <TabsContent key={index} value={`page-${index}`}>
            <div className="space-y-4">
              {/* Page Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{page.pageLabel}</CardTitle>
                      <CardDescription className="mt-1">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {page.url}
                        </a>
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{page.pageType}</Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* SEO Titles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    SEO Titles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Page Title:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong>Open Graph Title:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.ogTitle || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong>Twitter Card Title:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.twitterTitle || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Meta Descriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Meta Descriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <strong>Meta Description:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.metaDescription || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong>Open Graph Description:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.ogDescription || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <strong>Twitter Card Description:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.twitterDescription || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>All Keywords ({page.allKeywords?.length || 0}):</strong>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {page.allKeywords?.slice(0, 20).map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {page.allKeywords && page.allKeywords.length > 20 && (
                        <Badge variant="outline" className="text-xs">
                          +{page.allKeywords.length - 20} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <strong>Meta Keywords:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {page.metaKeywords?.join(', ') || 'None'}
                      </p>
                    </div>
                    <div>
                      <strong>Content Keywords:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {page.contentKeywords?.slice(0, 10).join(', ') || 'None'}
                        {page.contentKeywords &&
                          page.contentKeywords.length > 10 &&
                          '...'}
                      </p>
                    </div>
                    <div>
                      <strong>Heading Keywords:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {page.headingKeywords?.slice(0, 10).join(', ') || 'None'}
                        {page.headingKeywords &&
                          page.headingKeywords.length > 10 &&
                          '...'}
                      </p>
                    </div>
                    <div>
                      <strong>Alt Text Keywords:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {page.altTextKeywords?.slice(0, 10).join(', ') || 'None'}
                        {page.altTextKeywords &&
                          page.altTextKeywords.length > 10 &&
                          '...'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics (GA4, GTM) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics & Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Google Analytics 4 (GA4):</strong>
                    <div className="mt-1 space-y-1">
                      {page.googleAnalytics4?.measurementIds?.length > 0 ? (
                        page.googleAnalytics4.measurementIds.map((id, i) => (
                          <Badge key={i} variant="default" className="mr-1">
                            {id}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>Google Tag Manager (GTM):</strong>
                    <div className="mt-1 space-y-1">
                      {page.googleTagManager?.containerIds?.length > 0 ? (
                        page.googleTagManager.containerIds.map((id, i) => (
                          <Badge key={i} variant="secondary" className="mr-1">
                            {id}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>Facebook Pixel:</strong>
                    <div className="mt-1">
                      {page.facebookPixel?.pixelId ? (
                        <Badge variant="outline">
                          {page.facebookPixel.pixelId}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None detected
                        </span>
                      )}
                    </div>
                  </div>
                  {page.otherAnalytics && page.otherAnalytics.length > 0 && (
                    <div>
                      <strong>Other Analytics:</strong>
                      <div className="mt-1 space-y-1">
                        {page.otherAnalytics.map((analytics, i) => (
                          <Badge key={i} variant="outline" className="mr-1">
                            {analytics}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* HTML Semantic Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    HTML Semantic Tags
                  </CardTitle>
                  <CardDescription>
                    Total: {page.totalSemanticTags || 0} semantic tags
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {page.semanticTags &&
                  Object.keys(page.semanticTags).length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-3">
                      {Object.entries(page.semanticTags)
                        .filter(([, count]) => count > 0)
                        .map(([tag, count]) => (
                          <div
                            key={tag}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <code className="text-sm">&lt;{tag}&gt;</code>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No semantic tags detected
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* All Meta Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    All Meta Tags
                  </CardTitle>
                  <CardDescription>
                    {page.allMetaTags?.length || 0} meta tags found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {page.allMetaTags && page.allMetaTags.length > 0 ? (
                    <div className="space-y-2">
                      {page.allMetaTags.slice(0, 20).map((tag, i) => (
                        <div
                          key={i}
                          className="rounded border p-2 text-sm"
                        >
                          <strong>{tag.name || tag.httpEquiv}:</strong>{' '}
                          <span className="text-muted-foreground">
                            {tag.content}
                          </span>
                        </div>
                      ))}
                      {page.allMetaTags.length > 20 && (
                        <p className="text-sm text-muted-foreground">
                          +{page.allMetaTags.length - 20} more meta tags
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No meta tags found
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

