'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ComingSoonModuleProps {
  id: string;
  name: string;
  description: string;
  status: 'coming_soon' | 'partial' | 'available';
  estimatedCompletion?: string;
  alternativeAction?: string;
  manualPrompt?: string;
  onUsePrompt?: (prompt: string) => void;
}

export const ComingSoonModule: React.FC<ComingSoonModuleProps> = ({
  id,
  name,
  description,
  status,
  estimatedCompletion,
  alternativeAction,
  manualPrompt,
  onUsePrompt
}) => {
  const [promptCopied, setPromptCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (manualPrompt) {
      await navigator.clipboard.writeText(manualPrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-500">Available</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-500">Partial</Badge>;
      case 'coming_soon':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {status === 'coming_soon' && <Clock className="h-5 w-5 text-orange-500" />}
            {status === 'partial' && <Sparkles className="h-5 w-5 text-yellow-500" />}
            {status === 'available' && <Sparkles className="h-5 w-5 text-green-500" />}
            {name}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>

        {estimatedCompletion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated completion: {estimatedCompletion}</span>
          </div>
        )}

        {alternativeAction && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span>Alternative: {alternativeAction}</span>
          </div>
        )}

        {manualPrompt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Manual Analysis Prompt</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {promptCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            <div className="relative">
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                {manualPrompt}
              </pre>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>How to use:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Copy the prompt above</li>
                <li>Paste it into ChatGPT, Claude, or Gemini</li>
                <li>Replace "your-website-url" with your actual URL</li>
                <li>Get immediate AI analysis results</li>
              </ol>
            </div>

            {onUsePrompt && (
              <Button
                onClick={() => onUsePrompt(manualPrompt)}
                className="w-full"
                variant="outline"
              >
                Use This Prompt
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
