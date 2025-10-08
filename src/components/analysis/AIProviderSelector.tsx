'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Brain, Sparkles } from 'lucide-react';
import { AIProvider } from '@/lib/ai-providers';

interface ProviderInfo {
  id: AIProvider;
  name: string;
  available: boolean;
  model?: string;
  description: string;
  icon: React.ReactNode;
}

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  providers: ProviderInfo[];
}

export function AIProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  providers 
}: AIProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        disabled={providers.filter(p => p.available).length === 0}
      >
        <div className="flex items-center gap-2">
          {selectedProviderInfo?.icon}
          <span>{selectedProviderInfo?.name || 'Select AI Provider'}</span>
          {selectedProviderInfo?.model && (
            <Badge variant="secondary" className="text-xs">
              {selectedProviderInfo.model}
            </Badge>
          )}
        </div>
        <Zap className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border rounded-lg shadow-lg">
          <div className="p-2">
            <div className="text-sm font-medium text-muted-foreground mb-2 px-2">
              Choose AI Provider
            </div>
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  onProviderChange(provider.id);
                  setIsOpen(false);
                }}
                disabled={!provider.available}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  provider.available
                    ? 'hover:bg-accent hover:text-accent-foreground'
                    : 'opacity-50 cursor-not-allowed'
                } ${
                  selectedProvider === provider.id ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {provider.description}
                      </div>
                      {provider.model && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {provider.model}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!provider.available && (
                      <Badge variant="destructive" className="text-xs">
                        Not Configured
                      </Badge>
                    )}
                    {selectedProvider === provider.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const AI_PROVIDERS: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    available: false, // Will be set dynamically
    model: 'gpt-4-turbo-preview',
    description: 'Most advanced reasoning and analysis capabilities',
    icon: <Brain className="h-5 w-5 text-green-600" />,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    available: false, // Will be set dynamically
    model: 'gemini-1.5-flash',
    description: 'Fast and efficient analysis with Google AI',
    icon: <Sparkles className="h-5 w-5 text-blue-600" />,
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    available: false, // Will be set dynamically
    model: 'claude-3-haiku-20240307',
    description: 'Balanced performance and cost-effectiveness',
    icon: <Zap className="h-5 w-5 text-purple-600" />,
  },
];
