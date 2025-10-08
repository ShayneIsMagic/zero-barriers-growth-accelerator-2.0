import EvaluationGuideViewer from '@/components/analysis/EvaluationGuideViewer';

export default function EvaluationGuidePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Evaluation Guide Deliverable</h1>
        <p className="text-gray-600 mt-2">
          Access the comprehensive Website Evaluation Worksheet Integration Guide that shows exactly how the system captures actual language and evidence matching.
        </p>
      </div>
      
      <EvaluationGuideViewer />
    </div>
  );
}
