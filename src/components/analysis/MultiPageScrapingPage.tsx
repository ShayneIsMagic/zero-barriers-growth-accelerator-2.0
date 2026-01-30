/**
 * Multi-Page Content Scraping Page
 * Allows users to scrape multiple pages from a website for comprehensive analysis
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
  CheckCircle,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Search,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

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

interface MultiPageResult {
  homepage: any;
  additionalPages: Array<{
    url: string;
    data: any;
    pageType: string;
    priority: number;
  }>;
  siteMap: {
    totalPages: number;
    discoveredPages: string[];
    pageTypes: { [key: string]: number };
  };
  comprehensiveContent: {
    allText: string;
    allHeadings: string[];
    allKeywords: string[];
    contentThemes: string[];
  };
}

export function MultiPageScrapingPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [result, setResult] = useState<MultiPageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsScraping(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scrape-multi-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, options }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        // Multi-page scraping completed
      } else {
        setError(data.error || 'Multi-page scraping failed');
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Multi-page scraping failed'
      );
    } finally {
      setIsScraping(false);
    }
  };

  const handleOptionChange = (key: keyof PageDiscoveryOptions, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="space-y-4 text-center">
        <h1 className="flex items-center justify-center text-3xl font-bold">
          <Globe className="mr-3 h-8 w-8 text-blue-600" />
          Multi-Page Content Scraping
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover and scrape content from multiple pages across a website for
          comprehensive analysis
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
                disabled={isScraping}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleScrape}
              disabled={isScraping || !url.trim()}
              className="w-full"
            >
              {isScraping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping Multiple Pages...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Discover & Scrape Pages
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
                    handleOptionChange('maxPages', parseInt(e.target.value))
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
                    handleOptionChange('maxDepth', parseInt(e.target.value))
                  }
                  disabled={isScraping}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSubpages"
                  checked={options.includeSubpages}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeSubpages', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeSubpages">Include Subpages</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeBlog"
                  checked={options.includeBlog}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeBlog', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeBlog">Include Blog/News Pages</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeProducts"
                  checked={options.includeProducts}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeProducts', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeProducts">Include Product Pages</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAbout"
                  checked={options.includeAbout}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeAbout', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeAbout">
                  Include About/Company Pages
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeContact"
                  checked={options.includeContact}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeContact', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeContact">
                  Include Contact/Support Pages
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeServices"
                  checked={options.includeServices}
                  onCheckedChange={(checked) =>
                    handleOptionChange('includeServices', checked)
                  }
                  disabled={isScraping}
                />
                <Label htmlFor="includeServices">
                  Include Services/Solutions Pages
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                Scraping Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.siteMap.totalPages}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Pages
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.comprehensiveContent.allKeywords.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Keywords Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.comprehensiveContent.allHeadings.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Headings Found
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {result.comprehensiveContent.contentThemes.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Content Themes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-6 w-6 text-blue-600" />
                Page Types Discovered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.siteMap.pageTypes).map(
                  ([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-sm">
                      {type}: {count}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Themes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-green-600" />
                Content Themes Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.comprehensiveContent.contentThemes.map(
                  (theme, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {theme}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discovered Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ExternalLink className="mr-2 h-6 w-6 text-purple-600" />
                Discovered Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {result.additionalPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{page.url}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {page.pageType} | Priority: {page.priority}
                      </div>
                    </div>
                    <Badge variant="outline">{page.data.wordCount} words</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-6 w-6 text-orange-600" />
                Comprehensive Content Preview
              </CardTitle>
              <CardDescription>
                Combined content from all pages (first 2000 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-xs dark:bg-gray-900">
                  {result.comprehensiveContent.allText.substring(0, 2000)}
                  {result.comprehensiveContent.allText.length > 2000 && '...'}
                </pre>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total content length:{' '}
                {result.comprehensiveContent.allText.length.toLocaleString()}{' '}
                characters
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
