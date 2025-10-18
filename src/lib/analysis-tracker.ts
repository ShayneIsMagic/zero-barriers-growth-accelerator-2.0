/**
 * Analysis Progress Tracker
 * Tracks the completion status of each analysis component
 */

export interface AnalysisProgress {
  id: string;
  url: string;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  steps: {
    baseAnalysis: StepProgress;
    pageAudit: StepProgress;
    lighthouse: StepProgress;
    geminiInsights: StepProgress;
  };
  overallProgress: number;
  errors: AnalysisError[];
}

export interface StepProgress {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  score?: number;
  error?: string;
  retryCount: number;
}

export interface AnalysisError {
  step: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface AnalysisMetrics {
  totalAnalyses: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  averageScore: number;
  averageDuration: number;
  stepSuccessRates: {
    baseAnalysis: number;
    pageAudit: number;
    lighthouse: number;
    geminiInsights: number;
  };
}

class AnalysisTracker {
  private analyses: Map<string, AnalysisProgress> = new Map();
  private readonly STORAGE_KEY = 'analysis-progress';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Start a new analysis
   */
  startAnalysis(url: string): string {
    const id = this.generateId();
    const analysis: AnalysisProgress = {
      id,
      _url,
      startedAt: new Date().toISOString(),
      status: 'running',
      steps: {
        baseAnalysis: { status: 'pending', retryCount: 0 },
        pageAudit: { status: 'pending', retryCount: 0 },
        lighthouse: { status: 'pending', retryCount: 0 },
        geminiInsights: { status: 'pending', retryCount: 0 },
      },
      overallProgress: 0,
      errors: [],
    };

    this.analyses.set(id, analysis);
    this.saveToStorage();
    return id;
  }

