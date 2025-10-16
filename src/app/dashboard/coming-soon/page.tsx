'use client';

import { ComingSoonModule } from '@/components/coming-soon/ComingSoonModule';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Module {
  id: string;
  name: string;
  description: string;
  status: 'coming_soon' | 'partial' | 'available';
  estimatedCompletion?: string;
  alternativeAction?: string;
  manualPrompt?: string;
}

export default function ComingSoonPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in production this would come from the API
    const mockModules: Module[] = [
      {
        id: 'lighthouse',
        name: 'Lighthouse Performance Analysis',
        description: 'Automated website performance, accessibility, and SEO scoring',
        status: 'coming_soon',
        estimatedCompletion: '2-3 weeks',
        alternativeAction: 'Use Google PageSpeed Insights manually',
        manualPrompt: `Please analyze this website's performance using Google Lighthouse:

URL: your-website-url

Focus on:
1. Performance metrics (Core Web Vitals)
2. Accessibility compliance
3. Best practices
4. SEO optimization

Provide specific scores and actionable recommendations.`
      },
      {
        id: 'seo_opportunities',
        name: 'SEO Opportunities Analysis',
        description: 'Keyword research, content gaps, and technical SEO recommendations',
        status: 'coming_soon',
        estimatedCompletion: '3-4 weeks',
        alternativeAction: 'Use Google Search Console and SEMrush',
        manualPrompt: `Please conduct SEO analysis for this website:

URL: your-website-url
Content: [paste your website content here]

Analyze:
1. Keyword opportunities and search volume
2. Content gaps and missing topics
3. Technical SEO issues
4. Meta tags and structured data
5. Internal linking opportunities

Provide prioritized recommendations with estimated impact.`
      },
      {
        id: 'advanced_content_analysis',
        name: 'Advanced Content Analysis',
        description: 'Deep content structure, readability, and engagement analysis',
        status: 'partial',
        estimatedCompletion: '1-2 weeks',
        alternativeAction: 'Use Hemingway Editor and Grammarly',
        manualPrompt: `Please analyze this website's content strategy:

URL: your-website-url
Content: [paste your website content here]

Evaluate:
1. Content structure and hierarchy
2. Readability and engagement
3. Call-to-action effectiveness
4. Content gaps and opportunities
5. User journey optimization

Provide specific recommendations for content improvement.`
      }
    ];

    setModules(mockModules);
    setLoading(false);
  }, []);

  const handleUsePrompt = (prompt: string) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt);
    // Could also open a modal or redirect to an AI tool
    alert('Prompt copied to clipboard! Paste it into your preferred AI tool.');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const availableModules = modules.filter(m => m.status === 'available');
  const partialModules = modules.filter(m => m.status === 'partial');
  const comingSoonModules = modules.filter(m => m.status === 'coming_soon');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Coming Soon Features</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We're working hard to bring you more automated analysis features.
          In the meantime, use the manual prompts below to get immediate AI-powered insights.
        </p>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Feature Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Available: {availableModules.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Partial: {partialModules.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Coming Soon: {comingSoonModules.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Modules */}
      {availableModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Available Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableModules.map((module) => (
              <ComingSoonModule
                key={module.id}
                {...module}
                onUsePrompt={handleUsePrompt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Partial Modules */}
      {partialModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-yellow-500" />
            Partial Functionality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partialModules.map((module) => (
              <ComingSoonModule
                key={module.id}
                {...module}
                onUsePrompt={handleUsePrompt}
              />
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Modules */}
      {comingSoonModules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" />
            Coming Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonModules.map((module) => (
              <ComingSoonModule
                key={module.id}
                {...module}
                onUsePrompt={handleUsePrompt}
              />
            ))}
          </div>
        </div>
      )}

      {/* How to Use Manual Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Manual Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-medium">Copy the Prompt</h3>
              <p className="text-sm text-muted-foreground">
                Click the copy button on any module to copy the manual analysis prompt
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-medium">Paste in AI Tool</h3>
              <p className="text-sm text-muted-foreground">
                Paste the prompt into ChatGPT, Claude, Gemini, or your preferred AI tool
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-medium">Get Results</h3>
              <p className="text-sm text-muted-foreground">
                Replace placeholders with your actual data and get immediate analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
