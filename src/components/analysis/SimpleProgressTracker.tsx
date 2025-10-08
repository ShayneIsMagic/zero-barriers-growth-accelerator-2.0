'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

interface SimpleStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

interface SimpleProgressTrackerProps {
  steps: SimpleStep[];
  currentStep?: string | undefined;
}

export default function SimpleProgressTracker({ steps, currentStep }: SimpleProgressTrackerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const completed = steps.filter(step => step.status === 'completed').length;
    const total = steps.length;
    setProgress(Math.round((completed / total) * 100));
  }, [steps]);

  const getStepIcon = (step: SimpleStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepTextColor = (step: SimpleStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'failed':
        return 'text-red-600';
      case 'skipped':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-3">
            {getStepIcon(step)}
            <span className={`text-sm font-medium ${getStepTextColor(step)}`}>
              {step.name}
            </span>
            {step.status === 'completed' && (
              <span className="text-xs text-green-600 ml-auto">✓ Done</span>
            )}
            {step.status === 'running' && (
              <span className="text-xs text-blue-600 ml-auto">Running...</span>
            )}
            {step.status === 'failed' && (
              <span className="text-xs text-red-600 ml-auto">Failed</span>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{steps.filter(s => s.status === 'completed').length}</span> of{' '}
          <span className="font-medium">{steps.length}</span> steps completed
        </div>
      </div>
    </div>
  );
}
