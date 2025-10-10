/**
 * Supabase Markdown Service
 * Handles saving and retrieving markdown reports from Supabase
 */

import { IndividualReport } from './individual-report-generator';
import { prisma } from './prisma';

export interface MarkdownExport {
  id: string;
  analysisId: string;
  url: string;
  markdown: string;
  overallScore?: number;
  rating?: string;
  exportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Save an individual report to the database
 */
export async function saveIndividualReport(
  report: IndividualReport,
  analysisId: string
): Promise<void> {
  try {
    // Use raw SQL to save to individual_reports table
    await prisma.$executeRaw`
      INSERT INTO individual_reports (
        id,
        analysis_id,
        name,
        phase,
        prompt,
        markdown,
        score,
        timestamp
      ) VALUES (
        ${report.id},
        ${analysisId},
        ${report.name},
        ${report.phase},
        ${report.prompt},
        ${report.markdown},
        ${report.score || null},
        ${report.timestamp}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        markdown = EXCLUDED.markdown,
        score = EXCLUDED.score,
        updated_at = NOW()
    `;

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
  analysisId: string
): Promise<void> {
  console.log(`📝 Saving ${reports.length} individual reports...`);

  for (const report of reports) {
    await saveIndividualReport(report, analysisId);
  }

  console.log(`✅ All ${reports.length} reports saved successfully`);
}

/**
 * Get all reports for an analysis
 */
export async function getAnalysisReports(analysisId: string): Promise<IndividualReport[]> {
  try {
    const reports = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        name,
        phase,
        prompt,
        markdown,
        score,
        timestamp
      FROM individual_reports
      WHERE analysis_id = ${analysisId}
      ORDER BY timestamp ASC
    `;

    return reports.map(r => ({
      id: r.id,
      name: r.name,
      phase: r.phase,
      prompt: r.prompt,
      markdown: r.markdown,
      score: r.score,
      timestamp: r.timestamp
    }));
  } catch (error) {
    console.error(`❌ Error fetching reports for ${analysisId}:`, error);
    throw error;
  }
}

/**
 * Get reports by phase
 */
export async function getPhaseReports(
  analysisId: string,
  phase: string
): Promise<IndividualReport[]> {
  try {
    const reports = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        name,
        phase,
        prompt,
        markdown,
        score,
        timestamp
      FROM individual_reports
      WHERE
        analysis_id = ${analysisId}
        AND phase = ${phase}
      ORDER BY timestamp ASC
    `;

    return reports.map(r => ({
      id: r.id,
      name: r.name,
      phase: r.phase,
      prompt: r.prompt,
      markdown: r.markdown,
      score: r.score,
      timestamp: r.timestamp
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
  analysisId: string,
  url: string,
  markdown: string,
  overallScore?: number,
  rating?: string
): Promise<string> {
  try {
    const result = await prisma.$queryRaw<{ id: string }[]>`
      INSERT INTO markdown_exports (
        analysis_id,
        url,
        markdown,
        overall_score,
        rating
      ) VALUES (
        ${analysisId},
        ${url},
        ${markdown},
        ${overallScore || null},
        ${rating || null}
      )
      ON CONFLICT (analysis_id)
      DO UPDATE SET
        markdown = EXCLUDED.markdown,
        overall_score = EXCLUDED.overall_score,
        rating = EXCLUDED.rating,
        exported_at = NOW(),
        updated_at = NOW()
      RETURNING id
    `;

    const exportId = result[0]?.id || 'unknown';
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
export async function getMarkdownExport(analysisId: string): Promise<MarkdownExport | null> {
  try {
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        analysis_id,
        url,
        markdown,
        overall_score,
        rating,
        exported_at,
        created_at,
        updated_at
      FROM markdown_exports
      WHERE analysis_id = ${analysisId}
      LIMIT 1
    `;

    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    return {
      id: result.id,
      analysisId: result.analysis_id,
      url: result.url,
      markdown: result.markdown,
      overallScore: result.overall_score,
      rating: result.rating,
      exportedAt: result.exported_at,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    };
  } catch (error) {
    console.error(`❌ Error fetching markdown export:`, error);
    throw error;
  }
}

/**
 * Get complete analysis with all reports (as JSON)
 */
export async function getCompleteAnalysisMarkdown(analysisId: string): Promise<any> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT
        json_build_object(
          'analysisId', ${analysisId},
          'export', (
            SELECT row_to_json(e)
            FROM markdown_exports e
            WHERE e.analysis_id = ${analysisId}
          ),
          'individualReports', (
            SELECT json_agg(
              json_build_object(
                'id', r.id,
                'name', r.name,
                'phase', r.phase,
                'prompt', r.prompt,
                'markdown', r.markdown,
                'score', r.score,
                'timestamp', r.timestamp
              )
              ORDER BY r.timestamp ASC
            )
            FROM individual_reports r
            WHERE r.analysis_id = ${analysisId}
          )
        ) AS data
    `;

    return result[0]?.data || null;
  } catch (error) {
    console.error(`❌ Error fetching complete analysis:`, error);
    throw error;
  }
}

/**
 * Delete all reports for an analysis
 */
export async function deleteAnalysisReports(analysisId: string): Promise<void> {
  try {
    await prisma.$executeRaw`
      DELETE FROM individual_reports WHERE analysis_id = ${analysisId}
    `;

    await prisma.$executeRaw`
      DELETE FROM markdown_exports WHERE analysis_id = ${analysisId}
    `;

    console.log(`🗑️ Deleted all reports for analysis: ${analysisId}`);
  } catch (error) {
    console.error(`❌ Error deleting reports:`, error);
    throw error;
  }
}

/**
 * Get report count by phase
 */
export async function getReportStats(analysisId: string): Promise<{
  total: number;
  phase1: number;
  phase2: number;
  phase3: number;
}> {
  try {
    const result = await prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE phase = 'Phase 1') AS phase1,
        COUNT(*) FILTER (WHERE phase = 'Phase 2') AS phase2,
        COUNT(*) FILTER (WHERE phase = 'Phase 3') AS phase3
      FROM individual_reports
      WHERE analysis_id = ${analysisId}
    `;

    const stats = result[0];
    return {
      total: Number(stats.total),
      phase1: Number(stats.phase1),
      phase2: Number(stats.phase2),
      phase3: Number(stats.phase3)
    };
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
    const tables = await prisma.$queryRaw<any[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('individual_reports', 'markdown_exports')
    `;

    const tableNames = tables.map(t => t.table_name);

    return {
      individualReports: tableNames.includes('individual_reports'),
      markdownExports: tableNames.includes('markdown_exports')
    };
  } catch (error) {
    console.error(`❌ Error checking tables:`, error);
    return { individualReports: false, markdownExports: false };
  }
}

