'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiPageSelector } from '@/components/shared/MultiPageSelector';
import { PageComparisonView } from './PageComparisonView';
import { apiCall, apiCallStream } from '@/lib/api-call';
import { consumeChunkedAnalysisStream } from '@/lib/framework/consume-chunked-stream';
import { getChunkedAssessmentConfig } from '@/lib/framework/framework-assessment-config';
import {
  buildExistingContentForChunkedAnalysis,
  pickPrimaryPageUrl,
  type PuppeteerPageRecord,
} from '@/lib/framework/page-to-existing-content';
import {
  UnifiedLocalForageStorage,
  type StoredPuppeteerData,
} from '@/lib/services/unified-localforage-storage.service';
import {
  Target,
  Users,
  Building2,
  Brain,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Copy,
  FileText,
  ChevronDown,
  Globe,
  Clock,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Page {
  url: string;
  pageLabel: string;
  pageType: string;
  title?: string;
  metaDescription?: string;
  // Enhanced metadata
  metaTags?: any;
  allMetaTags?: Array<{ name: string; content: string; httpEquiv: string }>;
  keywords?: {
    metaKeywords?: string[];
    contentKeywords?: string[];
    headingKeywords?: string[];
    altTextKeywords?: string[];
    allKeywords?: string[];
  };
  analytics?: {
    googleAnalytics4?: { measurementIds?: string[] };
    googleTagManager?: { containerIds?: string[] };
    facebookPixel?: { pixelId?: string | null };
    otherAnalytics?: string[];
  };
  semanticTags?: any;
  content?: {
    text?: string;
    wordCount?: number;
  };
}

interface Assessment {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  assessmentType: string;
}

interface AssessmentProgress {
  assessmentId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  currentCategory?: string;
  result?: any;
  error?: string;
}

interface FrameworkAnalysisRunnerProps {
  url: string;
  onReportsGenerated?: (reports: any[]) => void;
  initialCollectedData?: any; // Pass collected data directly if available
}

const AVAILABLE_ASSESSMENTS: Assessment[] = [
  {
    id: 'golden-circle',
    name: 'Golden Circle',
    description: 'Analyze WHY, HOW, WHAT, and WHO messaging',
    icon: <Target className="h-4 w-4" />,
    assessmentType: 'golden-circle',
  },
  {
    id: 'b2c-elements',
    name: 'B2C Elements of Value',
    description: '30 consumer value elements analysis',
    icon: <Users className="h-4 w-4" />,
    assessmentType: 'elements-value-b2c',
  },
  {
    id: 'b2b-elements',
    name: 'B2B Elements of Value',
    description: '42 business value elements analysis',
    icon: <Building2 className="h-4 w-4" />,
    assessmentType: 'elements-value-b2b',
  },
  {
    id: 'clifton-strengths',
    name: 'CliftonStrengths',
    description: '34 themes across 4 domains',
    icon: <Brain className="h-4 w-4" />,
    assessmentType: 'clifton-strengths',
  },
  {
    id: 'seo-analysis',
    name: 'SEO & Google Tools',
    description: 'SEO, GA4, and Search Console best practices',
    icon: <Search className="h-4 w-4" />,
    assessmentType: 'google-tools',
  },
  {
    id: 'brand-archetypes',
    name: 'Brand Archetypes',
    description: '12 Jambojon brand archetypes for narrative identity',
    icon: <Sparkles className="h-4 w-4" />,
    assessmentType: 'jambojon-archetypes',
  },
];

const ARCHETYPES = [
  'The Sage',
  'The Explorer',
  'The Hero',
  'The Outlaw',
  'The Magician',
  'The Regular Guy/Girl',
  'The Jester',
  'The Caregiver',
  'The Creator',
  'The Innocent',
  'The Lover',
  'The Ruler',
];

const AUDIENCE_TYPES = [
  { value: 'b2c', label: 'B2C (Business to Consumer)' },
  { value: 'b2b', label: 'B2B (Business to Business)' },
  { value: 'both', label: 'Both B2C and B2B' },
];

export function FrameworkAnalysisRunner({
  url,
  onReportsGenerated,
  initialCollectedData,
}: FrameworkAnalysisRunnerProps) {
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [assessmentProgress, setAssessmentProgress] = useState<
    Record<string, AssessmentProgress>
  >({});
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [siteGoals, setSiteGoals] = useState<string[]>(['']);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<string>('');
  const [allCollectedContent, setAllCollectedContent] = useState<Array<{ siteUrl: string; pages: Page[]; timestamp: string; pageCount: number }>>([]);
  const [showAllContent, setShowAllContent] = useState(false);
  const [currentSiteUrl, setCurrentSiteUrl] = useState<string>(url || '');
  const [loadedSiteData, setLoadedSiteData] =
    useState<StoredPuppeteerData | null>(null);

  // Load available pages from stored data
  const loadAvailablePages = useCallback(async (providedData?: any) => {
    if (!url && !providedData) return;
    
    try {
      let puppeteerData = providedData;

      // If no data provided, try to load from storage
      if (!puppeteerData && url) {
        // Try multiple URL variations to find stored data
        const urlVariations = [
          url.trim(),
          url.trim().replace(/\/$/, ''), // Remove trailing slash
          url.trim() + '/', // Add trailing slash
        ];

        // Try to get origin for matching
        try {
          const urlObj = new URL(url.trim());
          urlVariations.push(urlObj.origin);
          urlVariations.push(urlObj.origin + '/');
        } catch {
          // Invalid URL, skip origin variations
        }

        for (const urlVar of urlVariations) {
          try {
            puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(urlVar);
            if (puppeteerData) {
              // Found collected content for URL variation
              break;
            }
          } catch {
            // Continue to next variation
          }
        }
      }

      // Handle direct data passed as prop (from ContentComparisonPage)
      if (!puppeteerData && initialCollectedData) {
        // Transform initialCollectedData to match expected format
        if (initialCollectedData.pages || initialCollectedData.comprehensive?.pages) {
          puppeteerData = {
            url: url || initialCollectedData.url,
            data: initialCollectedData.comprehensive || initialCollectedData,
            timestamp: new Date().toISOString(),
          };
        }
      }

      if (puppeteerData?.data?.pages) {
        const storedBundle: StoredPuppeteerData =
          puppeteerData.metadata && puppeteerData.data?.pages
            ? (puppeteerData as StoredPuppeteerData)
            : {
                url: puppeteerData.url || url || '',
                data: puppeteerData.data ?? puppeteerData,
                timestamp: puppeteerData.timestamp || new Date().toISOString(),
                metadata: puppeteerData.metadata || {
                  tags: {},
                  keywords: {},
                  seo: {},
                  analytics: {},
                },
              };

        setLoadedSiteData(storedBundle);

        const siteKey = storedBundle.url || url?.trim();
        if (siteKey && providedData) {
          await UnifiedLocalForageStorage.storePuppeteerData(
            siteKey,
            storedBundle.data
          );
        }

        const pages: Page[] = puppeteerData.data.pages.map((page: any) => ({
          url: page.url,
          pageLabel: page.pageLabel || 'Page',
          pageType: page.pageType || 'page',
          title: page.title,
          metaDescription: page.metaDescription,
          metaTags: page.metaTags,
          allMetaTags: page.metaTags?.allMetaTags || [],
          keywords: page.keywords,
          analytics: page.analytics,
          semanticTags: page.tags?.semanticTags,
          content: {
            text: page.content?.text || page.cleanText || '',
            wordCount: page.content?.wordCount || 0,
          },
        }));
        setAvailablePages(pages);
        if (pages.length > 0 && selectedPages.length === 0) {
          const primary = pickPrimaryPageUrl(pages, url || puppeteerData.url);
          setSelectedPages(primary ? [primary] : []);
        }
        // Update current site URL if we found data
        if (puppeteerData?.url) {
          setCurrentSiteUrl(puppeteerData.url);
        }
      } else if (puppeteerData?.data) {
        // Handle case where data structure might be different
        // Try to extract pages from different possible structures
        const data = puppeteerData.data;
        if (data.pages && Array.isArray(data.pages)) {
          const pages: Page[] = data.pages.map((page: any) => ({
            url: page.url,
            pageLabel: page.pageLabel || 'Page',
            pageType: page.pageType || 'page',
            title: page.title,
            metaDescription: page.metaDescription,
            metaTags: page.metaTags,
            allMetaTags: page.metaTags?.allMetaTags || [],
            keywords: page.keywords,
            analytics: page.analytics,
            semanticTags: page.tags?.semanticTags,
            content: {
              text: page.content?.text || page.cleanText || '',
              wordCount: page.content?.wordCount || 0,
            },
          }));
          setAvailablePages(pages);
          setLoadedSiteData(
            puppeteerData.timestamp
              ? puppeteerData
              : {
                  url: puppeteerData.url || url || '',
                  data,
                  timestamp: new Date().toISOString(),
                  metadata: {
                    tags: {},
                    keywords: {},
                    seo: {},
                    analytics: {},
                  },
                }
          );
          if (pages.length > 0 && selectedPages.length === 0) {
            const primary = pickPrimaryPageUrl(pages, url || puppeteerData.url);
            setSelectedPages(primary ? [primary] : []);
          }
          // Update current site URL
          if (puppeteerData?.url) {
            setCurrentSiteUrl(puppeteerData.url);
          }
        }
      }
    } catch (error) {
      // Failed to load pages - silently handle
    }
  }, [url, initialCollectedData, selectedPages.length]);

  // Update currentSiteUrl when url prop changes
  useEffect(() => {
    if (url) {
      setCurrentSiteUrl(url);
    }
  }, [url]);

  // Load available pages from stored data when URL changes or initial data is provided
  useEffect(() => {
    if (url || initialCollectedData) {
      loadAvailablePages(initialCollectedData);
    }
  }, [url, initialCollectedData, loadAvailablePages]);

  // Also check periodically if content becomes available (for when content is collected in another tab)
  useEffect(() => {
    if (url && availablePages.length === 0 && !initialCollectedData) {
      const interval = setInterval(async () => {
        await loadAvailablePages();
        // Stop checking once we find pages or after 10 seconds
      }, 1000);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000); // Check for 10 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [url, availablePages.length, initialCollectedData, loadAvailablePages]);

  const _handleContentSelected = async (siteUrl: string, selectedPageUrls: string[]) => {
    // Update the URL to the selected site
    // Load pages for the selected site
    try {
      const puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(siteUrl);
      if (puppeteerData?.data?.pages) {
        const pages: Page[] = puppeteerData.data.pages.map((page: any) => ({
          url: page.url,
          pageLabel: page.pageLabel || 'Page',
          pageType: page.pageType || 'page',
          title: page.title,
          metaDescription: page.metaDescription,
          metaTags: page.metaTags,
          allMetaTags: page.metaTags?.allMetaTags || [],
          keywords: page.keywords,
          analytics: page.analytics,
          semanticTags: page.tags?.semanticTags,
          content: {
            text: page.content?.text || page.cleanText || '',
            wordCount: page.content?.wordCount || 0,
          },
        }));
        setAvailablePages(pages);
        // Set selected pages to the ones chosen
        setSelectedPages(selectedPageUrls);
        // Update current site URL
        setCurrentSiteUrl(siteUrl);
      }
    } catch (error) {
      // Failed to load pages - silently handle
    }
  };

  const toggleAssessment = (assessmentId: string) => {
    setSelectedAssessments((prev) =>
      prev.includes(assessmentId)
        ? prev.filter((id) => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const _selectAllAssessments = () => {
    setSelectedAssessments(AVAILABLE_ASSESSMENTS.map((a) => a.id));
  };

  const _deselectAllAssessments = () => {
    setSelectedAssessments([]);
  };

  const addSiteGoal = () => {
    setSiteGoals([...siteGoals, '']);
  };

  const updateSiteGoal = (index: number, value: string) => {
    const updated = [...siteGoals];
    updated[index] = value;
    setSiteGoals(updated);
  };

  const removeSiteGoal = (index: number) => {
    setSiteGoals(siteGoals.filter((_, i) => i !== index));
  };

  const resolveCollectedPage = useCallback(
    async (pageUrl: string): Promise<PuppeteerPageRecord | null> => {
      let pageData: StoredPuppeteerData | null = loadedSiteData;
      let resolvedPage =
        UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
        null;

      if (!resolvedPage && currentSiteUrl) {
        pageData = await UnifiedLocalForageStorage.getPuppeteerData(currentSiteUrl);
        resolvedPage =
          UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
          null;
      }

      if (!resolvedPage && url && url !== currentSiteUrl) {
        pageData = await UnifiedLocalForageStorage.getPuppeteerData(url);
        resolvedPage =
          UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
          null;
      }

      if (!resolvedPage && pageUrl) {
        try {
          const pageOrigin = new URL(pageUrl).origin;
          pageData = await UnifiedLocalForageStorage.getPuppeteerData(pageOrigin);
          resolvedPage =
            UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
            null;
        } catch {
          // Invalid URL, continue
        }
      }

      if (!resolvedPage) {
        pageData = await UnifiedLocalForageStorage.getPage(pageUrl);
        resolvedPage =
          UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
          null;
      }

      if (!resolvedPage) {
        pageData = await UnifiedLocalForageStorage.findDataByPageUrl(pageUrl);
        resolvedPage =
          UnifiedLocalForageStorage.findPageInStoredData(pageData, pageUrl)?.page ??
          null;
      }

      if (!resolvedPage) {
        const memoryPage = availablePages.find(
          (p) =>
            p.url === pageUrl ||
            UnifiedLocalForageStorage.urlsMatch(p.url, pageUrl)
        );
        if (memoryPage?.content?.text) {
          return {
            url: memoryPage.url,
            title: memoryPage.title,
            metaDescription: memoryPage.metaDescription,
            pageLabel: memoryPage.pageLabel,
            content: {
              text: memoryPage.content.text,
              wordCount: memoryPage.content.wordCount,
            },
            analytics: memoryPage.analytics,
            keywords: {
              allKeywords: memoryPage.keywords?.allKeywords,
              extractedKeywords: memoryPage.keywords?.metaKeywords,
            },
            metaTags: memoryPage.metaTags,
            seo: {
              extractedKeywords: memoryPage.keywords?.allKeywords,
            },
          };
        }
      }

      if (!resolvedPage) {
        return null;
      }

      return {
        url: resolvedPage.url,
        title: resolvedPage.title,
        metaDescription: resolvedPage.metaDescription,
        pageLabel: resolvedPage.pageLabel,
        content: resolvedPage.content as unknown as PuppeteerPageRecord['content'],
        headings: undefined,
        keywords: resolvedPage.keywords as PuppeteerPageRecord['keywords'],
        analytics: resolvedPage.analytics as PuppeteerPageRecord['analytics'],
        seo: resolvedPage.seo as PuppeteerPageRecord['seo'],
      };
    },
    [availablePages, currentSiteUrl, loadedSiteData, url]
  );

  const runAssessments = async () => {
    if (selectedPages.length === 0) {
      toast.error('Please select at least one page to review');
      return;
    }

    if (selectedAssessments.length === 0) {
      toast.error('Please select at least one assessment to run');
      return;
    }

    setIsRunning(true);
    const activeGoals = siteGoals.filter((g) => g.trim().length > 0);

    // Initialize progress for all selected assessments
    const initialProgress: Record<string, AssessmentProgress> = {};
    selectedAssessments.forEach((assessmentId) => {
      initialProgress[assessmentId] = {
        assessmentId,
        status: 'pending',
        progress: 0,
      };
    });
    setAssessmentProgress(initialProgress);
    setReports([]);

    // Run assessments ONE AT A TIME (sequential execution)
    // First all pages for assessment 1, then all pages for assessment 2, etc.
    const newReports: any[] = [];

    // Process one assessment at a time
    for (const assessmentId of selectedAssessments) {
      const assessment = AVAILABLE_ASSESSMENTS.find((a) => a.id === assessmentId);
      if (!assessment) continue;

      // Run this assessment for all selected pages
      for (const pageUrl of selectedPages) {
        // Reuse assessment from outer loop - no need to redeclare
        if (!assessment) continue;

        try {
          // Update progress
          setAssessmentProgress((prev) => ({
            ...prev,
            [assessmentId]: {
              ...prev[assessmentId],
              status: 'running',
              progress: 10,
            },
          }));

          const page = await resolveCollectedPage(pageUrl);
          if (!page) {
            throw new Error(
              `No data found for page: ${pageUrl}. Please ensure content has been collected for this site.`
            );
          }

          const chunkedConfig = getChunkedAssessmentConfig(assessment.assessmentType);
          let report: Record<string, unknown>;

          if (chunkedConfig) {
            setAssessmentProgress((prev) => ({
              ...prev,
              [assessmentId]: {
                ...prev[assessmentId],
                progress: 20,
                currentCategory: 'Preparing chunked analysis',
              },
            }));

            const existingContent = buildExistingContentForChunkedAnalysis(
              page,
              pageUrl
            );

            const response = await apiCallStream(chunkedConfig.endpoint, {
              url: pageUrl,
              proposedContent: '',
              existingContent,
              skipCollection: true,
              stream: true,
              analysisType: 'full',
            });

            const streamResult = await consumeChunkedAnalysisStream(response, {
              onProgress: (event) => {
                const mappedProgress = Math.min(
                  95,
                  20 + Math.round(event.percent * 0.75)
                );
                setAssessmentProgress((prev) => ({
                  ...prev,
                  [assessmentId]: {
                    ...prev[assessmentId],
                    status: 'running',
                    progress: mappedProgress,
                    currentCategory:
                      event.status === 'started'
                        ? `Analyzing ${event.categoryName}`
                        : prev[assessmentId]?.currentCategory,
                  },
                }));
              },
            });

            report = {
              pageUrl,
              pageLabel: page.pageLabel || 'Page',
              assessmentId,
              assessmentName: assessment.name,
              assessmentType: assessment.assessmentType,
              analysis: streamResult.analysis,
              frameworkUsed: chunkedConfig.frameworkName,
              validation: streamResult.analysis?.verification ?? null,
              readableMarkdown: streamResult.readableMarkdown,
              traceability: streamResult.traceability,
              analysisMethod: 'chunked-blocked',
              timestamp: new Date().toISOString(),
            };
          } else {
            setAssessmentProgress((prev) => ({
              ...prev,
              [assessmentId]: {
                ...prev[assessmentId],
                progress: 30,
                currentCategory: 'Running enhanced analysis',
              },
            }));

            setAssessmentProgress((prev) => ({
              ...prev,
              [assessmentId]: {
                ...prev[assessmentId],
                progress: 50,
              },
            }));

            const { data: result } = await apiCall<{
              success: boolean;
              error?: string;
              analysis?: unknown;
              frameworkUsed?: string;
              validation?: unknown;
            }>('/api/analyze/enhanced', {
              method: 'POST',
              body: {
                _url: pageUrl,
                scrapedData: {
                  title: page.title,
                  metaDescription: page.metaDescription,
                  cleanText: page.content?.text || '',
                  headings: page.content?.headings || [],
                  analytics: page.analytics || {},
                  seo: {
                    extractedKeywords:
                      page.keywords?.extractedKeywords ||
                      page.keywords?.allKeywords ||
                      [],
                    schemaMarkup: page.seo?.schemaMarkup || {},
                  },
                },
                assessmentType: assessment.assessmentType,
                options: {
                  selectedPages: [pageUrl],
                  includeGoogleAnalytics: true,
                  includeConversionFlow: true,
                  siteGoals: activeGoals,
                  selectedArchetype:
                    selectedArchetype && selectedArchetype !== 'none'
                      ? selectedArchetype
                      : undefined,
                  selectedAudience:
                    selectedAudience && selectedAudience !== 'none'
                      ? selectedAudience
                      : undefined,
                },
              },
              showErrorToast: false,
            });

            setAssessmentProgress((prev) => ({
              ...prev,
              [assessmentId]: {
                ...prev[assessmentId],
                progress: 70,
              },
            }));

            if (!result?.success) {
              throw new Error(result?.error || 'Assessment failed');
            }

            report = {
              pageUrl,
              pageLabel: page.pageLabel || 'Page',
              assessmentId,
              assessmentName: assessment.name,
              assessmentType: assessment.assessmentType,
              analysis: result.analysis,
              frameworkUsed: result.frameworkUsed,
              validation: result.validation,
              analysisMethod: 'enhanced-monolithic',
              timestamp: new Date().toISOString(),
            };
          }

          newReports.push(report);

          await UnifiedLocalForageStorage.storeReport(
            pageUrl,
            JSON.stringify(report, null, 2),
            'json',
            chunkedConfig?.reportStorageKey ?? assessment.assessmentType
          );

          setAssessmentProgress((prev) => ({
            ...prev,
            [assessmentId]: {
              ...prev[assessmentId],
              status: 'completed',
              progress: 100,
              currentCategory: '',
              result: report,
            },
          }));
        } catch (error) {
          // Assessment failed - update progress state
          setAssessmentProgress((prev) => ({
            ...prev,
            [assessmentId]: {
              ...prev[assessmentId],
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          }));
        }
      }
    }

    setReports(newReports);
    setIsRunning(false);

    if (onReportsGenerated) {
      onReportsGenerated(newReports);
    }
  };

  const copyReport = (report: any) => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
  };

  const downloadReport = (report: any) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.assessmentName}-${report.pageLabel}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Handle quick select from all collected content
  const handleQuickSelect = async (siteUrl: string) => {
    try {
      const puppeteerData = await UnifiedLocalForageStorage.getPuppeteerData(siteUrl);
      if (puppeteerData?.data?.pages) {
        const pages: Page[] = puppeteerData.data.pages.map((page: any) => ({
          url: page.url,
          pageLabel: page.pageLabel || 'Page',
          pageType: page.pageType || 'page',
          title: page.title,
          metaDescription: page.metaDescription,
          metaTags: page.metaTags,
          allMetaTags: page.metaTags?.allMetaTags || [],
          keywords: page.keywords,
          analytics: page.analytics,
          semanticTags: page.tags?.semanticTags,
          content: {
            text: page.content?.text || page.cleanText || '',
            wordCount: page.content?.wordCount || 0,
          },
        }));
        setAvailablePages(pages);
        setLoadedSiteData(puppeteerData);
        setSelectedPages(pages.map((p) => p.url)); // Auto-select all
        setShowAllContent(false);
        // Update current site URL to match selected content
        setCurrentSiteUrl(siteUrl);
      } else {
        // No pages found in puppeteer data for this site URL
      }
    } catch (error) {
      // Show user-friendly error
      toast.error(`Failed to load content from ${siteUrl}. Please try refreshing or selecting different content.`);
    }
  };

  // Refresh all collected content
  const refreshCollectedContent = async () => {
    try {
      const allContent = await UnifiedLocalForageStorage.getAllCollectedContent();
      setAllCollectedContent(allContent);
      if (url) {
        await loadAvailablePages();
      }
    } catch (error) {
      // Failed to refresh content - silently handle
    }
  };

  // Show inline content selector if no pages loaded
  if (availablePages.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Select Content to Analyze
                </CardTitle>
                <CardDescription>
                  Choose from your collected content or collect new content from the &ldquo;Side-by-Side Comparison&rdquo; tab
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCollectedContent}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allCollectedContent.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {allCollectedContent.length} site{allCollectedContent.length !== 1 ? 's' : ''} with collected content
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllContent(!showAllContent)}
                  >
                    {showAllContent ? 'Hide' : 'Show All'}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAllContent ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allCollectedContent.map((content) => {
                    const domain = new URL(content.siteUrl).hostname.replace('www.', '');
                    return (
                      <Card
                        key={content.siteUrl}
                        className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                        onClick={() => handleQuickSelect(content.siteUrl)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base flex items-center gap-2 mb-1">
                                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="truncate">{domain}</span>
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                <FileText className="h-3 w-3" />
                                {content.pageCount} page{content.pageCount !== 1 ? 's' : ''}
                                <span className="mx-1">•</span>
                                <Clock className="h-3 w-3" />
                                {formatDate(content.timestamp)}
                              </CardDescription>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickSelect(content.siteUrl);
                            }}
                          >
                            Use This Content
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {url && (
                  <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Looking for content matching: {url}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadAvailablePages}
                      className="mt-2"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check for Matching Content
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">No content collected yet</p>
                <p className="text-sm mb-4">
                  Go to the <strong>&ldquo;Side-by-Side Comparison&rdquo;</strong> tab to collect content first
                </p>
                <div className="space-y-2 text-xs">
                  <p>1. Enter a website URL</p>
                  <p>2. Click &ldquo;Analyze Existing Content&rdquo;</p>
                  <p>3. Return here to select and analyze</p>
                </div>
                {url && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadAvailablePages}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Check for Collected Content
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Selection Section - Prominently Displayed */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Step 1: Select Content to Analyze
              </CardTitle>
              <CardDescription className="mt-1">
                {availablePages.length > 0 && (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {availablePages.length} page{availablePages.length !== 1 ? 's' : ''} loaded
                    </span>
                    {selectedPages.length > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="font-medium text-primary">
                          {selectedPages.length} selected
                        </span>
                      </>
                    )}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {allCollectedContent.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAvailablePages([]);
                    setSelectedPages([]);
                    setShowAllContent(true);
                  }}
                  title="Switch to different collected content"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Switch Content
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCollectedContent}
                title="Refresh to check for newly collected content"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {availablePages.length > 0 ? (
            <div className="space-y-4">
              {/* Quick stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {availablePages.length} total pages
                </div>
                {selectedPages.length > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {selectedPages.length} selected
                  </div>
                )}
              </div>

              <MultiPageSelector
                pages={availablePages}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
                allowMultiSelect={true}
              />
              
              {selectedPages.length > 0 && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} ready for analysis
                    </p>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Raw content for the selected page is ready. Start with one page, then add more if needed. Proceed to Step 2 to choose assessments.
                  </p>
                </div>
              )}

              {selectedPages.length === 0 && (
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Tip:</strong> Select one page to analyze first (recommended). Add more pages later to compare results across the site.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Archetype and Audience Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Archetype & Audience (Optional)</CardTitle>
          <CardDescription>
            Select a specific archetype and audience to ensure consistent targeting across all selected pages. This helps ensure comparisons use the same criteria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target Archetype</Label>
              <Select
                value={selectedArchetype || 'none'}
                onValueChange={setSelectedArchetype}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select archetype (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Auto-detect)</SelectItem>
                  {ARCHETYPES.map((archetype) => (
                    <SelectItem key={archetype} value={archetype}>
                      {archetype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ensures all pages are analyzed against the same archetype for consistent comparison
              </p>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={selectedAudience || 'none'}
                onValueChange={setSelectedAudience}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select audience (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Auto-detect)</SelectItem>
                  {AUDIENCE_TYPES.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ensures all pages target the same audience type for accurate comparison
              </p>
            </div>
          </div>
          {((selectedArchetype && selectedArchetype !== 'none') || (selectedAudience && selectedAudience !== 'none')) && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Active Filters:</strong>{' '}
                {selectedArchetype && selectedArchetype !== 'none' && `Archetype: ${selectedArchetype}`}
                {(selectedArchetype && selectedArchetype !== 'none') && (selectedAudience && selectedAudience !== 'none') && ' • '}
                {selectedAudience && selectedAudience !== 'none' && `Audience: ${AUDIENCE_TYPES.find((a) => a.value === selectedAudience)?.label}`}
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                All selected pages will be assessed using these same criteria for consistent comparison.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Site Goals (Optional)</CardTitle>
          <CardDescription>
            Define your site&apos;s primary goals to focus recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {siteGoals.map((goal, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => updateSiteGoal(index, e.target.value)}
                placeholder="e.g., Increase lead generation by 30%"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isRunning}
              />
              {siteGoals.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSiteGoal(index)}
                  disabled={isRunning}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addSiteGoal}
            disabled={isRunning}
          >
            Add Goal
          </Button>
        </CardContent>
      </Card>

      {/* Assessment Selection */}
      <Card className={selectedPages.length === 0 ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Step 2: Select Framework Assessments
            </CardTitle>
            <CardDescription>
              Choose which frameworks to evaluate your selected content. You can select multiple assessments from the dropdown.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Assessment Dropdown */}
            <div className="space-y-2">
              <Label>Select Assessments to Run</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !selectedAssessments.includes(value)) {
                    toggleAssessment(value);
                  }
                }}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an assessment to add..." />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ASSESSMENTS.map((assessment) => (
                    <SelectItem
                      key={assessment.id}
                      value={assessment.id}
                      disabled={selectedAssessments.includes(assessment.id)}
                    >
                      <div className="flex items-center gap-2">
                        {assessment.icon}
                        <div>
                          <div className="font-medium">{assessment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {assessment.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedAssessments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No assessments selected. Use the dropdown above to add assessments.
                </p>
              )}
            </div>

            {/* Selected Assessments List */}
            {selectedAssessments.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Assessments ({selectedAssessments.length})</Label>
                <div className="space-y-2">
                  {selectedAssessments.map((assessmentId) => {
                    const assessment = AVAILABLE_ASSESSMENTS.find((a) => a.id === assessmentId);
                    if (!assessment) return null;
                    const progress = assessmentProgress[assessmentId];
                    return (
                      <div
                        key={assessmentId}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {assessment.icon}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{assessment.name}</span>
                              {progress?.status === 'completed' && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Complete
                                </Badge>
                              )}
                              {progress?.status === 'error' && (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                              {progress?.status === 'running' && (
                                <Badge variant="outline">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Running
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {assessment.description}
                            </p>
                            {progress?.status === 'running' && (
                              <div className="mt-2 space-y-1">
                                <Progress value={progress.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                  {progress.progress}% complete
                                  {progress.currentCategory
                                    ? ` — ${progress.currentCategory}`
                                    : ''}
                                </p>
                              </div>
                            )}
                            {progress?.status === 'error' && progress.error && (
                              <p className="text-xs text-destructive mt-1">
                                {progress.error}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {progress?.status === 'completed' && progress.result && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // View report action - could open modal
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadReport(progress.result)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyReport(progress.result)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAssessment(assessmentId)}
                            disabled={isRunning}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Run Button */}
      <div className="flex justify-end">
        <Button
          onClick={runAssessments}
          disabled={
            isRunning ||
            selectedPages.length === 0 ||
            selectedAssessments.length === 0
          }
          size="lg"
          className="min-w-[200px]"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Assessments...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Run Selected Assessments
            </>
          )}
        </Button>
      </div>

      {/* Reports Summary and Comparison */}
      {reports.length > 0 && (
        <>
          {/* Comparison View */}
          {reports.length > 1 && (
            <PageComparisonView
              reports={reports}
              selectedArchetype={selectedArchetype}
              selectedAudience={selectedAudience}
            />
          )}

          {/* Individual Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Reports</CardTitle>
              <CardDescription>
                {reports.length} report{reports.length !== 1 ? 's' : ''} generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {report.assessmentName} - {report.pageLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyReport(report)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

