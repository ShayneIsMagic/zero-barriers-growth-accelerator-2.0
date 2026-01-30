/**
 * Metadata Exporter Utility
 * Formats and exports collected metadata (titles, descriptions, tags, keywords)
 * in clean, reusable formats (JSON, Markdown, CSV)
 */

export interface MetadataExport {
  url: string;
  timestamp: string;
  pages: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    title: string;
    metaDescription: string;
    ogTitle: string;
    twitterTitle: string;
    ogDescription: string;
    twitterDescription: string;
    metaTags: Record<string, any>;
    allMetaTags: Array<{ name: string; content: string; httpEquiv: string }>;
    semanticTags: Record<string, number>;
    totalSemanticTags: number;
    metaKeywords: string[];
    contentKeywords: string[];
    headingKeywords: string[];
    altTextKeywords: string[];
    allKeywords: string[];
    keywordFrequency: Record<string, number>;
    googleAnalytics4: any;
    googleTagManager: any;
    facebookPixel: any;
    otherAnalytics: string[];
  }>;
  // Legacy format (for backward compatibility)
  titles: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    title: string;
    ogTitle: string;
    twitterTitle: string;
  }>;
  descriptions: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    metaDescription: string;
    ogDescription: string;
    twitterDescription: string;
  }>;
  metaTags: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    metaTags: Record<string, any>;
    allMetaTags: Array<{ name: string; content: string; httpEquiv: string }>;
  }>;
  htmlTags: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    semanticTags: Record<string, number>;
    totalSemanticTags: number;
  }>;
  keywords: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    metaKeywords: string[];
    contentKeywords: string[];
    headingKeywords: string[];
    altTextKeywords: string[];
    allKeywords: string[];
    keywordFrequency: Record<string, number>;
  }>;
  analytics: Array<{
    pageLabel: string;
    pageType: string;
    url: string;
    googleAnalytics4: any;
    googleTagManager: any;
    facebookPixel: any;
    otherAnalytics: string[];
  }>;
}

/**
 * Export metadata as JSON (organized by page)
 */
