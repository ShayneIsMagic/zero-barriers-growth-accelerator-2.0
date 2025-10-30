'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, FileText } from 'lucide-react';
import { useState } from 'react';

interface ReadableReportSectionProps {
  title: string;
  description: string;
  sections: {
    heading: string;
    content: string;
    score?: number;
    copyable?: boolean;
  }[];
  prompt?: string;
}

export function ReadableReportSection({
  title,
  description,
  sections,
  prompt,
}: ReadableReportSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllSections = () => {
    const allText = sections
      .map((s) => `${s.heading}\n\n${s.content}`)
      .join('\n\n---\n\n');
    copyToClipboard(allText, 'all');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button onClick={copyAllSections} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            {copied === 'all' ? '✓ Copied All' : 'Copy All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold">{section.heading}</h4>
              <div className="flex items-center gap-2">
                {section.score !== undefined && (
                  <Badge
                    variant={section.score >= 70 ? 'default' : 'destructive'}
                  >
                    {section.score}/100
                  </Badge>
                )}
                {section.copyable !== false && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(section.content, `section-${index}`)
                    }
                  >
                    {copied === `section-${index}` ? (
                      '✓'
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">
              {section.content}
            </div>
          </div>
        ))}

        {/* AI Prompt Section */}
        {prompt && (
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                <FileText className="mr-2 inline h-4 w-4" />
                AI Prompt Used
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(prompt, 'prompt')}
              >
                {copied === 'prompt' ? '✓ Copied' : 'Copy Prompt'}
              </Button>
            </div>
            <pre className="whitespace-pre-wrap rounded bg-white p-3 text-xs text-blue-800 dark:bg-gray-900 dark:text-blue-200">
              {prompt}
            </pre>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              💡 You can copy this prompt and run it manually at{' '}
              <a
                href="https://gemini.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                gemini.google.com
              </a>{' '}
              to verify or re-run the analysis.
            </p>
          </div>
        )}

        {/* Copy to Report Helper */}
        <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950">
          <h4 className="mb-2 font-semibold text-green-900 dark:text-green-100">
            📋 How to Use This in Client Reports
          </h4>
          <ol className="space-y-1 text-sm text-green-800 dark:text-green-200">
            <li>
              1. Click &quot;Copy&quot; on any section you want to include
            </li>
            <li>2. Paste into your client report document</li>
            <li>3. Each section is pre-formatted and ready to use</li>
            <li>4. Or click &quot;Copy All&quot; to get the entire analysis</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
