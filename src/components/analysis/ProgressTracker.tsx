'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Loader2,
} from 'lucide-react';

export interface MiniDeliverable {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  duration?: string;
  result?: any;
  error?: string;
  timestamp?: string;
}

export interface PhaseProgress {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  deliverables: MiniDeliverable[];
  startTime?: string;
  endTime?: string;
  duration?: string;
}

export interface AnalysisProgress {
  id: string;
  url: string;
  overallProgress: number; // 0-100
  currentPhase: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  phases: PhaseProgress[];
  startTime: string;
  endTime?: string;
  totalDuration?: string;
}

interface ProgressTrackerProps {
  progress: AnalysisProgress;
  onPhaseClick?: (phaseId: string) => void;
  onDeliverableClick?: (phaseId: string, deliverableId: string) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function ProgressTracker({
  progress,
  onPhaseClick,
  onDeliverableClick,
  showDetails = true,
  compact = false,
}: ProgressTrackerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <Badge
        className={`${colors[status as keyof typeof colors] || colors.pending} border`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Analysis Progress</CardTitle>
              {getStatusIcon(progress.status)}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {progress.overallProgress}%
              </div>
              <div className="text-sm text-gray-500">
                {progress.currentPhase}
              </div>
            </div>
          </div>
          <Progress value={progress.overallProgress} className="w-full" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Analysis Progress</CardTitle>
            <CardDescription>
              Analyzing {progress.url} • Started{' '}
              {new Date(progress.startTime).toLocaleTimeString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {progress.overallProgress}%
            </div>
            <div className="text-sm text-gray-500">Overall Progress</div>
          </div>
        </div>
        <Progress value={progress.overallProgress} className="h-3 w-full" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon(progress.status)}
            <div>
              <div className="font-medium">Current Status</div>
              <div className="text-sm text-gray-600">
                {progress.currentPhase}
              </div>
            </div>
          </div>
          {getStatusBadge(progress.status)}
        </div>

        {/* Phases */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Analysis Phases</h3>
          {progress.phases.map((phase) => (
            <Card
              key={phase.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                phase.status === 'running' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onPhaseClick?.(phase.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(phase.status)}
                    <div>
                      <CardTitle className="text-base">{phase.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {phase.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {phase.progress}%
                    </div>
                    {getStatusBadge(phase.status)}
                  </div>
                </div>
                <Progress value={phase.progress} className="h-2 w-full" />
              </CardHeader>

              {showDetails && phase.deliverables.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Mini Deliverables:
                    </h4>
                    {phase.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className="flex cursor-pointer items-center justify-between rounded bg-gray-50 p-2 transition-colors hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeliverableClick?.(phase.id, deliverable.id);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(deliverable.status)}
                          <div>
                            <div className="text-sm font-medium">
                              {deliverable.title}
                            </div>
                            <div className="text-xs text-gray-600">
                              {deliverable.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {deliverable.progress}%
                          </div>
                          {deliverable.duration && (
                            <div className="text-xs text-gray-500">
                              {deliverable.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Timing Information */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Start Time</div>
            <div className="text-sm text-gray-600">
              {new Date(progress.startTime).toLocaleString()}
            </div>
          </div>
          {progress.endTime && (
            <div>
              <div className="text-sm font-medium text-gray-700">End Time</div>
              <div className="text-sm text-gray-600">
                {new Date(progress.endTime).toLocaleString()}
              </div>
            </div>
          )}
          {progress.totalDuration && (
            <div className="col-span-2">
              <div className="text-sm font-medium text-gray-700">
                Total Duration
              </div>
              <div className="text-sm text-gray-600">
                {progress.totalDuration}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProgressTracker;
