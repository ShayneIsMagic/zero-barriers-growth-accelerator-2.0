/**
 * Supabase Markdown Service
 * Handles saving and retrieving markdown reports from Supabase
 */

import { IndividualReport } from './individual-report-generator';
import { prisma } from './prisma';

export interface MarkdownExport {
  id: string;
  analysis_id: string;
  url: string;
  markdown: string;
  overallScore?: number;
  rating?: string;
  exported_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save an individual report to the database
 */
export async function saveIndividualReport(
  report: IndividualReport,
  analysis_id: string
): Promise<void> {
  try {
    // Use proper Prisma client method to save to individual_reports table
    await prisma.individual_reports.upsert({
      where: { id: report.id },
      update: {
        markdown: report.markdown,
        score: report.score || null,
        updatedAt: new Date()
      },
      create: {
        id: report.id,
        analysis_id: analysis_id,
        name: report.name,
        phase: report.phase,
        prompt: report.prompt,
        markdown: report.markdown,
        score: report.score || null,
        timestamp: report.timestamp
      }
    });

    console.log(`✅ Saved individual report: ${report.id} (${report.name})`);
  } catch (error) {
    console.error(`❌ Error saving report ${report.id}:`, error);
    throw error;
  }
}

/**
 * Save multiple individual reports at once
 */
export async function saveIndividualReports(
  reports: IndividualReport[],
  analysis_id: string
): Promise<void> {
  console.log(`📝 Saving ${reports.length} individual reports...`);

  for (const report of reports) {
    await saveIndividualReport(report, analysis_id);
  }

  console.log(`✅ All ${reports.length} reports saved successfully`);
}

/**
 * Get all reports for an analysis
 */
export async function getAnalysisReports(analysis_id: string): Promise<IndividualReport[]> {
  try {
    const reports = await prisma.individual_reports.findMany({
      where: { analysis_id: analysis_id },
      orderBy: { timestamp: 'asc' }
    });

    return reports.map(r => ({
      id: r.id,
      name: r.name,
      phase: r.phase,
      prompt: r.prompt,
      markdown: r.markdown,
      score: r.score,
      timestamp: r.timestamp.toISOString()
    }));
  } catch (error) {
    console.error(`❌ Error fetching reports for ${analysis_id}:`, error);
    throw error;
  }
}

/**
 * Get reports by phase
 */
export async function getPhaseReports(
  analysis_id: string,
  phase: string
): Promise<IndividualReport[]> {
  try {
    const reports = await prisma.individual_reports.findMany({
      where: {
        analysis_id: analysis_id,
        phase: phase
      },
      orderBy: { timestamp: 'asc' }
    });

    return reports.map(r => ({
      id: r.id,
      name: r.name,
      phase: r.phase,
      prompt: r.prompt,
      markdown: r.markdown,
      score: r.score,
      timestamp: r.timestamp.toISOString()
    }));
  } catch (error) {
    console.error(`❌ Error fetching ${phase} reports:`, error);
    throw error;
  }
}

/**
 * Save combined markdown export
 */
export async function saveMarkdownExport(
  analysis_id: string,
  url: string,
  markdown: string,
  overallScore?: number,
  rating?: string
): Promise<string> {
  try {
    const result = await prisma.markdown_exports.upsert({
      where: { analysis_id: analysis_id },
      update: {
        markdown: markdown,
        overall_score: overallScore || null,
        rating: rating || null,
        exported_at: new Date(),
        updatedAt: new Date()
      },
      create: {
        analysis_id: analysis_id,
        url: _url,
        markdown: markdown,
        overall_score: overallScore || null,
        rating: rating || null
      }
    });

    const exportId = result.id;
    console.log(`✅ Saved markdown export: ${exportId}`);
    return exportId;
  } catch (error) {
    console.error(`❌ Error saving markdown export:`, error);
    throw error;
  }
}

/**
 * Get markdown export for an analysis
 */
export async function getMarkdownExport(analysis_id: string): Promise<MarkdownExport | null> {
  try {
    const result = await prisma.markdown_exports.findFirst({
      where: { analysis_id: analysis_id }
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      analysis_id: result.analysis_id,
      url: result.url,
      markdown: result.markdown,
      overallScore: result.overall_score,
      rating: result.rating,
      exported_at: result.exported_at,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt
    };
  } catch (error) {
    console.error(`❌ Error fetching markdown export:`, error);
    throw error;
  }
}

/**
 * Get complete analysis with all reports (as JSON)
 */
export async function getCompleteAnalysisMarkdown(analysis_id: string): Promise<any> {
  try {
    const [exportData, reports] = await Promise.all([
      prisma.markdown_exports.findFirst({
        where: { analysis_id: analysis_id }
      }),
      prisma.individual_reports.findMany({
        where: { analysis_id: analysis_id },
        orderBy: { timestamp: 'asc' }
      })
    ]);

    return {
      analysis_id,
      export: exportData ? {
        id: exportData.id,
        analysis_id: exportData.analysis_id,
        url: exportData.url,
        markdown: exportData.markdown,
        overall_score: exportData.overall_score,
        rating: exportData.rating,
        exported_at: exportData.exported_at,
        createdAt: exportData.createdAt,
        updatedAt: exportData.updatedAt
      } : null,
      individualReports: reports.map(r => ({
        id: r.id,
        name: r.name,
        phase: r.phase,
        prompt: r.prompt,
        markdown: r.markdown,
        score: r.score,
        timestamp: r.timestamp.toISOString()
      }))
    };
  } catch (error) {
    console.error(`❌ Error fetching complete analysis:`, error);
    throw error;
  }
}

/**
 * Delete all reports for an analysis
 */
export async function deleteAnalysisReports(analysis_id: string): Promise<void> {
  try {
    await Promise.all([
      prisma.individual_reports.deleteMany({
        where: { analysis_id: analysis_id }
      }),
      prisma.markdown_exports.deleteMany({
        where: { analysis_id: analysis_id }
      })
    ]);

    console.log(`🗑️ Deleted all reports for analysis: ${analysis_id}`);
  } catch (error) {
    console.error(`❌ Error deleting reports:`, error);
    throw error;
  }
}

/**
 * Get report count by phase
 */
export async function getReportStats(analysis_id: string): Promise<{
  total: number;
  phase1: number;
  phase2: number;
  phase3: number;
}> {
  try {
    const [total, phase1, phase2, phase3] = await Promise.all([
      prisma.individual_reports.count({
        where: { analysis_id: analysis_id }
      }),
      prisma.individual_reports.count({
        where: { analysis_id: analysis_id, phase: 'Phase 1' }
      }),
      prisma.individual_reports.count({
        where: { analysis_id: analysis_id, phase: 'Phase 2' }
      }),
      prisma.individual_reports.count({
        where: { analysis_id: analysis_id, phase: 'Phase 3' }
      })
    ]);

    return { total, phase1, phase2, phase3 };
  } catch (error) {
    console.error(`❌ Error fetching report stats:`, error);
    return { total: 0, phase1: 0, phase2: 0, phase3: 0 };
  }
}

/**
 * Check if tables exist
 */
export async function checkMarkdownTablesExist(): Promise<{
  individualReports: boolean;
  markdownExports: boolean;
}> {
  try {
    // Check if tables exist by trying to query them
    const [individualReports, markdownExports] = await Promise.allSettled([
      prisma.individual_reports.findFirst(),
      prisma.markdown_exports.findFirst()
    ]);

    return {
      individualReports: individualReports.status === 'fulfilled',
      markdownExports: markdownExports.status === 'fulfilled'
    };
  } catch (error) {
    console.error(`❌ Error checking tables:`, error);
    return { individualReports: false, markdownExports: false };
  }
}

