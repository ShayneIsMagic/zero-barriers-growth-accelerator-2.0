import { NextRequest, NextResponse } from 'next/server';
import { PageAnalysisResult } from '@/lib/page-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json();

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis data is required' }, { status: 400 });
    }

    // For now, we'll return a simple text-based PDF
    // In production, you'd use a library like puppeteer or jsPDF
    const pdfContent = generatePDFContent(analysis as PageAnalysisResult);

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="analysis-${analysis.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ 
      error: 'PDF generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generatePDFContent(analysis: PageAnalysisResult): string {
  // This is a simplified PDF content generator
  // In production, you'd use a proper PDF library
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 12 Tf
50 750 Td
(Zero Barriers Growth Accelerator - Page Analysis Report) Tj
0 -20 Td
(URL: ${analysis.url}) Tj
0 -20 Td
(Page Type: ${analysis.pageType}) Tj
0 -20 Td
(Analyzed At: ${analysis.analyzedAt}) Tj
0 -40 Td
(OVERALL SCORE: ${analysis.overallScore}/100) Tj
0 -40 Td
(GOLDEN CIRCLE ANALYSIS) Tj
0 -20 Td
(Why: ${analysis.goldenCircle.why}) Tj
0 -20 Td
(How: ${analysis.goldenCircle.how}) Tj
0 -20 Td
(What: ${analysis.goldenCircle.what}) Tj
0 -20 Td
(Who: ${analysis.goldenCircle.who}) Tj
0 -20 Td
(Score: ${analysis.goldenCircle.overallScore}/100) Tj
0 -40 Td
(ELEMENTS OF VALUE SCORE: ${analysis.elementsOfValue.overallScore}/100) Tj
0 -40 Td
(CLIFTONSTRENGTHS SCORE: ${analysis.cliftonStrengths.overallScore}/100) Tj
0 -40 Td
(RECOMMENDATIONS) Tj
${analysis.recommendations.highPriority.map((rec, index) => `0 -20 Td
(HIGH PRIORITY ${index + 1}. ${rec.title}) Tj
0 -15 Td
(${rec.description}) Tj`).join('\n')}
${analysis.recommendations.mediumPriority.map((rec, index) => `0 -20 Td
(MEDIUM PRIORITY ${index + 1}. ${rec.title}) Tj
0 -15 Td
(${rec.description}) Tj`).join('\n')}
${analysis.recommendations.lowPriority.map((rec, index) => `0 -20 Td
(LOW PRIORITY ${index + 1}. ${rec.title}) Tj
0 -15 Td
(${rec.description}) Tj`).join('\n')}
0 -40 Td
(PAGE-SPECIFIC INSIGHTS) Tj
0 -20 Td
(Analysis: ${analysis.specificInsights.pageSpecificAnalysis}) Tj
0 -20 Td
(Call-to-Actions: ${analysis.specificInsights.callToActions.join(', ')}) Tj
0 -20 Td
(Trust Signals: ${analysis.specificInsights.trustSignals.join(', ')}) Tj
0 -20 Td
(Social Proof: ${analysis.specificInsights.socialProof.join(', ')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000002295 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
2353
%%EOF
  `;

  return content;
}
