/**
 * Report Export Utilities
 * Export analysis reports as PDF or Markdown for easy sharing via email
 */


/**
 * Export analysis report as Markdown
 */
export function exportAsMarkdown(analysis: any): string {
  const date = new Date(analysis.timestamp || Date.now()).toLocaleDateString();

  const markdown = `# Website Analysis Report

**URL**: ${analysis.url}
**Date**: ${date}
**Overall Score**: ${analysis.overallScore}/10

---

## Executive Summary

${analysis.executiveSummary || 'No summary available'}

---

## Golden Circle Analysis

### WHY (Purpose & Belief) - Score: ${analysis.goldenCircle?.why?.score || 0}/10

**Current State:**
${analysis.goldenCircle?.why?.currentState || 'Not available'}

**Recommendations:**
${analysis.goldenCircle?.why?.recommendations?.map((r: string) => `- ${r}`).join('\n') || '- None'}

---

### HOW (Process & Approach) - Score: ${analysis.goldenCircle?.how?.score || 0}/10

**Current State:**
${analysis.goldenCircle?.how?.currentState || 'Not available'}

**Recommendations:**
${analysis.goldenCircle?.how?.recommendations?.map((r: string) => `- ${r}`).join('\n') || '- None'}

---

### WHAT (Products & Services) - Score: ${analysis.goldenCircle?.what?.score || 0}/10

**Current State:**
${analysis.goldenCircle?.what?.currentState || 'Not available'}

**Recommendations:**
${analysis.goldenCircle?.what?.recommendations?.map((r: string) => `- ${r}`).join('\n') || '- None'}

---

### WHO (Target Audience) - Score: ${analysis.goldenCircle?.who?.score || 0}/10

**Current State:**
${analysis.goldenCircle?.who?.currentState || 'Not available'}

**Recommendations:**
${analysis.goldenCircle?.who?.recommendations?.map((r: string) => `- ${r}`).join('\n') || '- None'}

---

## Elements of Value

**Overall Score**: ${analysis.elementsOfValue?.overallScore || 0}/10

### Key Insights:
${analysis.elementsOfValue?.insights?.map((i: string) => `- ${i}`).join('\n') || '- None'}

---

## Recommendations

### Immediate Actions (Week 1-2):
${analysis.recommendations?.immediate?.map((r: string) => `- ${r}`).join('\n') || '- None'}

### Short-Term Actions (Week 3-6):
${analysis.recommendations?.shortTerm?.map((r: string) => `- ${r}`).join('\n') || '- None'}

### Long-Term Actions (Month 2-3):
${analysis.recommendations?.longTerm?.map((r: string) => `- ${r}`).join('\n') || '- None'}

---

## Performance Metrics

${analysis.lighthouseAnalysis ? `
**Performance**: ${analysis.lighthouseAnalysis.scores?.performance || 0}/100
**Accessibility**: ${analysis.lighthouseAnalysis.scores?.accessibility || 0}/100
**Best Practices**: ${analysis.lighthouseAnalysis.scores?.bestPractices || 0}/100
**SEO**: ${analysis.lighthouseAnalysis.scores?.seo || 0}/100
` : 'Performance metrics not available'}

---

**Report Generated**: ${new Date().toLocaleString()}
**Powered by**: Zero Barriers Growth Accelerator
`;

  return markdown;
}

/**
 * Export analysis report as HTML (for PDF conversion)
 */
