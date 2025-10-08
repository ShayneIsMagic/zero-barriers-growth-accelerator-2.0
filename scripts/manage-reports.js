#!/usr/bin/env node

/**
 * Report Management Script
 * 
 * Usage:
 * node scripts/manage-reports.js list [--page=1] [--limit=10] [--url=example.com]
 * node scripts/manage-reports.js get <report-id>
 * node scripts/manage-reports.js stats
 * node scripts/manage-reports.js delete <report-id>
 */

const fs = require('fs').promises;
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');

async function listReports(options = {}) {
  try {
    const { page = 1, limit = 10, url } = options;
    
    const indexPath = path.join(REPORTS_DIR, 'index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);
    
    let reports = index.reports;
    
    if (url) {
      reports = reports.filter(report => report.url.includes(url));
    }
    
    const total = reports.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedReports = reports.slice(startIndex, endIndex);
    
    console.log('📊 ANALYSIS REPORTS');
    console.log('=' .repeat(50));
    console.log(`Total Reports: ${total}`);
    console.log(`Page: ${page}/${totalPages}`);
    console.log('');
    
    if (paginatedReports.length === 0) {
      console.log('No reports found.');
      return;
    }
    
    paginatedReports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.id}`);
      console.log(`   URL: ${report.url}`);
      console.log(`   Date: ${new Date(report.timestamp).toLocaleString()}`);
      console.log(`   Type: ${report.reportType}`);
      console.log(`   Score: ${report.summary.overallScore}/100 (${report.summary.rating})`);
      console.log(`   File: ${report.filePath}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Failed to list reports:', error.message);
  }
}

async function getReport(reportId) {
  try {
    const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const report = JSON.parse(data);
    
    console.log('📄 REPORT DETAILS');
    console.log('=' .repeat(50));
    console.log(`ID: ${report.id}`);
    console.log(`URL: ${report.url}`);
    console.log(`Date: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`Type: ${report.reportType}`);
    console.log(`Overall Score: ${report.summary.overallScore}/100`);
    console.log(`Rating: ${report.summary.rating}`);
    console.log('');
    
    console.log('🎯 KEY FINDINGS');
    console.log('-' .repeat(30));
    report.summary.keyFindings.forEach((finding, index) => {
      console.log(`${index + 1}. ${finding}`);
    });
    console.log('');
    
    console.log('🚀 PRIORITY RECOMMENDATIONS');
    console.log('-' .repeat(30));
    report.summary.priorityRecommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');
    
    console.log(`📁 Full Report: ${report.filePath}`);
    
  } catch (error) {
    console.error('Failed to get report:', error.message);
  }
}

async function getStats() {
  try {
    const indexPath = path.join(REPORTS_DIR, 'index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);
    
    const reports = index.reports;
    const totalReports = reports.length;
    
    const reportsByType = {};
    const reportsByUrl = {};
    const scores = [];
    const scoreDistribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '0-49': 0
    };
    
    reports.forEach(report => {
      // Count by type
      reportsByType[report.reportType] = (reportsByType[report.reportType] || 0) + 1;
      
      // Count by URL
      const domain = new URL(report.url).hostname;
      reportsByUrl[domain] = (reportsByUrl[domain] || 0) + 1;
      
      // Score distribution
      const score = report.summary.overallScore;
      scores.push(score);
      
      if (score >= 90) scoreDistribution['90-100']++;
      else if (score >= 80) scoreDistribution['80-89']++;
      else if (score >= 70) scoreDistribution['70-79']++;
      else if (score >= 60) scoreDistribution['60-69']++;
      else if (score >= 50) scoreDistribution['50-59']++;
      else scoreDistribution['0-49']++;
    });
    
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    
    console.log('📈 REPORT STATISTICS');
    console.log('=' .repeat(50));
    console.log(`Total Reports: ${totalReports}`);
    console.log(`Average Score: ${Math.round(averageScore * 100) / 100}/100`);
    console.log('');
    
    console.log('📊 Reports by Type:');
    Object.entries(reportsByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('');
    
    console.log('🌐 Reports by Domain:');
    Object.entries(reportsByUrl)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([domain, count]) => {
        console.log(`  ${domain}: ${count}`);
      });
    console.log('');
    
    console.log('📊 Score Distribution:');
    Object.entries(scoreDistribution).forEach(([range, count]) => {
      const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
      console.log(`  ${range}: ${count} (${percentage}%)`);
    });
    
  } catch (error) {
    console.error('Failed to get stats:', error.message);
  }
}

async function deleteReport(reportId) {
  try {
    const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
    await fs.unlink(filePath);
    
    // Update index
    const indexPath = path.join(REPORTS_DIR, 'index.json');
    const indexData = await fs.readFile(indexPath, 'utf-8');
    const index = JSON.parse(indexData);
    
    index.reports = index.reports.filter(report => report.id !== reportId);
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`✅ Report deleted: ${reportId}`);
    
  } catch (error) {
    console.error('Failed to delete report:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'list':
      const options = {};
      args.forEach(arg => {
        if (arg.startsWith('--page=')) {
          options.page = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--limit=')) {
          options.limit = parseInt(arg.split('=')[1]);
        } else if (arg.startsWith('--url=')) {
          options.url = arg.split('=')[1];
        }
      });
      await listReports(options);
      break;
      
    case 'get':
      if (args.length === 0) {
        console.error('Report ID is required');
        process.exit(1);
      }
      await getReport(args[0]);
      break;
      
    case 'stats':
      await getStats();
      break;
      
    case 'delete':
      if (args.length === 0) {
        console.error('Report ID is required');
        process.exit(1);
      }
      await deleteReport(args[0]);
      break;
      
    default:
      console.log('Report Management Script');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/manage-reports.js list [--page=1] [--limit=10] [--url=example.com]');
      console.log('  node scripts/manage-reports.js get <report-id>');
      console.log('  node scripts/manage-reports.js stats');
      console.log('  node scripts/manage-reports.js delete <report-id>');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/manage-reports.js list');
      console.log('  node scripts/manage-reports.js list --url=salesforceconsultants.io');
      console.log('  node scripts/manage-reports.js get salesforceconsultants-io-2024-01-15-143022');
      console.log('  node scripts/manage-reports.js stats');
      break;
  }
}

main().catch(console.error);
