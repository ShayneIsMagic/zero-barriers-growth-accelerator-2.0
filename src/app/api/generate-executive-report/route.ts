import { NextRequest, NextResponse } from 'next/server';
import { ExecutiveReportGenerator } from '@/lib/executive-report-generator';
import { analyzeWithGemini } from '@/lib/free-ai-analysis';
import { extractWithProduction } from '@/lib/production-content-extractor';
import { runLighthouseAnalysis } from '@/lib/lighthouse-service';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(_request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 });
    }

    console.log(`Generating executive report for: ${url}`);

    // Step 1: Scrape website content
    console.log('Step 1: Scraping website content...');
    const scrapedContent = await extractWithProduction(url);
    
    // Step 2: Run Lighthouse analysis
    console.log('Step 2: Running Lighthouse analysis...');
    const lighthouseData = await runLighthouseAnalysis(url);

    // Step 3: Run PageAudit analysis
    console.log('Step 3: Running PageAudit analysis...');
    const pageAuditData = await new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'scripts', 'pageaudit-analysis.js');
      const child = spawn('node', [scriptPath, url]);
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (parseError) {
            console.error('Failed to parse PageAudit output:', parseError);
            resolve({ error: 'Failed to parse PageAudit results' });
          }
        } else {
          console.error('PageAudit script failed:', errorOutput);
          resolve({ error: 'PageAudit analysis failed' });
        }
      });
    });

    // Step 4: Run AI analysis with scraped data
    console.log('Step 4: Running AI analysis...');
    const aiAnalysis = await analyzeWithGemini(scrapedContent.content, 'comprehensive');

    // Step 5: Combine all analysis data
    const comprehensiveAnalysis = {
      _url,
      timestamp: new Date().toISOString(),
      ...aiAnalysis,
      lighthouseAnalysis: lighthouseData,
      pageAuditAnalysis: pageAuditData,
      scrapedContent: {
        content: scrapedContent.content,
        title: scrapedContent.title,
        metaDescription: scrapedContent.metaDescription,
        wordCount: scrapedContent.wordCount,
        technicalInfo: scrapedContent.technicalInfo
      }
    };

    // Step 6: Generate executive report
    console.log('Step 6: Generating executive report...');
    const reportGenerator = new ExecutiveReportGenerator();
    const markdownReport = reportGenerator.generateMarkdownReport(comprehensiveAnalysis);
    const htmlReport = reportGenerator.generateHtmlReport(markdownReport);

    // Step 7: Save report to file system
    const reportId = `executive-report-${Date.now()}`;
    const reportPath = path.join(process.cwd(), 'reports', `${reportId}.md`);
    const htmlReportPath = path.join(process.cwd(), 'reports', `${reportId}.html`);

    // Ensure reports directory exists
    const fs = require('fs');
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Write markdown report
    fs.writeFileSync(reportPath, markdownReport);
    
    // Write HTML report
    fs.writeFileSync(htmlReportPath, htmlReport);

    // Step 8: Return comprehensive response
    return NextResponse.json({
      success: true,
      reportId,
      reportPath,
      htmlReportPath,
      markdownContent: markdownReport,
      htmlContent: htmlReport,
      analysis: comprehensiveAnalysis,
      metadata: {
        _url,
        generatedAt: new Date().toISOString(),
        reportId,
        frameworks: [
          'Golden Circle Analysis',
          'Elements of Value',
          'B2B Elements',
          'CliftonStrengths',
          'Lighthouse Performance',
          'PageAudit Analysis',
          'SEO Analysis'
        ],
        dataSources: [
          'Website Content Scraping',
          'Lighthouse Performance Audit',
          'PageAudit Technical Analysis',
          'Google Gemini AI Analysis',
          'Comprehensive Framework Analysis'
        ]
      }
    });

  } catch (error) {
    console.error('Failed to generate executive report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate executive report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      // List all available reports
      const fs = require('fs');
      const path = require('path');
      const reportsDir = path.join(process.cwd(), 'reports');
      
      if (!fs.existsSync(reportsDir)) {
        return NextResponse.json({
          success: true,
          reports: []
        });
      }

      const files = fs.readdirSync(reportsDir);
      const reports = files
        .filter((file: string) => file.endsWith('.md'))
        .map((file: string) => {
          const reportId = file.replace('.md', '');
          const stats = fs.statSync(path.join(reportsDir, file));
          return {
            reportId,
            filename: file,
            createdAt: stats.birthtime,
            size: stats.size
          };
        })
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return NextResponse.json({
        success: true,
        reports
      });
    }

    // Get specific report
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'reports', `${reportId}.md`);
    const htmlReportPath = path.join(process.cwd(), 'reports', `${reportId}.html`);

    if (!fs.existsSync(reportPath)) {
      return NextResponse.json({
        success: false,
        error: 'Report not found'
      }, { status: 404 });
    }

    const markdownContent = fs.readFileSync(reportPath, 'utf8');
    const htmlContent = fs.existsSync(htmlReportPath) 
      ? fs.readFileSync(htmlReportPath, 'utf8') 
      : null;

    const stats = fs.statSync(reportPath);

    return NextResponse.json({
      success: true,
      reportId,
      markdownContent,
      htmlContent,
      metadata: {
        createdAt: stats.birthtime,
        size: stats.size,
        lastModified: stats.mtime
      }
    });

  } catch (error) {
    console.error('Failed to retrieve report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
