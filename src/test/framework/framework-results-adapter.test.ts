import { describe, expect, it } from 'vitest';
import {
  buildUrlReportLabel,
  detectFrameworkKind,
  extractAnalysisPayload,
  extractContentComparisonPayload,
  extractOverallScore,
  normalizeStoredReportContent,
  resolveFrameworkRunAnalysis,
  resolveFrameworkRunExisting,
} from '@/lib/framework/framework-results-adapter';
import type { StoredReport } from '@/lib/services/unified-localforage-storage.service';

describe('framework-results-adapter', () => {
  it('extracts analysis from runner wrapper', () => {
    const payload = {
      url: 'https://example.com',
      assessmentType: 'elements-value-b2b-standalone',
      analysis: {
        overallScore: 0.62,
        categories: {
          table_stakes: { categoryScore: 0.5, elements: {} },
        },
      },
    };

    expect(extractAnalysisPayload(payload)?.overallScore).toBe(0.62);
    expect(detectFrameworkKind('elements-value-b2b-standalone', payload.analysis as Record<string, unknown>)).toBe(
      'b2b-elements'
    );
  });

  it('detects flask flat payload as analysis root', () => {
    const flask = {
      frameworkKey: 'b2b-elements',
      overallScore: 0.45,
      categories: { individual: { subcategories: {} } },
      pyramidDiagnostics: { primaryDrillDown: null },
    };

    expect(extractAnalysisPayload(flask)?.overallScore).toBe(0.45);
    expect(detectFrameworkKind(undefined, flask)).toBe('b2b-elements');
  });

  it('normalizes legacy 0-100 scores', () => {
    expect(extractOverallScore({ overall_score: 72 })).toBe(0.72);
  });

  it('builds url-forward labels', () => {
    expect(buildUrlReportLabel('https://www.example.com/about')).toBe(
      'example.com/about'
    );
  });

  it('normalizes stored report content', () => {
    const report: StoredReport = {
      id: 'r1',
      url: 'https://example.com',
      domain: 'example.com',
      type: 'json',
      format: 'json',
      timestamp: new Date().toISOString(),
      assessmentType: 'elements-value-b2b-standalone',
      content: {
        analysis: { overallScore: 0.5, categories: {} },
      },
    };

    const normalized = normalizeStoredReportContent(report);
    expect(normalized.kind).toBe('b2b-elements');
    expect(normalized.analysis?.overallScore).toBe(0.5);
  });

  it('resolves streaming API analysis from analysis field', () => {
    const streamResult = {
      success: true,
      existing: { title: 'Home', cleanText: 'Hello' },
      analysis: { overallScore: 0.71, categories: {} },
    };

    expect(resolveFrameworkRunAnalysis(streamResult)?.overallScore).toBe(0.71);
    expect(resolveFrameworkRunExisting(streamResult)?.title).toBe('Home');
  });

  it('falls back to legacy comparison field', () => {
    const legacy = {
      comparison: { overallScore: 0.33, categories: {} },
    };

    expect(resolveFrameworkRunAnalysis(legacy)?.overallScore).toBe(0.33);
  });

  it('extracts content comparison stored reports', () => {
    const payload = extractContentComparisonPayload({
      existing: { title: 'Live', wordCount: 120 },
      comparison: { summary: 'Changed tone' },
      success: true,
    });

    expect(payload?.existing?.title).toBe('Live');
    expect(detectFrameworkKind('compare')).toBe('content-comparison');
  });
});
