/**
 * Multi-Page Content Scraping Page
 * Comprehensive SEO data collection across multiple pages
 * Extracts: meta tags, OG tags, Twitter Cards, GA4, GTM, keywords, schema, etc.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code2,
  ExternalLink,
  FileSearch,
  Globe,
  Hash,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Search,
  Server,
  Shield,
  Tag,
  Target,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';

// ============================================
// INTERFACES (matching API response)
// ============================================

interface KeywordFrequency {
  keyword: string;
  count: number;
  density: number;
}

interface StructuredDataItem {
  type: string;
  data: Record<string, unknown>;
}

interface PageSEOData {
  url: string;
  pageType: string;
  priority: number;
  title: string;
  wordCount: number;
  meta: {
    title: string;
    description: string;
    keywords: string[];
    author: string;
    robots: string;
    viewport: string;
    charset: string;
    language: string;
    canonical: string;
    generator: string;
    themeColor: string;
    copyright: string;
    revisitAfter: string;
    rating: string;
  };
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
    locale: string;
  };
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image: string;
    site: string;
    creator: string;
  };
  analytics: {
    ga4MeasurementIds: string[];
    gtmContainerIds: string[];
    facebookPixelIds: string[];
    otherTracking: string[];
    hasGoogleAnalytics: boolean;
    hasGTM: boolean;
    hasFacebookPixel: boolean;
    hasHotjar: boolean;
    hasClarityMs: boolean;
  };
  seo: {
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
    };
    headingStructureValid: boolean;
    titleLength: number;
    descriptionLength: number;
    internalLinkCount: number;
    externalLinkCount: number;
    imageCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    hasCanonical: boolean;
    hasRobotsMeta: boolean;
    hasSitemap: boolean;
    hasSchemaMarkup: boolean;
    schemaTypes: string[];
    structuredData: StructuredDataItem[];
  };
  keywords: {
    metaKeywords: string[];
    extractedFromContent: string[];
    extractedFromHeadings: string[];
    topKeywordsByFrequency: KeywordFrequency[];
    totalUniqueKeywords: number;
  };
  tags: {
    article: number;
    section: number;
    nav: number;
    header: number;
    footer: number;
    aside: number;
    main: number;
    figure: number;
    time: number;
    address: number;
    totalSemanticTags: number;
  };
  content: {
    text: string;
    wordCount: number;
    paragraphCount: number;
    listCount: number;
    formCount: number;
    videoCount: number;
    socialMediaLinks: string[];
  };
  contactInfo: {
    phones: string[];
    emails: string[];
    addresses: string[];
  };
  technical: {
    hasSSL: boolean;
    hasMobileViewport: boolean;
    loadTime: number;
    cssFileCount: number;
    jsFileCount: number;
    technologies: string[];
  };
  extractedAt: string;
  method: string;
}

interface MultiPageResult {
  url: string;
  totalPagesScraped: number;
  pages: PageSEOData[];
  siteMap: {
    totalPages: number;
    discoveredPages: string[];
    pageTypes: Record<string, number>;
  };
  siteSummary: {
    allKeywords: string[];
    allHeadings: string[];
    contentThemes: string[];
    ga4MeasurementIds: string[];
    gtmContainerIds: string[];
    totalWordCount: number;
    averageWordCount: number;
    pagesWithSchema: number;
    pagesWithCanonical: number;
    pagesWithOG: number;
    pagesWithTwitterCard: number;
  };
  extractedAt: string;
}

interface PageDiscoveryOptions {
  maxPages?: number;
  includeSubpages?: boolean;
  includeBlog?: boolean;
  includeProducts?: boolean;
  includeAbout?: boolean;
  includeContact?: boolean;
  includeServices?: boolean;
  maxDepth?: number;
}

// ============================================
// HELPER COMPONENTS
// ============================================

function SEOScoreBadge({ score, label }: { score: number; label: string }): React.ReactElement {
  const color =
    score >= 80
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : score >= 50
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${color}`}>
      {score >= 80 ? (
        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
      ) : score >= 50 ? (
        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
      ) : (
        <XCircle className="mr-1.5 h-3.5 w-3.5" />
      )}
      {label}: {score}%
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 text-sm">
      {checked ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-400" />
      )}
      <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }): React.ReactElement | null {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-border/50 py-2 last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="col-span-2 break-all text-sm">{value}</span>
    </div>
  );
}

// ============================================
// PAGE DETAIL COMPONENT
// ============================================

function PageDetail({ page }: { page: PageSEOData }): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate page SEO score
  const seoChecks = [
    page.meta.title.length > 0,
    page.meta.title.length <= 60,
    page.meta.description.length > 0,
    page.meta.description.length <= 160,
    page.seo.headingStructureValid,
    page.seo.hasCanonical,
    page.openGraph.title.length > 0,
    page.twitterCard.card.length > 0,
    page.seo.imagesWithoutAlt === 0,
    page.technical.hasSSL,
    page.technical.hasMobileViewport,
    page.seo.hasSchemaMarkup,
  ];
  const seoScore = Math.round(
    (seoChecks.filter(Boolean).length / seoChecks.length) * 100
  );

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex flex-1 items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">
                {page.title || page.url}
              </span>
              <Badge variant="outline" className="shrink-0 text-xs capitalize">
                {page.pageType}
              </Badge>
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {page.url}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <SEOScoreBadge score={seoScore} label="SEO" />
          <Badge variant="secondary" className="text-xs">
            {page.wordCount.toLocaleString()} words
          </Badge>
        </div>
      </button>

      {isExpanded && (
        <CardContent className="border-t pt-4">
          <Tabs defaultValue="meta" className="w-full">
            <TabsList className="mb-4 flex flex-wrap gap-1">
              <TabsTrigger value="meta" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                Meta Tags
              </TabsTrigger>
              <TabsTrigger value="og" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                OG / Twitter
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs">
                <BarChart3 className="mr-1 h-3 w-3" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="seo" className="text-xs">
                <FileSearch className="mr-1 h-3 w-3" />
                SEO Audit
              </TabsTrigger>
              <TabsTrigger value="keywords" className="text-xs">
                <KeyRound className="mr-1 h-3 w-3" />
                Keywords
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs">
                <Code2 className="mr-1 h-3 w-3" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-xs">
                <Server className="mr-1 h-3 w-3" />
                Technical
              </TabsTrigger>
            </TabsList>

            {/* META TAGS */}
            <TabsContent value="meta">
              <div className="space-y-1 rounded-lg bg-muted/30 p-4">
                <MetaRow label="Title" value={page.meta.title} />
                <MetaRow label="Description" value={page.meta.description} />
                <MetaRow
                  label="Keywords"
                  value={page.meta.keywords.join(', ')}
                />
                <MetaRow label="Author" value={page.meta.author} />
                <MetaRow label="Robots" value={page.meta.robots} />
                <MetaRow label="Canonical" value={page.meta.canonical} />
                <MetaRow label="Viewport" value={page.meta.viewport} />
                <MetaRow label="Charset" value={page.meta.charset} />
                <MetaRow label="Language" value={page.meta.language} />
                <MetaRow label="Generator" value={page.meta.generator} />
                <MetaRow label="Theme Color" value={page.meta.themeColor} />
                <MetaRow label="Copyright" value={page.meta.copyright} />
                <MetaRow label="Rating" value={page.meta.rating} />
                <MetaRow
                  label="Revisit After"
                  value={page.meta.revisitAfter}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    Title length:{' '}
                    <span
                      className={
                        page.seo.titleLength > 60
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }
                    >
                      {page.seo.titleLength}/60
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Description length:{' '}
                    <span
                      className={
                        page.seo.descriptionLength > 160
                          ? 'text-yellow-600'
                          : page.seo.descriptionLength === 0
                            ? 'text-red-600'
                            : 'text-green-600'
                      }
                    >
                      {page.seo.descriptionLength}/160
                    </span>
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* OPEN GRAPH + TWITTER */}
            <TabsContent value="og">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-3 flex items-center text-sm font-semibold">
                    <Globe className="mr-2 h-4 w-4 text-blue-500" />
                    Open Graph
                  </h4>
                  <div className="space-y-1">
                    <MetaRow label="og:title" value={page.openGraph.title} />
                    <MetaRow
                      label="og:description"
                      value={page.openGraph.description}
                    />
                    <MetaRow label="og:image" value={page.openGraph.image} />
                    <MetaRow label="og:url" value={page.openGraph.url} />
                    <MetaRow label="og:type" value={page.openGraph.type} />
                    <MetaRow
                      label="og:site_name"
                      value={page.openGraph.siteName}
                    />
                    <MetaRow label="og:locale" value={page.openGraph.locale} />
                  </div>
                  {page.openGraph.image && (
                    <div className="mt-3">
                      <a
                        href={page.openGraph.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded border bg-muted/50 px-3 py-1.5 text-xs text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View OG Image
                      </a>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-3 flex items-center text-sm font-semibold">
                    <Hash className="mr-2 h-4 w-4 text-sky-500" />
                    Twitter Card
                  </h4>
                  <div className="space-y-1">
                    <MetaRow
                      label="twitter:card"
                      value={page.twitterCard.card}
                    />
                    <MetaRow
                      label="twitter:title"
                      value={page.twitterCard.title}
                    />
                    <MetaRow
                      label="twitter:description"
                      value={page.twitterCard.description}
                    />
                    <MetaRow
                      label="twitter:image"
                      value={page.twitterCard.image}
                    />
                    <MetaRow
                      label="twitter:site"
                      value={page.twitterCard.site}
                    />
                    <MetaRow
                      label="twitter:creator"
                      value={page.twitterCard.creator}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ANALYTICS */}
            <TabsContent value="analytics">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div
                    className={`rounded-lg border p-3 ${page.analytics.hasGoogleAnalytics ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3
                        className={`h-5 w-5 ${page.analytics.hasGoogleAnalytics ? 'text-green-600' : 'text-red-400'}`}
                      />
                      <span className="text-sm font-medium">
                        Google Analytics
                      </span>
                    </div>
                    {page.analytics.ga4MeasurementIds.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {page.analytics.ga4MeasurementIds.map((id) => (
                          <Badge key={id} variant="secondary" className="mr-1">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        No GA4 measurement IDs found
                      </p>
                    )}
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${page.analytics.hasGTM ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Code2
                        className={`h-5 w-5 ${page.analytics.hasGTM ? 'text-green-600' : 'text-red-400'}`}
                      />
                      <span className="text-sm font-medium">
                        Google Tag Manager
                      </span>
                    </div>
                    {page.analytics.gtmContainerIds.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {page.analytics.gtmContainerIds.map((id) => (
                          <Badge key={id} variant="secondary" className="mr-1">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        No GTM containers found
                      </p>
                    )}
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${page.analytics.hasFacebookPixel ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-muted'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Target
                        className={`h-5 w-5 ${page.analytics.hasFacebookPixel ? 'text-green-600' : 'text-muted-foreground'}`}
                      />
                      <span className="text-sm font-medium">
                        Facebook Pixel
                      </span>
                    </div>
                    {page.analytics.facebookPixelIds.length > 0 ? (
                      <div className="mt-2">
                        {page.analytics.facebookPixelIds.map((id) => (
                          <Badge key={id} variant="secondary" className="mr-1">
                            {id}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Not detected
                      </p>
                    )}
                  </div>
                </div>

                {page.analytics.otherTracking.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-3">
                    <h4 className="mb-2 text-sm font-medium">
                      Other Tracking Tools
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {page.analytics.otherTracking.map((tool) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <CheckItem
                    checked={page.analytics.hasHotjar}
                    label="Hotjar"
                  />
                  <CheckItem
                    checked={page.analytics.hasClarityMs}
                    label="Microsoft Clarity"
                  />
                </div>
              </div>
            </TabsContent>

            {/* SEO AUDIT */}
            <TabsContent value="seo">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg bg-muted/30 p-4">
                    <h4 className="text-sm font-semibold">SEO Checklist</h4>
                    <CheckItem
                      checked={page.meta.title.length > 0}
                      label="Has title tag"
                    />
                    <CheckItem
                      checked={
                        page.seo.titleLength > 0 && page.seo.titleLength <= 60
                      }
                      label={`Title length optimal (${page.seo.titleLength}/60)`}
                    />
                    <CheckItem
                      checked={page.meta.description.length > 0}
                      label="Has meta description"
                    />
                    <CheckItem
                      checked={
                        page.seo.descriptionLength > 0 &&
                        page.seo.descriptionLength <= 160
                      }
                      label={`Description length optimal (${page.seo.descriptionLength}/160)`}
                    />
                    <CheckItem
                      checked={page.seo.headingStructureValid}
                      label="Valid heading structure (single H1)"
                    />
                    <CheckItem
                      checked={page.seo.hasCanonical}
                      label="Has canonical URL"
                    />
                    <CheckItem
                      checked={page.seo.hasRobotsMeta}
                      label="Has robots meta"
                    />
                    <CheckItem
                      checked={page.seo.hasSchemaMarkup}
                      label="Has schema markup"
                    />
                    <CheckItem
                      checked={page.seo.imagesWithoutAlt === 0}
                      label={`All images have alt text (${page.seo.imagesWithAlt}/${page.seo.imageCount})`}
                    />
                    <CheckItem
                      checked={page.technical.hasSSL}
                      label="HTTPS enabled"
                    />
                    <CheckItem
                      checked={page.technical.hasMobileViewport}
                      label="Mobile viewport set"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-semibold">
                        Link Profile
                      </h4>
                      <div className="flex gap-4 text-sm">
                        <span>
                          Internal:{' '}
                          <strong>{page.seo.internalLinkCount}</strong>
                        </span>
                        <span>
                          External:{' '}
                          <strong>{page.seo.externalLinkCount}</strong>
                        </span>
                        <span>
                          Images: <strong>{page.seo.imageCount}</strong>
                        </span>
                      </div>
                    </div>

                    {page.seo.schemaTypes.length > 0 && (
                      <div className="rounded-lg bg-muted/30 p-4">
                        <h4 className="mb-2 text-sm font-semibold">
                          Schema Markup Types
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {page.seo.schemaTypes.map((type, i) => (
                            <Badge key={i} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Headings */}
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-semibold">
                        Heading Hierarchy
                      </h4>
                      <div className="max-h-48 space-y-1 overflow-y-auto text-xs">
                        {page.seo.headings.h1.map((h, i) => (
                          <div key={`h1-${i}`} className="font-bold">
                            H1: {h}
                          </div>
                        ))}
                        {page.seo.headings.h2.map((h, i) => (
                          <div
                            key={`h2-${i}`}
                            className="ml-3 font-semibold text-muted-foreground"
                          >
                            H2: {h}
                          </div>
                        ))}
                        {page.seo.headings.h3.map((h, i) => (
                          <div
                            key={`h3-${i}`}
                            className="ml-6 text-muted-foreground"
                          >
                            H3: {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* KEYWORDS */}
            <TabsContent value="keywords">
              <div className="space-y-4">
                {page.keywords.metaKeywords.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Meta Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {page.keywords.metaKeywords.map((kw) => (
                        <Badge key={kw} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-2 text-sm font-semibold">
                    Top Keywords by Frequency
                  </h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium">Keyword</th>
                          <th className="pb-2 text-right font-medium">Count</th>
                          <th className="pb-2 text-right font-medium">
                            Density
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {page.keywords.topKeywordsByFrequency
                          .slice(0, 20)
                          .map((kw) => (
                            <tr
                              key={kw.keyword}
                              className="border-b border-border/30"
                            >
                              <td className="py-1.5">{kw.keyword}</td>
                              <td className="py-1.5 text-right">{kw.count}</td>
                              <td className="py-1.5 text-right">
                                {kw.density}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {page.keywords.extractedFromHeadings.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Keywords from Headings
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {page.keywords.extractedFromHeadings.map((kw) => (
                        <Badge key={kw} variant="outline">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Total unique keywords:{' '}
                  <strong>{page.keywords.totalUniqueKeywords}</strong>
                </div>
              </div>
            </TabsContent>

            {/* STRUCTURE (semantic tags) */}
            <TabsContent value="structure">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Semantic HTML Tags
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(page.tags)
                      .filter(([key]) => key !== 'totalSemanticTags')
                      .map(([tag, count]) => (
                        <div
                          key={tag}
                          className="flex items-center justify-between text-sm"
                        >
                          <code className="rounded bg-muted px-2 py-0.5 text-xs">
                            &lt;{tag}&gt;
                          </code>
                          <span
                            className={
                              count > 0
                                ? 'font-medium text-green-600'
                                : 'text-muted-foreground'
                            }
                          >
                            {count}
                          </span>
                        </div>
                      ))}
                    <div className="mt-2 border-t pt-2 text-sm font-semibold">
                      Total: {page.tags.totalSemanticTags}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Content Stats
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Words:</span>
                        <strong>{page.content.wordCount.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Paragraphs:</span>
                        <strong>{page.content.paragraphCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Lists:</span>
                        <strong>{page.content.listCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Forms:</span>
                        <strong>{page.content.formCount}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Videos:</span>
                        <strong>{page.content.videoCount}</strong>
                      </div>
                    </div>
                  </div>

                  {page.content.socialMediaLinks.length > 0 && (
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-semibold">
                        Social Media
                      </h4>
                      <div className="space-y-1">
                        {page.content.socialMediaLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {(page.contactInfo.phones.length > 0 ||
                    page.contactInfo.emails.length > 0) && (
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-semibold">
                        Contact Info
                      </h4>
                      <div className="space-y-1 text-sm">
                        {page.contactInfo.phones.map((ph, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {ph}
                          </div>
                        ))}
                        {page.contactInfo.emails.map((em, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {em}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TECHNICAL */}
            <TabsContent value="technical">
              <div className="space-y-3">
                <div className="rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-3 text-sm font-semibold">
                    Technical Details
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <CheckItem
                      checked={page.technical.hasSSL}
                      label="HTTPS/SSL"
                    />
                    <CheckItem
                      checked={page.technical.hasMobileViewport}
                      label="Mobile Viewport"
                    />
                    <div className="text-sm">
                      Load Time:{' '}
                      <strong>{page.technical.loadTime}ms</strong>
                    </div>
                    <div className="text-sm">
                      CSS Files:{' '}
                      <strong>{page.technical.cssFileCount}</strong>
                    </div>
                    <div className="text-sm">
                      JS Files:{' '}
                      <strong>{page.technical.jsFileCount}</strong>
                    </div>
                    <div className="text-sm">
                      Method: <strong>{page.method}</strong>
                    </div>
                  </div>
                </div>

                {page.technical.technologies.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Detected Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {page.technical.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function MultiPageScrapingPage(): React.ReactElement {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [result, setResult] = useState<MultiPageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedToLocalForage, setSavedToLocalForage] = useState(false);
  const [options, setOptions] = useState<PageDiscoveryOptions>({
    maxPages: 10,
    includeSubpages: true,
    includeBlog: true,
    includeProducts: true,
    includeAbout: true,
    includeContact: true,
    includeServices: true,
    maxDepth: 2,
  });

  const handleOptionChange = useCallback(
    (key: keyof PageDiscoveryOptions, value: boolean | number) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleScrape = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setResult(null);
    setSavedToLocalForage(false);

    try {
      const response = await fetch('/api/scrape-multi-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), options }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);

        // Store in LocalForage for reuse
        try {
          await UnifiedLocalForageStorage.storePuppeteerData(
            url.trim(),
            data.data
          );
          setSavedToLocalForage(true);
        } catch {
          // LocalForage storage failed - non-critical
        }
      } else {
        setError(data.error || 'Multi-page scraping failed');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Multi-page scraping failed'
      );
    } finally {
      setIsScraping(false);
    }
  }, [url, options]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <h1 className="flex items-center justify-center text-3xl font-bold">
          <Globe className="mr-3 h-8 w-8 text-blue-600" />
          Multi-Page Content Scraping
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover and scrape content from multiple pages with comprehensive SEO
          data collection — meta tags, Open Graph, GA4, keywords, schema markup,
          and more
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-6 w-6 text-blue-600" />
            Website URL
          </CardTitle>
          <CardDescription>
            Enter the website URL to discover and scrape multiple pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isScraping && url.trim()) {
                    handleScrape();
                  }
                }}
                disabled={isScraping}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleScrape}
              disabled={isScraping || !url.trim()}
              className="w-full"
              size="lg"
            >
              {isScraping ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Scraping &amp; Analyzing Pages...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Discover &amp; Scrape Pages
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-6 w-6 text-green-600" />
            Scraping Options
          </CardTitle>
          <CardDescription>
            Configure which types of pages to discover and scrape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="maxPages">Maximum Pages</Label>
                <Input
                  id="maxPages"
                  type="number"
                  min="1"
                  max="20"
                  value={options.maxPages}
                  onChange={(e) =>
                    handleOptionChange('maxPages', parseInt(e.target.value) || 10)
                  }
                  disabled={isScraping}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxDepth">Maximum Depth</Label>
                <Input
                  id="maxDepth"
                  type="number"
                  min="1"
                  max="5"
                  value={options.maxDepth}
                  onChange={(e) =>
                    handleOptionChange('maxDepth', parseInt(e.target.value) || 2)
                  }
                  disabled={isScraping}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'includeSubpages' as const,
                  label: 'Include Subpages',
                },
                {
                  id: 'includeBlog' as const,
                  label: 'Include Blog/News Pages',
                },
                {
                  id: 'includeProducts' as const,
                  label: 'Include Product Pages',
                },
                {
                  id: 'includeAbout' as const,
                  label: 'Include About/Company Pages',
                },
                {
                  id: 'includeContact' as const,
                  label: 'Include Contact/Support Pages',
                },
                {
                  id: 'includeServices' as const,
                  label: 'Include Services/Solutions Pages',
                },
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <Checkbox
                    id={id}
                    checked={options[id] as boolean}
                    onCheckedChange={(checked) =>
                      handleOptionChange(id, checked === true)
                    }
                    disabled={isScraping}
                  />
                  <Label htmlFor={id}>{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Site-Wide Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                Site-Wide Summary
              </CardTitle>
              <CardDescription>
                Aggregated data across {result.totalPagesScraped} pages
                {savedToLocalForage && (
                  <Badge variant="outline" className="ml-2 text-green-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Saved to LocalForage
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.totalPagesScraped}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Pages Scraped
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.siteSummary.totalWordCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Words
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.siteSummary.allKeywords.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Keywords Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {result.siteSummary.contentThemes.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Content Themes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {result.siteSummary.pagesWithSchema}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    With Schema
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {result.siteSummary.pagesWithOG}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    With Open Graph
                  </div>
                </div>
              </div>

              {/* Analytics Summary */}
              {(result.siteSummary.ga4MeasurementIds.length > 0 ||
                result.siteSummary.gtmContainerIds.length > 0) && (
                <div className="mt-4 rounded-lg bg-muted/30 p-4">
                  <h4 className="mb-2 flex items-center text-sm font-semibold">
                    <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
                    Analytics Tracking Detected
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.siteSummary.ga4MeasurementIds.map((id) => (
                      <Badge key={id} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        GA4: {id}
                      </Badge>
                    ))}
                    {result.siteSummary.gtmContainerIds.map((id) => (
                      <Badge key={id} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        GTM: {id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Page Types */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileSearch className="mr-2 h-5 w-5 text-blue-600" />
                  Page Types Discovered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.siteMap.pageTypes).map(
                    ([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-sm capitalize">
                        {type}: {count}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Content Themes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.siteSummary.contentThemes.length > 0 ? (
                    result.siteSummary.contentThemes.map((theme, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {theme}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No specific themes identified
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Site-Wide Keywords */}
          {result.siteSummary.allKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <KeyRound className="mr-2 h-5 w-5 text-purple-600" />
                  Site-Wide Keywords ({result.siteSummary.allKeywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
                  {result.siteSummary.allKeywords.slice(0, 60).map((kw) => (
                    <Badge key={kw} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                  {result.siteSummary.allKeywords.length > 60 && (
                    <Badge variant="secondary" className="text-xs">
                      +{result.siteSummary.allKeywords.length - 60} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Page Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Globe className="mr-2 h-5 w-5 text-blue-600" />
                Individual Page Analysis ({result.pages.length})
              </CardTitle>
              <CardDescription>
                Click each page to expand and view full SEO data — meta tags,
                analytics, keywords, schema, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.pages.map((page, i) => (
                  <PageDetail key={i} page={page} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