export function exportAsHTML(analysis: any): string {
  const date = new Date(analysis.timestamp || Date.now()).toLocaleDateString();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Analysis Report - ${analysis.url}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #0ea5e9; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; }
    h2 { color: #0284c7; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { color: #0369a1; margin-top: 20px; }
    .score { background: #0ea5e9; color: white; padding: 5px 15px; border-radius: 5px; font-weight: bold; }
    .score-excellent { background: #22c55e; }
    .score-good { background: #0ea5e9; }
    .score-fair { background: #f59e0b; }
    .score-poor { background: #ef4444; }
    .metadata { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .recommendations { background: #eff6ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
    ul { padding-left: 25px; }
    li { margin: 8px 0; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; text-align: center; }
    @media print {
      body { margin: 0; }
      h1, h2 { page-break-after: avoid; }
      .recommendations { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Website Analysis Report</h1>

  <div class="metadata">
    <p><strong>URL:</strong> ${analysis.url}</p>
    <p><strong>Analysis Date:</strong> ${date}</p>
    <p><strong>Overall Score:</strong> <span class="score score-${getScoreClass(analysis.overallScore)}">${analysis.overallScore}/10</span></p>
  </div>

  <h2>Executive Summary</h2>
  <p>${analysis.executiveSummary || 'No summary available'}</p>

  <h2>Golden Circle Analysis</h2>

  <h3>WHY (Purpose & Belief) - ${analysis.goldenCircle?.why?.score || 0}/10</h3>
  <p><strong>Current State:</strong> ${analysis.goldenCircle?.why?.currentState || 'Not available'}</p>
  <div class="recommendations">
    <strong>Recommendations:</strong>
    <ul>
      ${analysis.goldenCircle?.why?.recommendations?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
    </ul>
  </div>

  <h3>HOW (Process & Approach) - ${analysis.goldenCircle?.how?.score || 0}/10</h3>
  <p><strong>Current State:</strong> ${analysis.goldenCircle?.how?.currentState || 'Not available'}</p>
  <div class="recommendations">
    <strong>Recommendations:</strong>
    <ul>
      ${analysis.goldenCircle?.how?.recommendations?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
    </ul>
  </div>

  <h3>WHAT (Products & Services) - ${analysis.goldenCircle?.what?.score || 0}/10</h3>
  <p><strong>Current State:</strong> ${analysis.goldenCircle?.what?.currentState || 'Not available'}</p>
  <div class="recommendations">
    <strong>Recommendations:</strong>
    <ul>
      ${analysis.goldenCircle?.what?.recommendations?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
    </ul>
  </div>

  <h3>WHO (Target Audience) - ${analysis.goldenCircle?.who?.score || 0}/10</h3>
  <p><strong>Current State:</strong> ${analysis.goldenCircle?.who?.currentState || 'Not available'}</p>
  <div class="recommendations">
    <strong>Recommendations:</strong>
    <ul>
      ${analysis.goldenCircle?.who?.recommendations?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
    </ul>
  </div>

  <h2>Action Plan</h2>

  <h3>Immediate Actions (Week 1-2)</h3>
  <ul>
    ${analysis.recommendations?.immediate?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
  </ul>

  <h3>Short-Term Actions (Week 3-6)</h3>
  <ul>
    ${analysis.recommendations?.shortTerm?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
  </ul>

  <h3>Long-Term Actions (Month 2-3)</h3>
  <ul>
    ${analysis.recommendations?.longTerm?.map((r: string) => `<li>${r}</li>`).join('') || '<li>None</li>'}
  </ul>

  ${analysis.lighthouseAnalysis ? `
  <h2>Performance Metrics</h2>
  <div class="metadata">
    <p><strong>Performance:</strong> ${analysis.lighthouseAnalysis.scores?.performance || 0}/100</p>
    <p><strong>Accessibility:</strong> ${analysis.lighthouseAnalysis.scores?.accessibility || 0}/100</p>
    <p><strong>Best Practices:</strong> ${analysis.lighthouseAnalysis.scores?.bestPractices || 0}/100</p>
    <p><strong>SEO:</strong> ${analysis.lighthouseAnalysis.scores?.seo || 0}/100</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Report generated on ${new Date().toLocaleString()}</p>
    <p>Powered by <strong>Zero Barriers Growth Accelerator</strong></p>
  </div>
</body>
</html>`;
}

function getScoreClass(score: number): string {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'fair';
  return 'poor';
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export analysis as downloadable Markdown file
 */
export function downloadMarkdown(analysis: any) {
  const markdown = exportAsMarkdown(analysis);
  const filename = `analysis-${analysis.url.replace(/https?:\/\//, '').replace(/\//g, '-')}-${Date.now()}.md`;
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Export analysis as downloadable HTML file
 */
export function downloadHTML(analysis: any) {
  const html = exportAsHTML(analysis);
  const filename = `analysis-${analysis.url.replace(/https?:\/\//, '').replace(/\//g, '-')}-${Date.now()}.html`;
  downloadFile(html, filename, 'text/html');
}

/**
 * Convert HTML to PDF using browser print
 */
export function exportAsPDF(analysis: any) {
  const html = exportAsHTML(analysis);

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Window will close after print dialog is dismissed
      }, 100);
    };
  }
}

/**
 * Email report (opens email client)
 */
export function emailReport(analysis: any, recipientEmail: string = '') {
  const markdown = exportAsMarkdown(analysis);
  const subject = encodeURIComponent(`Website Analysis Report - ${analysis.url}`);
  const body = encodeURIComponent(markdown);

  // Note: Email clients have body length limits (~2000 chars)
  // For long reports, attach the file instead
  const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body.substring(0, 2000)}...`;

  window.location.href = mailtoLink;
}

/**
 * Copy report to clipboard
 */
export async function copyToClipboard(analysis: any, format: 'markdown' | 'html' = 'markdown') {
  const content = format === 'markdown' ? exportAsMarkdown(analysis) : exportAsHTML(analysis);

  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

