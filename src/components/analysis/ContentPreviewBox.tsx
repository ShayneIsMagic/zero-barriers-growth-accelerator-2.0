/**
 * Content Preview Box Component
 * Reusable component for displaying scraped content with proper formatting
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, Target } from 'lucide-react';
import { useState } from 'react';

interface ContentPreviewBoxProps {
  scrapedContent: any;
  url: string;
  title?: string;
  description?: string;
}

export function ContentPreviewBox({
  scrapedContent,
  _url,
  title = "Scraped Content Preview",
  description
}: ContentPreviewBoxProps) {
  const [copied, setCopied] = useState(false);

  const copyContent = () => {
    navigator.clipboard.writeText(scrapedContent.cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatContentLength = (length: number) => {
    if (length < 1000) return `${length} characters`;
    if (length < 100000) return `${(length / 1000).toFixed(1)}K characters`;
    return `${(length / 1000).toFixed(0)}K characters`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="mr-2 h-6 w-6 text-blue-600" />
            {title}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={copyContent}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Content
              </>
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          {description || `Content successfully scraped from ${url}. Review the data before analysis.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Title:</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {scrapedContent.title || 'No title found'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Meta Description:</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {scrapedContent.metaDescription || 'No meta description found'}
              </p>
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Content Preview:</h4>
              <span className="text-xs text-muted-foreground">
                📊 {formatContentLength(scrapedContent.cleanText.length)}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {scrapedContent.cleanText}
              </pre>
            </div>
          </div>

          {/* Headings Found */}
          {scrapedContent.headings && scrapedContent.headings.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Headings Found ({scrapedContent.headings.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {scrapedContent.headings.slice(0, 15).map((heading: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {heading}
                  </Badge>
                ))}
                {scrapedContent.headings.length > 15 && (
                  <Badge variant="secondary" className="text-xs">
                    +{scrapedContent.headings.length - 15} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">URL:</span>
              <p className="break-all">{url}</p>
            </div>
            <div>
              <span className="font-medium">Content Type:</span>
              <p>Website Content</p>
            </div>
            <div>
              <span className="font-medium">Scraped:</span>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-green-600">✅ Ready for Analysis</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
