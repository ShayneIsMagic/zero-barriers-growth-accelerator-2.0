/**
 * Report Storage and Retrieval System
 * 
 * Stores analysis reports in multiple formats:
 * 1. JSON files in reports/ directory
 * 2. Database records (optional)
 * 3. PDF exports (optional)
 */

import fs from 'fs/promises';
import path from 'path';

export interface StoredReport {
  id: string;
  url: string;
  timestamp: string;
  reportType: 'comprehensive' | 'phase1' | 'phase2' | 'phase3' | 'controlled-analysis' | 'enhanced-analysis';
  data: any;
  summary: {
    overallScore: number;
    rating: string;
    keyFindings: string[];
    priorityRecommendations: string[];
  };
  filePath: string;
}

export class ReportStorage {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDirectory();
  }

  /**
   * Store a comprehensive analysis report
   */
  async storeReport(reportData: any, url: string, reportType: 'comprehensive' | 'phase1' | 'phase2' | 'phase3' | 'controlled-analysis' | 'enhanced-analysis' = 'comprehensive'): Promise<StoredReport> {
    await this.ensureReportsDirectory();
    
    const timestamp = new Date().toISOString();
    const reportId = this.generateReportId(url, timestamp);
    
    // Create summary
    const summary = this.extractSummary(reportData);
    
    // Store JSON report
    const fileName = `${reportId}.json`;
    const filePath = path.join(this.reportsDir, fileName);
    
    const storedReport: StoredReport = {
      id: reportId,
      url,
      timestamp,
      reportType,
      data: reportData,
      summary,
      filePath
    };
    
    await fs.writeFile(filePath, JSON.stringify(storedReport, null, 2));
    
    // Store summary in index file
    await this.updateReportIndex(storedReport);
    
    console.log(`📄 Report stored: ${filePath}`);
    return storedReport;
  }

  /**
   * Retrieve a report by ID
   */
  async getReport(reportId: string): Promise<StoredReport | null> {
    try {
      const filePath = path.join(this.reportsDir, `${reportId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to retrieve report ${reportId}:`, error);
      return null;
    }
  }

  /**
   * Get all reports for a specific URL
   */
  async getReportsByUrl(url: string): Promise<StoredReport[]> {
    try {
      const indexPath = path.join(this.reportsDir, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      
      return index.reports.filter((report: StoredReport) => report.url === url);
    } catch (error) {
      console.error('Failed to retrieve reports by URL:', error);
      return [];
    }
  }

  /**
   * Get all reports (paginated)
   */
  async getAllReports(page: number = 1, limit: number = 10): Promise<{ reports: StoredReport[], total: number, page: number, totalPages: number }> {
    try {
      const indexPath = path.join(this.reportsDir, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      
      const total = index.reports.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const reports = index.reports.slice(startIndex, endIndex);
      
      return {
        reports,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Failed to retrieve all reports:', error);
      return { reports: [], total: 0, page: 1, totalPages: 0 };
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<boolean> {
    try {
      // Delete the report file
      const filePath = path.join(this.reportsDir, `${reportId}.json`);
      await fs.unlink(filePath);
      
      // Update index
      const indexPath = path.join(this.reportsDir, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      
      index.reports = index.reports.filter((report: StoredReport) => report.id !== reportId);
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
      
      console.log(`🗑️ Report deleted: ${reportId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete report ${reportId}:`, error);
      return false;
    }
  }

  /**
   * Export report as PDF (placeholder - would need PDF generation library)
   */
  async exportReportAsPDF(reportId: string): Promise<string | null> {
    try {
      const report = await this.getReport(reportId);
      if (!report) return null;
      
      // This would integrate with a PDF generation library like puppeteer or jsPDF
      // For now, return the JSON file path
      return report.filePath;
    } catch (error) {
      console.error(`Failed to export report ${reportId} as PDF:`, error);
      return null;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<{
    totalReports: number;
    reportsByType: Record<string, number>;
    reportsByUrl: Record<string, number>;
    averageScore: number;
    scoreDistribution: Record<string, number>;
  }> {
    try {
      const indexPath = path.join(this.reportsDir, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      
      const reports = index.reports;
      const totalReports = reports.length;
      
      const reportsByType: Record<string, number> = {};
      const reportsByUrl: Record<string, number> = {};
      const scores: number[] = [];
      const scoreDistribution: Record<string, number> = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '50-59': 0,
        '0-49': 0
      };
      
      reports.forEach((report: StoredReport) => {
        // Count by type
        reportsByType[report.reportType] = (reportsByType[report.reportType] || 0) + 1;
        
        // Count by URL
        reportsByUrl[report.url] = (reportsByUrl[report.url] || 0) + 1;
        
        // Score distribution
        const score = report.summary.overallScore;
        scores.push(score);
        
        if (score >= 90) scoreDistribution['90-100'] = (scoreDistribution['90-100'] || 0) + 1;
        else if (score >= 80) scoreDistribution['80-89'] = (scoreDistribution['80-89'] || 0) + 1;
        else if (score >= 70) scoreDistribution['70-79'] = (scoreDistribution['70-79'] || 0) + 1;
        else if (score >= 60) scoreDistribution['60-69'] = (scoreDistribution['60-69'] || 0) + 1;
        else if (score >= 50) scoreDistribution['50-59'] = (scoreDistribution['50-59'] || 0) + 1;
        else scoreDistribution['0-49'] = (scoreDistribution['0-49'] || 0) + 1;
      });
      
      const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      return {
        totalReports,
        reportsByType,
        reportsByUrl,
        averageScore: Math.round(averageScore * 100) / 100,
        scoreDistribution
      };
    } catch (error) {
      console.error('Failed to get report stats:', error);
      return {
        totalReports: 0,
        reportsByType: {},
        reportsByUrl: {},
        averageScore: 0,
        scoreDistribution: {}
      };
    }
  }

  /**
   * Ensure reports directory exists
   */
  private async ensureReportsDirectory(): Promise<void> {
    try {
      await fs.access(this.reportsDir);
    } catch {
      await fs.mkdir(this.reportsDir, { recursive: true });
      console.log(`📁 Created reports directory: ${this.reportsDir}`);
    }
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(url: string, timestamp: string): string {
    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '');
    const date = new Date(timestamp).toISOString().split('T')[0];
    const time = new Date(timestamp).toISOString().split('T')[1]?.split('.')[0]?.replace(/:/g, '') || '';
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
    const overallScore = reportData.overallScore || reportData.evaluationFramework?.overallScore || 0;
    const rating = reportData.rating || reportData.evaluationFramework?.rating || 'Not Rated';
    
    const keyFindings: string[] = [];
    const priorityRecommendations: string[] = [];
    
    // Extract from evaluation framework
    if (reportData.evaluationFramework) {
      const evalFramework = reportData.evaluationFramework;
      if (evalFramework.categoryScores) {
        Object.entries(evalFramework.categoryScores).forEach(([category, score]: [string, any]) => {
          if (score.score < 60) {
            keyFindings.push(`${category}: Low score (${score.score}/100) - Needs attention`);
          } else if (score.score > 80) {
            keyFindings.push(`${category}: Strong performance (${score.score}/100)`);
          }
        });
      }
      
      if (evalFramework.priorityRecommendations) {
        priorityRecommendations.push(...evalFramework.priorityRecommendations);
      }
    }
    
    // Extract from comprehensive analysis
    if (reportData.comprehensiveAnalysis?.combinedRecommendations) {
      priorityRecommendations.push(...reportData.comprehensiveAnalysis.combinedRecommendations);
    }
    
    return {
      overallScore,
      rating,
      keyFindings: [...new Set(keyFindings)],
      priorityRecommendations: [...new Set(priorityRecommendations)]
    };
  }

  /**
   * Update report index
   */
  private async updateReportIndex(report: StoredReport): Promise<void> {
    const indexPath = path.join(this.reportsDir, 'index.json');
    
    let index: { reports: StoredReport[] };
    
    try {
      const indexData = await fs.readFile(indexPath, 'utf-8');
      index = JSON.parse(indexData);
    } catch {
      index = { reports: [] };
    }
    
    // Add new report to beginning of list
    index.reports.unshift(report);
    
    // Keep only last 100 reports in index (to prevent it from getting too large)
    if (index.reports.length > 100) {
      index.reports = index.reports.slice(0, 100);
    }
    
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }
}

// Export singleton instance
export const reportStorage = new ReportStorage();