  /**
   * Update step progress
   */
  updateStepProgress(
    analysisId: string,
    step: keyof AnalysisProgress['steps'],
    status: StepProgress['status'],
    data?: {
      score?: number;
      error?: string;
      duration?: number;
    }
  ): void {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return;

    const stepProgress = analysis.steps[step];
    
    // Update step status
    stepProgress.status = status;
    
    if (status === 'running') {
      stepProgress.startedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      stepProgress.completedAt = new Date().toISOString();
      if (stepProgress.startedAt) {
        stepProgress.duration = Date.now() - new Date(stepProgress.startedAt).getTime();
      }
    }

    // Update additional data
    if (data?.score !== undefined) stepProgress.score = data.score;
    if (data?.error) {
      stepProgress.error = data.error;
      analysis.errors.push({
        step,
        message: data.error,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Increment retry count on failure
    if (status === 'failed') {
      stepProgress.retryCount++;
    }

    // Calculate overall progress
    this.calculateOverallProgress(analysis);
    
    // Update analysis status
    this.updateAnalysisStatus(analysis);

    this.saveToStorage();
  }

  /**
   * Retry a failed step
   */
  retryStep(analysisId: string, step: keyof AnalysisProgress['steps']): void {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return;

    analysis.steps[step].status = 'pending';
    delete analysis.steps[step].error;
    this.saveToStorage();
  }

  /**
   * Skip a step
   */
  skipStep(analysisId: string, step: keyof AnalysisProgress['steps']): void {
    this.updateStepProgress(analysisId, step, 'skipped');
  }

  /**
   * Mark error as resolved
   */
  resolveError(analysisId: string, step: string, timestamp: string): void {
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return;

    const error = analysis.errors.find(
      e => e.step === step && e.timestamp === timestamp
    );
    if (error) {
      error.resolved = true;
      this.saveToStorage();
    }
  }

  /**
   * Get analysis progress
   */
  getAnalysisProgress(analysisId: string): AnalysisProgress | undefined {
    return this.analyses.get(analysisId);
  }

  /**
   * Get all analyses
   */
  getAllAnalyses(): AnalysisProgress[] {
    return Array.from(this.analyses.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  /**
   * Get analysis metrics
   */
  getMetrics(): AnalysisMetrics {
    const analyses = this.getAllAnalyses();
    
    const totalAnalyses = analyses.length;
    const successfulAnalyses = analyses.filter(a => a.status === 'completed').length;
    const failedAnalyses = analyses.filter(a => a.status === 'failed').length;
    
    const completedAnalyses = analyses.filter(a => a.status === 'completed');
    const averageScore = completedAnalyses.length > 0 
      ? completedAnalyses.reduce((sum, a) => {
          const scores = Object.values(a.steps)
            .filter(s => s.score !== undefined)
            .map(s => s.score!);
          return sum + (scores.length > 0 ? scores.reduce((s, score) => s + score, 0) / scores.length : 0);
        }, 0) / completedAnalyses.length
      : 0;

    const averageDuration = completedAnalyses.length > 0
      ? completedAnalyses.reduce((sum, a) => {
          if (a.completedAt && a.startedAt) {
            return sum + (new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime());
          }
          return sum;
        }, 0) / completedAnalyses.length
      : 0;

    // Calculate step success rates
    const stepSuccessRates = {
      baseAnalysis: this.calculateStepSuccessRate(analyses, 'baseAnalysis'),
      pageAudit: this.calculateStepSuccessRate(analyses, 'pageAudit'),
      lighthouse: this.calculateStepSuccessRate(analyses, 'lighthouse'),
      geminiInsights: this.calculateStepSuccessRate(analyses, 'geminiInsights'),
    };

    return {
      totalAnalyses,
      successfulAnalyses,
      failedAnalyses,
      averageScore: Math.round(averageScore * 100) / 100,
      averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
      stepSuccessRates,
    };
  }

  /**
   * Delete analysis
   */
  deleteAnalysis(analysisId: string): void {
    this.analyses.delete(analysisId);
    this.saveToStorage();
  }

  /**
   * Clear all analyses
   */
  clearAll(): void {
    this.analyses.clear();
    this.saveToStorage();
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateOverallProgress(analysis: AnalysisProgress): void {
    const steps = Object.values(analysis.steps);
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const skippedSteps = steps.filter(s => s.status === 'skipped').length;
    
    // Calculate progress based on completed and skipped steps
    const totalSteps = steps.length;
    const progressSteps = completedSteps + skippedSteps;
    
    analysis.overallProgress = Math.round((progressSteps / totalSteps) * 100);
  }

  /**
   * Update analysis status based on step progress
   */
  private updateAnalysisStatus(analysis: AnalysisProgress): void {
    const steps = Object.values(analysis.steps);
    const hasRunning = steps.some(s => s.status === 'running');
    const hasFailed = steps.some(s => s.status === 'failed');
    const allCompleted = steps.every(s => s.status === 'completed' || s.status === 'skipped');

    if (hasRunning) {
      analysis.status = 'running';
    } else if (allCompleted) {
      analysis.status = 'completed';
      analysis.completedAt = new Date().toISOString();
    } else if (hasFailed) {
      analysis.status = 'failed';
    } else {
      analysis.status = 'pending';
    }
  }

  /**
   * Calculate success rate for a specific step
   */
  private calculateStepSuccessRate(analyses: AnalysisProgress[], step: keyof AnalysisProgress['steps']): number {
    const stepAnalyses = analyses.filter(a => 
      a.steps[step].status === 'completed' || a.steps[step].status === 'failed'
    );
    
    if (stepAnalyses.length === 0) return 0;
    
    const successful = stepAnalyses.filter(a => a.steps[step].status === 'completed').length;
    return Math.round((successful / stepAnalyses.length) * 100);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      const data = Array.from(this.analyses.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
          const entries = JSON.parse(data);
          this.analyses = new Map(entries);
        }
      } catch (error) {
        console.warn('Failed to load analysis progress from storage:', error);
      }
    }
  }
}

// Export singleton instance
export const analysisTracker = new AnalysisTracker();

// Types are already exported above
