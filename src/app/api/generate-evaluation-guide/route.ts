import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(_request: NextRequest) {
  try {
    // Read the evaluation guide markdown file
    const guidePath = path.join(process.cwd(), 'WEBSITE_EVALUATION_WORKSHEET_INTEGRATION.md');
    
    if (!fs.existsSync(guidePath)) {
      return NextResponse.json({
        success: false,
        error: 'Evaluation guide not found'
      }, { status: 404 });
    }

    const guideContent = fs.readFileSync(guidePath, 'utf-8');
    
    // Convert markdown to HTML for better formatting
    const htmlContent = convertMarkdownToHTML(guideContent);
    
    return NextResponse.json({
      success: true,
      content: guideContent,
      htmlContent: htmlContent,
      metadata: {
        title: 'Website Evaluation Worksheet Integration Guide',
        description: 'Complete guide showing how the system captures actual language and evidence matching',
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error generating evaluation guide:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate evaluation guide',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function convertMarkdownToHTML(markdown: string): string {
  // Basic markdown to HTML conversion for better formatting
  const html = markdown
    // Headers
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    .replace(/^___$/gim, '<hr>')
    .replace(/^\*\*\*$/gim, '<hr>');

  // Wrap in proper HTML structure
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Website Evaluation Worksheet Integration Guide</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
          background: #fff;
        }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 30px; }
        h3 { color: #1d4ed8; margin-top: 25px; }
        h4 { color: #2563eb; margin-top: 20px; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 8px; overflow-x: auto; border-left: 4px solid #2563eb; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        tr:nth-child(even) { background: #f9fafb; }
        .highlight { background: #fef3c7; padding: 2px 4px; border-radius: 4px; }
        .success { color: #059669; font-weight: 600; }
        .warning { color: #d97706; font-weight: 600; }
        .error { color: #dc2626; font-weight: 600; }
        hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; }
        ul, ol { padding-left: 20px; }
        li { margin: 8px 0; }
        .toc { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .metadata { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #0ea5e9; }
        @media print {
          body { max-width: none; margin: 0; padding: 15px; }
          h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
          pre, table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="metadata">
        <h3>📋 Document Information</h3>
        <p><strong>Title:</strong> Website Evaluation Worksheet Integration Guide</p>
        <p><strong>Description:</strong> Complete guide showing how the system captures actual language and evidence matching</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p><strong>Version:</strong> 1.0.0</p>
      </div>
      
      <div>${html}</div>
      
      <hr>
      <div class="metadata">
        <p><em>This document was generated by the Zero Barriers Growth Accelerator system. It provides complete transparency on how website evaluation scores are calculated with specific evidence and exact language extraction.</em></p>
      </div>
    </body>
    </html>
  `;
}
