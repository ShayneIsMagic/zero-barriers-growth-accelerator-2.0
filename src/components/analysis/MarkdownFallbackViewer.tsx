'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MarkdownFallbackViewerProps {
  markdownContent: string;
  frameworkName: string;
  errorMessage: string;
}

export function MarkdownFallbackViewer({
  markdownContent,
  frameworkName,
  errorMessage,
}: MarkdownFallbackViewerProps): React.ReactElement {
  const copyToClipboard = (): void => {
    navigator.clipboard.writeText(markdownContent);
    toast.success('Prompt copied to clipboard! Paste it into any AI platform.');
  };

  const downloadMarkdown = (): void => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${frameworkName}-analysis-prompt-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Markdown file downloaded!');
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>AI Analysis Unavailable</AlertTitle>
        <AlertDescription>
          {errorMessage}
          <br />
          <strong>
            Use the prompt below with any AI platform (ChatGPT, Claude, Gemini)
            to complete the analysis manually.
          </strong>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{frameworkName} — Analysis Prompt</CardTitle>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy Prompt
              </Button>
              <Button onClick={downloadMarkdown} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download .md
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto rounded-md border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {markdownContent}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
