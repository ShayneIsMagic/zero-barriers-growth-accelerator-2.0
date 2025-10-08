'use client';

import React from 'react';
import { PageAnalysisForm } from '@/components/analysis/PageAnalysisForm';
import { PageAnalysisResult } from '@/lib/page-analyzer';

export default function PageAnalysisPage() {
  const handleAnalysisComplete = (result: PageAnalysisResult) => {
    console.log('Analysis completed:', result);
    // You can add additional handling here, like saving to database
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Page Analysis</h1>
          <p className="text-muted-foreground">
            Analyze individual pages with specialized AI prompts for comprehensive insights. 
            Perfect for analyzing specific pages like home pages, testimonials, services, and more.
          </p>
        </div>

        <PageAnalysisForm onAnalysisComplete={handleAnalysisComplete} />

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Analysis Tips</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div>• Enter any website URL to analyze</div>
            <div>• Select the appropriate page type for better analysis</div>
            <div>• Home pages work best for overall company analysis</div>
            <div>• Testimonials pages help analyze social proof</div>
          </div>
        </div>
      </div>
    </div>
  );
}
