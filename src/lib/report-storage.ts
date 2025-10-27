/**
 * Report Storage and Retrieval System
 *
 * Stores analysis reports in Supabase database (not file system)
 * File system is ephemeral in Vercel serverless environment
 */

import { prisma } from './prisma';

export interface StoredReport {
  id: string;
  url: string;
  timestamp: string;
  reportType:
    | 'comprehensive'
    | 'phase1'
    | 'phase2'
    | 'phase3'
    | 'controlled-analysis'
    | 'enhanced-analysis';
  data: any;
  summary: {
    overallScore: number;
    rating: string;
    keyFindings: string[];
    priorityRecommendations: string[];
  };
}

export class ReportStorage {
  /**
   * Store a comprehensive analysis report in database
   */
  async storeReport(
    reportData: any,
    url: string,
    reportType:
      | 'comprehensive'
      | 'phase1'
      | 'phase2'
      | 'phase3'
      | 'controlled-analysis'
      | 'enhanced-analysis' = 'comprehensive'
  ): Promise<StoredReport> {
    const timestamp = new Date().toISOString();
    const reportId = this.generateReportId(url, timestamp);

    // Create summary
    const summary = this.extractSummary(reportData);

    const storedReport: StoredReport = {
      id: reportId,
      url,
      timestamp,
      reportType,
      data: reportData,
      summary,
    };

    // Store in database
    try {
      await prisma.analysis.create({
        data: {
          id: reportId,
          content: JSON.stringify(storedReport),
          contentType: reportType,
          score: summary.overallScore,
          status: 'COMPLETED',
        },
      });

      console.log(`📄 Report stored in database: ${reportId}`);
      return storedReport;
    } catch (error) {
      console.error('Failed to store report in database:', error);
      throw error;
    }
  }

  /**
   * Retrieve a report by ID from database
   */
  async getReport(reportId: string): Promise<StoredReport | null> {
    try {
      const analysis = await prisma.analysis.findUnique({
        where: { id: reportId },
      });

      if (!analysis || !analysis.content) {
        return null;
      }

      return JSON.parse(analysis.content);
    } catch (error) {
      console.error(`Failed to retrieve report ${reportId}:`, error);
      return null;
    }
  }

  /**
   * Get all reports for a specific URL from database
   */
  async getReportsByUrl(url: string): Promise<StoredReport[]> {
    try {
      const analyses = await prisma.analysis.findMany({
        where: {
          content: {
            contains: url,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return analyses
        .filter((analysis) => analysis.content)
        .map((analysis) => JSON.parse(analysis.content!));
    } catch (error) {
      console.error('Failed to retrieve reports by URL:', error);
      return [];
    }
  }

  /**
   * Get all reports (paginated) from database
   */
  async getAllReports(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reports: StoredReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const total = await prisma.analysis.count();
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;

      const analyses = await prisma.analysis.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const reports = analyses
        .filter((analysis) => analysis.content)
        .map((analysis) => JSON.parse(analysis.content!));

      return {
        reports,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to retrieve all reports:', error);
      return { reports: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Delete a report from database
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      await prisma.analysis.delete({
        where: { id: reportId },
      });

      console.log(`🗑️ Report deleted: ${reportId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete report ${reportId}:`, error);
      return false;
    }
  }

  /**
   * Export report as PDF (to be implemented with jsPDF on client side)
   */
  async exportReportAsPDF(reportId: string): Promise<string | null> {
    try {
      const report = await this.getReport(reportId);
      if (!report) return null;

      // Return report data - client will generate PDF using jsPDF
      return reportId;
    } catch (error) {
      console.error(`Failed to export report ${reportId} as PDF:`, error);
      return null;
    }
  }

  /**
   * Get report statistics from database
   */
  async getReportStats(): Promise<{
    totalReports: number;
    reportsByType: Record<string, number>;
    reportsByUrl: Record<string, number>;
    averageScore: number;
    scoreDistribution: Record<string, number>;
  }> {
    try {
      const analyses = await prisma.analysis.findMany();

      const totalReports = analyses.length;
      const reportsByType: Record<string, number> = {};
      const reportsByUrl: Record<string, number> = {};
      const scores: number[] = [];
      const scoreDistribution: Record<string, number> = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        '0-49': 0,
      };

      analyses.forEach((analysis) => {
        // Count by type
        const type = analysis.contentType || 'comprehensive';
        reportsByType[type] = (reportsByType[type] || 0) + 1;

        // Note: URL counting removed as Analysis model doesn't have url field
        // URLs are stored within the content JSON

        // Score distribution
        const score = analysis.score || 0;
        scores.push(score);

        if (score >= 90) scoreDistribution['90-100'] += 1;
        else if (score >= 80) scoreDistribution['80-89'] += 1;
        else if (score >= 70) scoreDistribution['70-79'] += 1;
        else if (score >= 60) scoreDistribution['60-69'] += 1;
        else if (score >= 50) scoreDistribution['50-59'] += 1;
        else scoreDistribution['0-49'] += 1;
      });

      const averageScore =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      return {
        totalReports,
        reportsByType,
        reportsByUrl,
        averageScore: Math.round(averageScore * 100) / 100,
        scoreDistribution,
      };
    } catch (error) {
      console.error('Failed to get report stats:', error);
      return {
        totalReports: 0,
        reportsByType: {},
        reportsByUrl: {},
        averageScore: 0,
        scoreDistribution: {},
      };
    }
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(url: string, timestamp: string): string {
    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '');
    const date = new Date(timestamp).toISOString().split('T')[0];
    const time =
      new Date(timestamp)
        .toISOString()
        .split('T')[1]
        ?.split('.')[0]
        ?.replace(/:/g, '') || '';
    return `${domain}-${date}-${time}`;
  }

  /**
   * Extract summary from report data
   */
  private extractSummary(reportData: any): {
    overallScore: number;
    rating: string;
    keyFindings: string[];
    priorityRecommendations: string[];
  } {
    const overallScore =
      reportData.overallScore ||
      reportData.evaluationFramework?.overallScore ||
      0;
    const rating =
      reportData.rating ||
      reportData.evaluationFramework?.rating ||
      'Not Rated';

    const keyFindings: string[] = [];
    const priorityRecommendations: string[] = [];

    // Extract from evaluation framework
    if (reportData.evaluationFramework) {
      const evalFramework = reportData.evaluationFramework;
      if (evalFramework.categoryScores) {
        Object.entries(evalFramework.categoryScores).forEach(
          ([category, score]: [string, any]) => {
            if (score.score < 60) {
              keyFindings.push(
                `${category}: Low score (${score.score}/100) - Needs attention`
              );
            } else if (score.score > 80) {
              keyFindings.push(
                `${category}: Strong performance (${score.score}/100)`
              );
            }
          }
        );
      }

      if (evalFramework.priorityRecommendations) {
        priorityRecommendations.push(...evalFramework.priorityRecommendations);
      }
    }

    // Extract from comprehensive analysis
    if (reportData.comprehensiveAnalysis?.combinedRecommendations) {
      priorityRecommendations.push(
        ...reportData.comprehensiveAnalysis.combinedRecommendations
      );
    }

    return {
      overallScore,
      rating,
      keyFindings: [...new Set(keyFindings)],
      priorityRecommendations: [...new Set(priorityRecommendations)],
    };
  }
}

// Export singleton instance
export const reportStorage = new ReportStorage();