export function exportMetadataAsJSON(metadata: any): string {
  // Group all data by page
  const pages: MetadataExport['pages'] = [];
  const pageCount = Math.max(
    metadata.titles?.length || 0,
    metadata.descriptions?.length || 0,
    metadata.keywords?.length || 0,
    metadata.analytics?.length || 0
  );

  for (let i = 0; i < pageCount; i++) {
    const title = metadata.titles?.[i] || {};
    const desc = metadata.descriptions?.[i] || {};
    const metaTag = metadata.metaTags?.[i] || {};
    const htmlTag = metadata.htmlTags?.[i] || {};
    const keyword = metadata.keywords?.[i] || {};
    const analytic = metadata.analytics?.[i] || {};

    pages.push({
      pageLabel: title.pageLabel || desc.pageLabel || keyword.pageLabel || analytic.pageLabel || `Page ${i + 1}`,
      pageType: title.pageType || desc.pageType || keyword.pageType || analytic.pageType || 'page',
      url: title.url || desc.url || keyword.url || analytic.url || '',
      title: title.title || '',
      metaDescription: desc.metaDescription || '',
      ogTitle: title.ogTitle || '',
      twitterTitle: title.twitterTitle || '',
      ogDescription: desc.ogDescription || '',
      twitterDescription: desc.twitterDescription || '',
      metaTags: metaTag.metaTags || {},
      allMetaTags: metaTag.allMetaTags || [],
      semanticTags: htmlTag.semanticTags || {},
      totalSemanticTags: htmlTag.totalSemanticTags || 0,
      metaKeywords: keyword.metaKeywords || [],
      contentKeywords: keyword.contentKeywords || [],
      headingKeywords: keyword.headingKeywords || [],
      altTextKeywords: keyword.altTextKeywords || [],
      allKeywords: keyword.allKeywords || [],
      keywordFrequency: keyword.keywordFrequency || {},
      googleAnalytics4: analytic.googleAnalytics4 || {},
      googleTagManager: analytic.googleTagManager || {},
      facebookPixel: analytic.facebookPixel || {},
      otherAnalytics: analytic.otherAnalytics || [],
    });
  }

  const exportData: MetadataExport = {
    url: metadata.url || '',
    timestamp: new Date().toISOString(),
    pages, // New organized format
    titles: metadata.titles || [],
    descriptions: metadata.descriptions || [],
    metaTags: metadata.metaTags || [],
    htmlTags: metadata.htmlTags || [],
    keywords: metadata.keywords || [],
    analytics: metadata.analytics || [],
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export metadata as Markdown
 */
export function exportMetadataAsMarkdown(metadata: any): string {
  const lines: string[] = [];

  lines.push('# Metadata Export');
  lines.push(`**URL:** ${metadata.url || 'N/A'}`);
  lines.push(`**Timestamp:** ${new Date().toISOString()}`);
  lines.push('');

  // Use organized pages format if available
  if (metadata.pages && metadata.pages.length > 0) {
    lines.push('## Pages Metadata (Organized by Page)');
    lines.push('');
    
    metadata.pages.forEach((page: any) => {
      lines.push(`### ${page.pageLabel} (${page.pageType})`);
      lines.push(`**URL:** ${page.url}`);
      lines.push('');
      
      // SEO Titles
      lines.push('#### SEO Titles');
      lines.push(`- **Page Title:** ${page.title || 'N/A'}`);
      lines.push(`- **Open Graph Title:** ${page.ogTitle || 'N/A'}`);
      lines.push(`- **Twitter Card Title:** ${page.twitterTitle || 'N/A'}`);
      lines.push('');
      
      // Meta Descriptions
      lines.push('#### Meta Descriptions');
      lines.push(`- **Meta Description:** ${page.metaDescription || 'N/A'}`);
      lines.push(`- **OG Description:** ${page.ogDescription || 'N/A'}`);
      lines.push(`- **Twitter Description:** ${page.twitterDescription || 'N/A'}`);
      lines.push('');
      
      // Keywords
      lines.push('#### Keywords');
      lines.push(`- **All Keywords (${page.allKeywords?.length || 0}):** ${page.allKeywords?.slice(0, 20).join(', ') || 'None'}`);
      lines.push(`- **Meta Keywords:** ${page.metaKeywords?.join(', ') || 'None'}`);
      lines.push(`- **Content Keywords:** ${page.contentKeywords?.slice(0, 10).join(', ') || 'None'}`);
      lines.push('');
      
      // Analytics
      lines.push('#### Analytics & Tracking');
      lines.push(`- **GA4 IDs:** ${page.googleAnalytics4?.measurementIds?.join(', ') || 'None'}`);
      lines.push(`- **GTM IDs:** ${page.googleTagManager?.containerIds?.join(', ') || 'None'}`);
      lines.push(`- **Facebook Pixel:** ${page.facebookPixel?.pixelId || 'None'}`);
      lines.push('');
      
      // HTML Semantic Tags
      if (page.semanticTags && Object.keys(page.semanticTags).length > 0) {
        lines.push('#### HTML Semantic Tags');
        Object.entries(page.semanticTags)
          .filter(([, count]) => (count as number) > 0)
          .forEach(([tag, count]) => {
            lines.push(`- **<${tag}>:** ${count}`);
          });
        lines.push('');
      }
      
      lines.push('---');
      lines.push('');
    });
  } else {
    // Fallback to old format
    // Titles
    if (metadata.titles && metadata.titles.length > 0) {
      lines.push('## Titles');
      metadata.titles.forEach((title: any, index: number) => {
        const pageLabel = title.pageLabel || `Page ${index + 1}`;
        lines.push(`### ${pageLabel}: ${title.url}`);
        lines.push(`- **Title:** ${title.title || 'N/A'}`);
        lines.push(`- **OG Title:** ${title.ogTitle || 'N/A'}`);
        lines.push(`- **Twitter Title:** ${title.twitterTitle || 'N/A'}`);
        lines.push('');
      });
    }

    // Descriptions
    if (metadata.descriptions && metadata.descriptions.length > 0) {
      lines.push('## Meta Descriptions');
      metadata.descriptions.forEach((desc: any, index: number) => {
        const pageLabel = desc.pageLabel || `Page ${index + 1}`;
        lines.push(`### ${pageLabel}: ${desc.url}`);
        lines.push(`- **Meta Description:** ${desc.metaDescription || 'N/A'}`);
        lines.push(`- **OG Description:** ${desc.ogDescription || 'N/A'}`);
        lines.push(`- **Twitter Description:** ${desc.twitterDescription || 'N/A'}`);
        lines.push('');
      });
    }
  }

  // Keywords
  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push('## Keywords');
    metadata.keywords.forEach((kw: any, index: number) => {
      lines.push(`### Page ${index + 1}: ${kw.url}`);
      lines.push(`- **Meta Keywords:** ${kw.metaKeywords?.join(', ') || 'None'}`);
      lines.push(`- **Content Keywords:** ${kw.contentKeywords?.slice(0, 20).join(', ') || 'None'}`);
      lines.push(`- **Heading Keywords:** ${kw.headingKeywords?.slice(0, 15).join(', ') || 'None'}`);
      lines.push(`- **Alt Text Keywords:** ${kw.altTextKeywords?.slice(0, 15).join(', ') || 'None'}`);
      lines.push(`- **All Keywords:** ${kw.allKeywords?.slice(0, 30).join(', ') || 'None'}`);
      lines.push('');
    });
  }

  // Analytics
  if (metadata.analytics && metadata.analytics.length > 0) {
    lines.push('## Analytics');
    metadata.analytics.forEach((analytics: any, index: number) => {
      lines.push(`### Page ${index + 1}: ${analytics.url}`);
      if (analytics.googleAnalytics4?.measurementIds?.length > 0) {
        lines.push(`- **GA4 IDs:** ${analytics.googleAnalytics4.measurementIds.join(', ')}`);
      }
      if (analytics.googleTagManager?.containerIds?.length > 0) {
        lines.push(`- **GTM IDs:** ${analytics.googleTagManager.containerIds.join(', ')}`);
      }
      if (analytics.facebookPixel?.pixelId) {
        lines.push(`- **Facebook Pixel:** ${analytics.facebookPixel.pixelId}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Export metadata as CSV
 */
export function exportMetadataAsCSV(metadata: any): string {
  const rows: string[] = [];

  // Header
  rows.push('Page Label,Page Type,URL,Category,Field,Value');

  // Use organized pages format if available
  if (metadata.pages && metadata.pages.length > 0) {
    metadata.pages.forEach((page: any) => {
      const pageLabel = page.pageLabel || 'Page';
      const pageType = page.pageType || 'page';
      const url = page.url || '';
      
      // Titles
      if (page.title) rows.push(`${pageLabel},${pageType},${url},Titles,Page Title,"${page.title.replace(/"/g, '""')}"`);
      if (page.ogTitle) rows.push(`${pageLabel},${pageType},${url},Titles,OG Title,"${page.ogTitle.replace(/"/g, '""')}"`);
      if (page.twitterTitle) rows.push(`${pageLabel},${pageType},${url},Titles,Twitter Title,"${page.twitterTitle.replace(/"/g, '""')}"`);
      
      // Descriptions
      if (page.metaDescription) rows.push(`${pageLabel},${pageType},${url},Descriptions,Meta Description,"${page.metaDescription.replace(/"/g, '""')}"`);
      if (page.ogDescription) rows.push(`${pageLabel},${pageType},${url},Descriptions,OG Description,"${page.ogDescription.replace(/"/g, '""')}"`);
      if (page.twitterDescription) rows.push(`${pageLabel},${pageType},${url},Descriptions,Twitter Description,"${page.twitterDescription.replace(/"/g, '""')}"`);
      
      // Keywords
      if (page.allKeywords?.length > 0) {
        rows.push(`${pageLabel},${pageType},${url},Keywords,All Keywords,"${page.allKeywords.join(', ').replace(/"/g, '""')}"`);
      }
      if (page.metaKeywords?.length > 0) {
        rows.push(`${pageLabel},${pageType},${url},Keywords,Meta Keywords,"${page.metaKeywords.join(', ').replace(/"/g, '""')}"`);
      }
      
      // Analytics
      if (page.googleAnalytics4?.measurementIds?.length > 0) {
        page.googleAnalytics4.measurementIds.forEach((id: string) => {
          rows.push(`${pageLabel},${pageType},${url},Analytics,GA4 ID,"${id}"`);
        });
      }
      if (page.googleTagManager?.containerIds?.length > 0) {
        page.googleTagManager.containerIds.forEach((id: string) => {
          rows.push(`${pageLabel},${pageType},${url},Analytics,GTM ID,"${id}"`);
        });
      }
      if (page.facebookPixel?.pixelId) {
        rows.push(`${pageLabel},${pageType},${url},Analytics,Facebook Pixel,"${page.facebookPixel.pixelId}"`);
      }
      
      // Semantic Tags
      if (page.semanticTags) {
        Object.entries(page.semanticTags).forEach(([tag, count]) => {
          if ((count as number) > 0) {
            rows.push(`${pageLabel},${pageType},${url},HTML Tags,<${tag}>,"${count}"`);
          }
        });
      }
    });
  } else {
    // Fallback to old format
    // Titles
    if (metadata.titles) {
      metadata.titles.forEach((title: any) => {
        const pageLabel = title.pageLabel || 'Page';
        const pageType = title.pageType || 'page';
        if (title.title) rows.push(`${pageLabel},${pageType},${title.url},Titles,Page Title,"${title.title.replace(/"/g, '""')}"`);
        if (title.ogTitle) rows.push(`${pageLabel},${pageType},${title.url},Titles,OG Title,"${title.ogTitle.replace(/"/g, '""')}"`);
        if (title.twitterTitle) rows.push(`${pageLabel},${pageType},${title.url},Titles,Twitter Title,"${title.twitterTitle.replace(/"/g, '""')}"`);
      });
    }

    // Descriptions
    if (metadata.descriptions) {
      metadata.descriptions.forEach((desc: any) => {
        const pageLabel = desc.pageLabel || 'Page';
        const pageType = desc.pageType || 'page';
        if (desc.metaDescription) rows.push(`${pageLabel},${pageType},${desc.url},Descriptions,Meta Description,"${desc.metaDescription.replace(/"/g, '""')}"`);
        if (desc.ogDescription) rows.push(`${pageLabel},${pageType},${desc.url},Descriptions,OG Description,"${desc.ogDescription.replace(/"/g, '""')}"`);
        if (desc.twitterDescription) rows.push(`${pageLabel},${pageType},${desc.url},Descriptions,Twitter Description,"${desc.twitterDescription.replace(/"/g, '""')}"`);
      });
    }

    // Keywords
    if (metadata.keywords) {
      metadata.keywords.forEach((kw: any) => {
        const pageLabel = kw.pageLabel || 'Page';
        const pageType = kw.pageType || 'page';
        if (kw.allKeywords?.length > 0) {
          rows.push(`${pageLabel},${pageType},${kw.url},Keywords,All Keywords,"${kw.allKeywords.join(', ').replace(/"/g, '""')}"`);
        }
      });
    }

    // Analytics
    if (metadata.analytics) {
      metadata.analytics.forEach((analytics: any) => {
        const pageLabel = analytics.pageLabel || 'Page';
        const pageType = analytics.pageType || 'page';
        if (analytics.googleAnalytics4?.measurementIds?.length > 0) {
          analytics.googleAnalytics4.measurementIds.forEach((id: string) => {
            rows.push(`${pageLabel},${pageType},${analytics.url},Analytics,GA4 ID,"${id}"`);
          });
        }
        if (analytics.googleTagManager?.containerIds?.length > 0) {
          analytics.googleTagManager.containerIds.forEach((id: string) => {
            rows.push(`${pageLabel},${pageType},${analytics.url},Analytics,GTM ID,"${id}"`);
          });
        }
      });
    }
  }

  return rows.join('\n');
}

