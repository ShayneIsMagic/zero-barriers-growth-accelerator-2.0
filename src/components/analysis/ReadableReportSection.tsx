'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ReadableReportSection({ title, description, sections, prompt }: ReadableReportSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllSections = () => {
    const allText = sections.map(s => `${s.heading}\n\n${s.content}`).join('\n\n---\n\n');
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
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{section.heading}</h4>
              <div className="flex items-center gap-2">
                {section.score !== undefined && (
                  <Badge variant={section.score >= 70 ? 'default' : 'destructive'}>
                    {section.score}/100
                  </Badge>
                )}
                {section.copyable !== false && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(section.content, `section-${index}`)}
                  >
                    {copied === `section-${index}` ? '✓' : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        ))}

        {/* AI Prompt Section */}
        {prompt && (
          <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                <FileText className="inline h-4 w-4 mr-2" />
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
            <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 rounded">
              {prompt}
            </pre>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              💡 You can copy this prompt and run it manually at <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" className="underline">gemini.google.com</a> to verify or re-run the analysis.
            </p>
          </div>
        )}

        {/* Copy to Report Helper */}
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            📋 How to Use This in Client Reports
          </h4>
          <ol className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>1. Click &quot;Copy&quot; on any section you want to include</li>
            <li>2. Paste into your client report document</li>
            <li>3. Each section is pre-formatted and ready to use</li>
            <li>4. Or click &quot;Copy All&quot; to get the entire analysis</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

