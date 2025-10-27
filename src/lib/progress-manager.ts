/**
 * Progress Manager for Analysis Tracking
 * Manages real-time progress updates, mini deliverables, and cohesive reporting
 */

import { AnalysisProgress } from '@/components/analysis/ProgressTracker';

export interface AnalysisPhase {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number; // seconds
  deliverables: AnalysisDeliverable[];
}

export interface AnalysisDeliverable {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // seconds
  phaseId: string;
}

export class ProgressManager {
  private progress: AnalysisProgress;
  private phases: AnalysisPhase[];
  private updateCallback?: (progress: AnalysisProgress) => void;
  private startTime: number = 0;

  constructor(url: string, phases: AnalysisPhase[]) {
    this.phases = phases;
    this.startTime = Date.now();

    this.progress = {
      id: `analysis_${Date.now()}`,
      url,
      overallProgress: 0,
      currentPhase: phases[0]?.name || 'Initializing',
      status: 'pending',
      phases: phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        status: 'pending',
        progress: 0,
        deliverables: phase.deliverables.map(deliverable => ({
          id: deliverable.id,
          title: deliverable.title,
          description: deliverable.description,
          status: 'pending',
          progress: 0,
          phaseId: deliverable.phaseId
        }))
      })),
      startTime: new Date().toISOString()
    };
  }

  /**
   * Set update callback for real-time progress updates
   */
  onUpdate(callback: (progress: AnalysisProgress) => void) {
    this.updateCallback = callback;
  }

  /**
   * Start the analysis
   */
  start() {
    this.progress.status = 'running';
    this.updateProgress();
  }

  /**
   * Start a specific phase
   */
  startPhase(phaseId: string) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'running';
      phase.startTime = new Date().toISOString();
      this.progress.currentPhase = phase.name;
      this.updateProgress();
    }
  }

  /**
   * Complete a specific phase
   */
  completePhase(phaseId: string, results?: any) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'completed';
      phase.progress = 100;
      phase.endTime = new Date().toISOString();
      if (phase.startTime && phase.endTime) {
        phase.duration = this.calculateDuration(phase.startTime, phase.endTime);
      }

      // Store phase results
      if (results) {
        phase.deliverables.forEach(deliverable => {
          if (results[deliverable.id]) {
            deliverable.result = results[deliverable.id];
          }
        });
      }

      this.updateOverallProgress();
      this.updateProgress();
    }
  }

  /**
   * Fail a specific phase
   */
  failPhase(phaseId: string, error: string) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (phase) {
      phase.status = 'failed';
      phase.endTime = new Date().toISOString();
      if (phase.startTime && phase.endTime) {
        phase.duration = this.calculateDuration(phase.startTime, phase.endTime);
      }
      this.progress.status = 'failed';
      this.updateProgress();
    }
  }

  /**
   * Start a specific deliverable
   */
  startDeliverable(phaseId: string, deliverableId: string) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    const deliverable = phase?.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.status = 'running';
      deliverable.timestamp = new Date().toISOString();
      this.updateProgress();
    }
  }

  /**
   * Update deliverable progress
   */
  updateDeliverableProgress(phaseId: string, deliverableId: string, progress: number) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    const deliverable = phase?.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.progress = Math.min(100, Math.max(0, progress));
      this.updatePhaseProgress(phaseId);
      this.updateOverallProgress();
      this.updateProgress();
    }
  }

  /**
   * Complete a specific deliverable
   */
  completeDeliverable(phaseId: string, deliverableId: string, result?: any) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    const deliverable = phase?.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.status = 'completed';
      deliverable.progress = 100;
      deliverable.result = result;
      this.updatePhaseProgress(phaseId);
      this.updateOverallProgress();
      this.updateProgress();
    }
  }

  /**
   * Fail a specific deliverable
   */
  failDeliverable(phaseId: string, deliverableId: string, error: string) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    const deliverable = phase?.deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      deliverable.status = 'failed';
      deliverable.error = error;
      this.updatePhaseProgress(phaseId);
      this.updateProgress();
    }
  }

  /**
   * Complete the entire analysis
   */
  complete() {
    this.progress.status = 'completed';
    this.progress.endTime = new Date().toISOString();
    if (this.progress.startTime && this.progress.endTime) {
      this.progress.totalDuration = this.calculateDuration(
        this.progress.startTime,
        this.progress.endTime
      );
    }
    this.updateProgress();
  }

  /**
   * Get current progress
   */
  getProgress(): AnalysisProgress {
    return { ...this.progress };
  }

  /**
   * Update overall progress based on phase progress
   */
  private updateOverallProgress() {
    if (this.progress.phases.length === 0) {
      this.progress.overallProgress = 0;
      return;
    }

    const totalProgress = this.progress.phases.reduce((sum, phase) => sum + phase.progress, 0);
    this.progress.overallProgress = Math.round(totalProgress / this.progress.phases.length);
  }

  /**
   * Update phase progress based on deliverable progress
   */
  private updatePhaseProgress(phaseId: string) {
    const phase = this.progress.phases.find(p => p.id === phaseId);
    if (phase && phase.deliverables.length > 0) {
      const totalProgress = phase.deliverables.reduce((sum, d) => sum + d.progress, 0);
      phase.progress = Math.round(totalProgress / phase.deliverables.length);
    }
  }

  /**
   * Calculate duration between two timestamps
   */
  private calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = end - start;

    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${Math.round(duration / 1000)}s`;
    } else {
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.round((duration % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress() {
    if (this.updateCallback) {
      this.updateCallback({ ...this.progress });
    }
  }
}

/**
 * Predefined analysis phases with mini deliverables
 */
export const ANALYSIS_PHASES: AnalysisPhase[] = [
  {
    id: 'phase1_data_collection',
    name: 'Phase 1: Data Collection',
    description: 'Comprehensive content and technical data gathering',
    estimatedDuration: 120, // 2 minutes
    deliverables: [
      {
        id: 'content_scraping',
        title: 'Content Scraping',
        description: 'Extract HTML, metadata, images, links, and forms',
        estimatedDuration: 30,
        phaseId: 'phase1_data_collection'
      },
      {
        id: 'pageaudit_analysis',
        title: 'PageAudit Analysis',
        description: 'Technical SEO audit and content quality assessment',
        estimatedDuration: 45,
        phaseId: 'phase1_data_collection'
      },
      {
        id: 'lighthouse_performance',
        title: 'Lighthouse Performance',
        description: 'Core Web Vitals and mobile responsiveness analysis',
        estimatedDuration: 60,
        phaseId: 'phase1_data_collection'
      },
      {
        id: 'google_trends',
        title: 'Google Trends Analysis',
        description: 'Real-time trending keywords and interest analysis',
        estimatedDuration: 30,
        phaseId: 'phase1_data_collection'
      }
    ]
  },
  {
    id: 'phase2_ai_frameworks',
    name: 'Phase 2: AI Framework Analysis',
    description: 'Advanced AI-powered business framework analysis',
    estimatedDuration: 300, // 5 minutes
    deliverables: [
      {
        id: 'golden_circle',
        title: 'Golden Circle Analysis',
        description: 'Simon Sinek\'s WHY, HOW, WHAT, and WHO framework',
        estimatedDuration: 60,
        phaseId: 'phase2_ai_frameworks'
      },
      {
        id: 'b2c_elements',
        title: 'B2C Elements of Value',
        description: '30 Consumer Elements of Value assessment',
        estimatedDuration: 90,
        phaseId: 'phase2_ai_frameworks'
      },
      {
        id: 'b2b_elements',
        title: 'B2B Elements of Value',
        description: '40 Business Elements of Value assessment',
        estimatedDuration: 90,
        phaseId: 'phase2_ai_frameworks'
      },
      {
        id: 'clifton_strengths',
        title: 'CliftonStrengths Analysis',
        description: '34 Gallup CliftonStrengths themes assessment',
        estimatedDuration: 90,
        phaseId: 'phase2_ai_frameworks'
      }
    ]
  },
  {
    id: 'phase3_strategic_analysis',
    name: 'Phase 3: Strategic Analysis',
    description: 'Comprehensive strategic insights and recommendations',
    estimatedDuration: 180, // 3 minutes
    deliverables: [
      {
        id: 'competitive_analysis',
        title: 'Competitive Analysis',
        description: 'Market positioning and competitive advantage analysis',
        estimatedDuration: 60,
        phaseId: 'phase3_strategic_analysis'
      },
      {
        id: 'content_quality',
        title: 'Content Quality Assessment',
        description: 'Content effectiveness and engagement analysis',
        estimatedDuration: 60,
        phaseId: 'phase3_strategic_analysis'
      },
      {
        id: 'actionable_recommendations',
        title: 'Actionable Recommendations',
        description: 'Prioritized action items with implementation roadmap',
        estimatedDuration: 60,
        phaseId: 'phase3_strategic_analysis'
      }
    ]
  }
];

/**
 * Create a new progress manager instance
 */
export function createProgressManager(url: string): ProgressManager {
  return new ProgressManager(url, ANALYSIS_PHASES);
}
