import SEOAnalysisForm from '@/components/analysis/SEOAnalysisForm';

export default function SEOAnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">SEO Analysis</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive SEO analysis following the practical workflow: Search
          Console → Keyword Planner → Google Trends → Competitive Analysis
        </p>
      </div>

      <SEOAnalysisForm />
    </div>
  );
}
