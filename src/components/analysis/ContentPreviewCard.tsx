'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, Tag, FileText } from 'lucide-react';
import { useState } from 'react';

interface ContentPreviewCardProps {
  data: any; // ScrapedData
}

export function ContentPreviewCard({ data }: ContentPreviewCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Meta Tags Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Meta Tags & SEO Data
          </CardTitle>
          <CardDescription>All meta tags extracted from the website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Title Tag</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.title, 'title')}
              >
                {copied === 'title' ? '✓ Copied' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm">{data.title || 'No title found'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Length: {data.title?.length || 0} chars (Optimal: 50-60)
            </p>
          </div>

          {/* Meta Description */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Meta Description</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.metaDescription, 'description')}
              >
                {copied === 'description' ? '✓ Copied' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm">{data.metaDescription || 'No meta description found'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Length: {data.metaDescription?.length || 0} chars (Optimal: 150-160)
            </p>
          </div>

          {/* OG Tags */}
          {(data.ogTitle || data.ogDescription) && (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <span className="text-sm font-semibold text-muted-foreground">Open Graph Tags</span>
              <div className="mt-2 space-y-1 text-sm">
                {data.ogTitle && <div><strong>OG Title:</strong> {data.ogTitle}</div>}
                {data.ogDescription && <div><strong>OG Description:</strong> {data.ogDescription}</div>}
                {data.ogImage && <div><strong>OG Image:</strong> {data.ogImage}</div>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Extracted Keywords & Rankings
          </CardTitle>
          <CardDescription>Top keywords found in content and headings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keyword Meta Tag */}
          {data.metaKeywords && data.metaKeywords.length > 0 && (
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-muted-foreground">Meta Keywords Tag</span>
                <Badge>{data.metaKeywords.length} keywords</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.metaKeywords.map((keyword: string, i: number) => (
                  <Badge key={i} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Keywords */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-muted-foreground">Extracted Keywords (AI Analyzed)</span>
              <div className="flex items-center gap-2">
                <Badge>{data.extractedKeywords?.length || 0} keywords</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(data.extractedKeywords?.join(', ') || '', 'keywords')}
                >
                  {copied === 'keywords' ? '✓ Copied' : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.extractedKeywords?.slice(0, 20).map((keyword: string, i: number) => (
                <Badge key={i} variant="outline">{keyword}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These keywords were extracted from your content, headings, and meta tags. They represent what your site might rank for.
            </p>
          </div>

          {/* Topic Clusters */}
          {data.topicClusters && data.topicClusters.length > 0 && (
            <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">Topic Clusters (H2 Headings)</span>
                <Badge variant="default" className="bg-green-600">{data.topicClusters.length} topics</Badge>
              </div>
              <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                {data.topicClusters.map((topic: string, i: number) => (
                  <div key={i}>• {topic}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">{data.wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">{data.imageCount}</div>
              <div className="text-xs text-muted-foreground">Images</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">{data.linkCount}</div>
              <div className="text-xs text-muted-foreground">Links</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-bold">{data.headings?.h1?.length || 0}</div>
              <div className="text-xs text-muted-foreground">H1 Tags</div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mt-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Content Preview (First 500 chars)</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.cleanText || '', 'content')}
              >
                {copied === 'content' ? '✓ Copied All' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {data.cleanText?.substring(0, 500) || 'No content extracted'}...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Technical SEO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 border rounded">
              <span>SSL Certificate (HTTPS)</span>
              <Badge variant={data.hasSSL ? 'default' : 'destructive'}>
                {data.hasSSL ? '✓ Yes' : '✗ No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Canonical URL</span>
              <Badge variant={data.canonicalUrl ? 'default' : 'outline'}>
                {data.canonicalUrl ? '✓ Set' : '✗ Missing'}
              </Badge>
            </div>
            {data.schemaTypes && data.schemaTypes.length > 0 && (
              <div className="p-2 border rounded">
                <span className="font-semibold">Structured Data:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.schemaTypes.map((type: string, i: number) => (
                    <Badge key={i} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-2 border rounded">
              <span>Page Load Time</span>
              <Badge>{data.loadTime}ms</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

