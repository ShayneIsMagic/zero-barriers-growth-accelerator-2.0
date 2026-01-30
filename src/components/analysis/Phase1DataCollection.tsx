'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, BarChart3, Database } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Phase1DataCollectionProps {
  onDataReceived: (data: any) => void;
  onContinue: (assessmentType: string) => void;
  initialData?: any;
}

const ASSESSMENT_TYPES = {
  'content-comparison': {
    name: 'Content Comparison',
    description: 'Compare existing vs proposed content',
    keywords: [
      'compare',
      'comparison',
      'versus',
      'vs',
      'difference',
      'improvement',
    ],
    tables: ['analyses', 'content_comparisons'],
    variables: [
      'title',
      'metaDescription',
      'wordCount',
      'extractedKeywords',
      'headings',
      'cleanText',
    ],
  },
  'golden-circle': {
    name: 'Golden Circle Analysis',
    description: 'Simon Sinek Golden Circle framework',
    keywords: [
      'why',
      'how',
      'what',
      'who',
      'purpose',
      'mission',
      'vision',
      'values',
    ],
    tables: ['analyses', 'golden_circle_analyses'],
    variables: [
      'why',
      'how',
      'what',
      'who',
      'purpose',
      'mission',
      'values',
      'target_audience',
    ],
  },
  'elements-value-b2c': {
    name: 'B2C Elements of Value',
    description: 'Bain & Company B2C Elements of Value',
    keywords: [
      'functional',
      'emotional',
      'life-changing',
      'social-impact',
      'value',
      'benefit',
      'customer',
    ],
    tables: ['analyses', 'elements_of_value_b2c'],
    variables: [
      'functional_elements',
      'emotional_elements',
      'life_changing_elements',
      'social_impact_elements',
    ],
  },
  'elements-value-b2b': {
    name: 'B2B Elements of Value',
    description: 'Bain & Company B2B Elements of Value',
    keywords: [
      'functional',
      'emotional',
      'life-changing',
      'social-impact',
      'business',
      'enterprise',
      'corporate',
    ],
    tables: ['analyses', 'elements_of_value_b2b'],
    variables: [
      'functional_elements',
      'emotional_elements',
      'life_changing_elements',
      'social_impact_elements',
      'business_elements',
    ],
  },
  'clifton-strengths': {
    name: 'CliftonStrengths Analysis',
    description: 'Gallup CliftonStrengths framework',
    keywords: [
      'executing',
      'influencing',
      'relationship-building',
      'strategic-thinking',
      'strengths',
      'talents',
    ],
    tables: ['analyses', 'clifton_strengths_analyses'],
    variables: [
      'executing_strengths',
      'influencing_strengths',
      'relationship_building_strengths',
      'strategic_thinking_strengths',
    ],
  },
  comprehensive: {
    name: 'Comprehensive Analysis',
    description: 'Multi-framework comprehensive analysis',
    keywords: [
      'comprehensive',
      'complete',
      'full',
      'detailed',
      'thorough',
      'analysis',
    ],
    tables: ['analyses', 'comprehensive_analyses'],
    variables: [
      'all_frameworks',
      'golden_circle',
      'elements_of_value',
      'clifton_strengths',
      'seo_analysis',
      'performance_analysis',
    ],
  },
  'seo-analysis': {
    name: 'SEO Analysis',
    description: 'Search engine optimization analysis',
    keywords: [
      'seo',
      'search',
      'optimization',
      'ranking',
      'keywords',
      'meta',
      'title',
      'description',
    ],
    tables: ['analyses', 'seo_analyses'],
    variables: [
      'meta_tags',
      'keywords',
      'headings',
      'internal_links',
      'external_links',
      'images',
      'schema_markup',
    ],
  },
  'lighthouse-performance': {
    name: 'Lighthouse Performance',
    description: 'Core Web Vitals and performance analysis',
    keywords: [
      'performance',
      'speed',
      'lighthouse',
      'core-web-vitals',
      'loading',
      'optimization',
    ],
    tables: ['analyses', 'lighthouse_analyses'],
    variables: [
      'lcp',
      'fid',
      'cls',
      'performance_score',
      'accessibility_score',
      'best_practices_score',
      'seo_score',
    ],
  },
};

export function Phase1DataCollection({
  onDataReceived,
  onContinue,
  initialData: _initialData,
}: Phase1DataCollectionProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'paste' | 'upload'>(
    'url'
  );
  const [selectedAssessment, setSelectedAssessment] =
    useState<string>('content-comparison');
  const [url, setUrl] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [_uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [collectedData, setCollectedData] = useState<any>(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setValidationErrors(['Please enter a valid URL']);
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const processedData = processCollectedData(
          data.data,
          selectedAssessment
        );
        setCollectedData(processedData);
        onDataReceived(processedData);
        toast.success('Data collected and processed successfully');
      } else {
        setValidationErrors([data.error || 'Failed to collect data from URL']);
      }
    } catch (error) {
      setValidationErrors([
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedData.trim()) {
      setValidationErrors(['Please paste some content']);
      return;
    }

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(pastedData);
      } catch {
        parsedData = {
          cleanText: pastedData,
          title: 'Pasted Content',
          metaDescription: '',
          wordCount: pastedData.split(/\s+/).length,
          extractedKeywords: extractKeywords(pastedData),
          headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
          images: [],
          internalLinks: [],
          externalLinks: [],
          scrapedAt: new Date().toISOString(),
        };
      }

      const processedData = processCollectedData(
        parsedData,
        selectedAssessment
      );
      setCollectedData(processedData);
      onDataReceived(processedData);
      toast.success('Pasted data processed successfully');
      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([
        `Error processing pasted data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const processedData = processCollectedData(data, selectedAssessment);
          setCollectedData(processedData);
          onDataReceived(processedData);
          toast.success('JSON file uploaded and processed successfully');
        } catch (error) {
          setValidationErrors(['Invalid JSON file format']);
        }
      };
      reader.readAsText(file);
    } else if (file.type === 'text/plain' || file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const processedData = {
          cleanText: content,
          title: file.name,
          metaDescription: '',
          wordCount: content.split(/\s+/).length,
          extractedKeywords: extractKeywords(content),
          headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
          images: [],
          internalLinks: [],
          externalLinks: [],
          scrapedAt: new Date().toISOString(),
        };
        const finalData = processCollectedData(
          processedData,
          selectedAssessment
        );
        setCollectedData(finalData);
        onDataReceived(finalData);
        toast.success('Text file uploaded and processed successfully');
      };
      reader.readAsText(file);
    } else {
      setValidationErrors([
        'Unsupported file type. Please upload JSON, TXT, or HTML files.',
      ]);
    }
  };

  const processCollectedData = (rawData: any, assessmentType: string) => {
    const config =
      ASSESSMENT_TYPES[assessmentType as keyof typeof ASSESSMENT_TYPES];
    if (!config) return rawData;

    // Map collected data to assessment-specific variables
    const processedData = {
      ...rawData,
      assessmentType,
      assessmentConfig: config,
      mappedVariables: {},
      tableMapping: {},
      keywordMatches: [],
    };

    // Map variables based on assessment type
    config.variables.forEach((variable) => {
      processedData.mappedVariables[variable] = mapVariableToData(
        variable,
        rawData
      );
    });

    // Map to database tables
    config.tables.forEach((table) => {
      processedData.tableMapping[table] = mapDataToTable(
        table,
        rawData,
        assessmentType
      );
    });

    // Find keyword matches
    processedData.keywordMatches = findKeywordMatches(rawData, config.keywords);

    return processedData;
  };

  const mapVariableToData = (variable: string, data: any) => {
    switch (variable) {
      case 'title':
        return data.title || data.seo?.metaTitle || 'N/A';
      case 'metaDescription':
        return data.metaDescription || data.seo?.metaDescription || 'N/A';
      case 'wordCount':
        return data.wordCount || 0;
      case 'extractedKeywords':
        return data.extractedKeywords || data.seo?.extractedKeywords || [];
      case 'headings':
        return (
          data.headings ||
          data.seo?.headings || {
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: [],
          }
        );
      case 'cleanText':
        return data.cleanText || '';
      case 'why':
      case 'how':
      case 'what':
      case 'who':
        return extractFrameworkData(data, variable);
      case 'functional_elements':
      case 'emotional_elements':
      case 'life_changing_elements':
      case 'social_impact_elements':
        return extractElementsOfValue(data, variable);
      case 'executing_strengths':
      case 'influencing_strengths':
      case 'relationship_building_strengths':
      case 'strategic_thinking_strengths':
        return extractCliftonStrengths(data, variable);
      case 'meta_tags':
        return data.seo || {};
      case 'keywords':
        return data.seo?.extractedKeywords || [];
      case 'internal_links':
        return data.seo?.internalLinks || [];
      case 'external_links':
        return data.seo?.externalLinks || [];
      case 'images':
        return data.seo?.images || [];
      case 'lcp':
      case 'fid':
      case 'cls':
        return data.performance?.[variable] || 0;
      default:
        return data[variable] || 'N/A';
    }
  };

  const mapDataToTable = (table: string, data: any, assessmentType: string) => {
    const baseData = {
      url: data.url,
      title: data.title,
      assessment_type: assessmentType,
      created_at: new Date().toISOString(),
      raw_data: data,
    };

    switch (table) {
      case 'analyses':
        return {
          ...baseData,
          content: JSON.stringify(data),
          score: calculateOverallScore(data),
          status: 'completed',
        };
      case 'content_comparisons':
        return {
          ...baseData,
          existing_content: data.cleanText,
          word_count: data.wordCount,
          keywords: data.extractedKeywords,
        };
      case 'golden_circle_analyses':
        return {
          ...baseData,
          why_data: extractFrameworkData(data, 'why'),
          how_data: extractFrameworkData(data, 'how'),
          what_data: extractFrameworkData(data, 'what'),
          who_data: extractFrameworkData(data, 'who'),
        };
      case 'elements_of_value_b2c':
        return {
          ...baseData,
          functional_elements: extractElementsOfValue(
            data,
            'functional_elements'
          ),
          emotional_elements: extractElementsOfValue(
            data,
            'emotional_elements'
          ),
          life_changing_elements: extractElementsOfValue(
            data,
            'life_changing_elements'
          ),
          social_impact_elements: extractElementsOfValue(
            data,
            'social_impact_elements'
          ),
        };
      case 'elements_of_value_b2b':
        return {
          ...baseData,
          functional_elements: extractElementsOfValue(
            data,
            'functional_elements'
          ),
          emotional_elements: extractElementsOfValue(
            data,
            'emotional_elements'
          ),
          life_changing_elements: extractElementsOfValue(
            data,
            'life_changing_elements'
          ),
          social_impact_elements: extractElementsOfValue(
            data,
            'social_impact_elements'
          ),
          business_elements: extractElementsOfValue(data, 'business_elements'),
        };
      case 'clifton_strengths_analyses':
        return {
          ...baseData,
          executing_strengths: extractCliftonStrengths(
            data,
            'executing_strengths'
          ),
          influencing_strengths: extractCliftonStrengths(
            data,
            'influencing_strengths'
          ),
          relationship_building_strengths: extractCliftonStrengths(
            data,
            'relationship_building_strengths'
          ),
          strategic_thinking_strengths: extractCliftonStrengths(
            data,
            'strategic_thinking_strengths'
          ),
        };
      case 'seo_analyses':
        return {
          ...baseData,
          meta_tags: data.seo || {},
          keywords: data.seo?.extractedKeywords || [],
          headings: data.seo?.headings || {},
          links: {
            internal: data.seo?.internalLinks || [],
            external: data.seo?.externalLinks || [],
          },
        };
      case 'lighthouse_analyses':
        return {
          ...baseData,
          performance_metrics: data.performance || {},
          core_web_vitals: {
            lcp: data.performance?.lcp || 0,
            fid: data.performance?.fid || 0,
            cls: data.performance?.cls || 0,
          },
        };
      default:
        return baseData;
    }
  };

  const extractFrameworkData = (_data: any, _framework: string) => {
    // This would extract specific framework data from the content
    // For now, return placeholder data
    return {
      score: 0,
      evidence: [],
      recommendations: [],
    };
  };

  const extractElementsOfValue = (_data: any, _elementType: string) => {
    // This would extract specific elements of value from the content
    return [];
  };

  const extractCliftonStrengths = (_data: any, _strengthType: string) => {
    // This would extract specific CliftonStrengths from the content
    return [];
  };

  const findKeywordMatches = (data: any, keywords: string[]) => {
    const content = (data.cleanText || '').toLowerCase();
    return keywords.filter((keyword) =>
      content.includes(keyword.toLowerCase())
    );
  };

  const calculateOverallScore = (data: any) => {
    // Simple scoring based on available data
    let score = 0;
    if (data.title) score += 20;
    if (data.metaDescription) score += 20;
    if (data.wordCount > 100) score += 20;
    if (data.extractedKeywords?.length > 0) score += 20;
    if (data.headings?.h1?.length > 0) score += 20;
    return score;
  };

  const extractKeywords = (text: string): string[] => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  };

  const _copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Database className="h-6 w-6" />
            Phase 1 Data Collection & Assessment Mapping
          </CardTitle>
          <CardDescription>
            Collect content and map it to specific assessment variables and
            database tables. Choose your assessment type to see what data will
            be collected and analyzed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assessment Type Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">
              Select Assessment Type:
            </Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(ASSESSMENT_TYPES).map(([key, config]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all ${
                    selectedAssessment === key
                      ? 'bg-primary/5 ring-2 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedAssessment(key)}
                >
                  <CardContent className="p-4">
                    <div className="text-sm font-medium">{config.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {config.description}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {config.keywords.slice(0, 3).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Data Collection Method */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Choose Data Source:</Label>
            {/* <RadioGroup value={uploadMethod} onValueChange={(value: 'url' | 'paste' | 'upload') => setUploadMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Collect from URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paste" id="paste" />
                <Label htmlFor="paste" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Paste Content
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload File
                </Label>
              </div>
            </RadioGroup> */}

            {/* Temporary replacement with select */}
            <select
              value={uploadMethod}
              onChange={(e) =>
                setUploadMethod(e.target.value as 'url' | 'paste' | 'upload')
              }
              className="w-full rounded-md border p-2"
            >
              <option value="url">Collect from URL</option>
              <option value="paste">Paste Content</option>
              <option value="upload">Upload File</option>
            </select>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-inside list-disc">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Data Collection Forms */}
          {uploadMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="url-input">Website URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <Button
                onClick={handleUrlSubmit}
                disabled={isProcessing || !url.trim()}
                className="w-full"
              >
                {isProcessing ? 'Collecting Data...' : 'Collect Data from URL'}
              </Button>
            </div>
          )}

          {uploadMethod === 'paste' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="paste-input">Paste Content or JSON Data</Label>
                <Textarea
                  id="paste-input"
                  placeholder="Paste your content here, or paste a complete JSON report from a previous analysis..."
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handlePasteSubmit} disabled={!pastedData.trim()}>
                Process Pasted Content
              </Button>
            </div>
          )}

          {uploadMethod === 'upload' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-input">Upload File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".json,.txt,.html"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
                />
              </div>
            </div>
          )}

          {/* Side-by-Side Data Collection and Assessment View */}
          {collectedData && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Left Side: Collected Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-blue-500" />
                    Collected Data
                  </CardTitle>
                  <CardDescription>
                    Raw data collected from {collectedData.url || 'source'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="seo">SEO Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">Title</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {collectedData.title || 'N/A'}
                          </div>
                        </div>
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">Word Count</div>
                          <div className="text-xs text-muted-foreground">
                            {collectedData.wordCount || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">Keywords</div>
                          <div className="text-xs text-muted-foreground">
                            {collectedData.extractedKeywords?.length || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">Images</div>
                          <div className="text-xs text-muted-foreground">
                            {collectedData.seo?.images?.length || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">Internal Links</div>
                          <div className="text-xs text-muted-foreground">
                            {collectedData.seo?.internalLinks?.length || 0}
                          </div>
                        </div>
                        <div className="rounded bg-muted p-2">
                          <div className="font-medium">External Links</div>
                          <div className="text-xs text-muted-foreground">
                            {collectedData.seo?.externalLinks?.length || 0}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-3">
                      <div className="max-h-40 overflow-y-auto rounded bg-muted p-3 text-sm">
                        {collectedData.cleanText?.substring(0, 1000) ||
                          'No content available'}
                        {collectedData.cleanText?.length > 1000 && '...'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {collectedData.wordCount || 0} words total
                      </div>
                    </TabsContent>

                    <TabsContent value="seo" className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Meta Description:</strong>{' '}
                          {collectedData.seo?.metaDescription || 'N/A'}
                        </div>
                        <div>
                          <strong>H1 Tags:</strong>{' '}
                          {collectedData.seo?.headings?.h1?.length || 0}
                        </div>
                        <div>
                          <strong>H2 Tags:</strong>{' '}
                          {collectedData.seo?.headings?.h2?.length || 0}
                        </div>
                        <div>
                          <strong>H3 Tags:</strong>{' '}
                          {collectedData.seo?.headings?.h3?.length || 0}
                        </div>
                        <div>
                          <strong>Schema Types:</strong>{' '}
                          {collectedData.structuredData?.schemaTypes?.join(
                            ', '
                          ) || 'None'}
                        </div>
                        <div>
                          <strong>Load Time:</strong>{' '}
                          {collectedData.performance?.loadTime || 0}ms
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Right Side: Assessment Mapping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Assessment Mapping
                  </CardTitle>
                  <CardDescription>
                    {
                      ASSESSMENT_TYPES[
                        selectedAssessment as keyof typeof ASSESSMENT_TYPES
                      ].name
                    }{' '}
                    - Variables & Tables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="variables" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="variables">Variables</TabsTrigger>
                      <TabsTrigger value="tables">Tables</TabsTrigger>
                      <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    </TabsList>

                    <TabsContent value="variables" className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Required Variables
                        </h4>
                        <div className="space-y-2">
                          {ASSESSMENT_TYPES[
                            selectedAssessment as keyof typeof ASSESSMENT_TYPES
                          ].variables.map((variable) => {
                            const value =
                              collectedData.mappedVariables?.[variable];
                            const hasValue =
                              value &&
                              value !== 'N/A' &&
                              value !== '' &&
                              (Array.isArray(value) ? value.length > 0 : true);

                            return (
                              <div
                                key={variable}
                                className={`rounded border-l-4 p-2 ${
                                  hasValue
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {variable}
                                  </span>
                                  <Badge
                                    variant={
                                      hasValue ? 'default' : 'destructive'
                                    }
                                  >
                                    {hasValue ? 'Found' : 'Missing'}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {hasValue
                                    ? typeof value === 'object'
                                      ? `${Array.isArray(value) ? value.length : Object.keys(value).length} items`
                                      : String(value).substring(0, 50) +
                                        (String(value).length > 50 ? '...' : '')
                                    : 'No data available'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tables" className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Database Tables
                        </h4>
                        <div className="space-y-2">
                          {ASSESSMENT_TYPES[
                            selectedAssessment as keyof typeof ASSESSMENT_TYPES
                          ].tables.map((table) => {
                            const tableData =
                              collectedData.tableMapping?.[table];
                            const fieldCount = tableData
                              ? Object.keys(tableData).length
                              : 0;

                            return (
                              <div
                                key={table}
                                className="rounded-lg border p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {table}
                                  </span>
                                  <Badge variant="secondary">
                                    {fieldCount} fields
                                  </Badge>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {fieldCount > 0
                                    ? 'Ready for database insertion'
                                    : 'No data mapped'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="keywords" className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Keyword Analysis
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="mb-2 text-sm font-medium">
                              Matched Keywords
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {collectedData.keywordMatches?.map(
                                (keyword: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="default"
                                    className="text-xs"
                                  >
                                    {keyword}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Matches Found:</span>
                              <span className="font-medium">
                                {collectedData.keywordMatches?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Expected Keywords:</span>
                              <span className="font-medium">
                                {
                                  ASSESSMENT_TYPES[
                                    selectedAssessment as keyof typeof ASSESSMENT_TYPES
                                  ].keywords.length
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Match Rate:</span>
                              <span className="font-medium">
                                {Math.round(
                                  ((collectedData.keywordMatches?.length || 0) /
                                    ASSESSMENT_TYPES[
                                      selectedAssessment as keyof typeof ASSESSMENT_TYPES
                                    ].keywords.length) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Continue Button */}
          {collectedData && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => onContinue(selectedAssessment)}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Continue to{' '}
                {
                  ASSESSMENT_TYPES[
                    selectedAssessment as keyof typeof ASSESSMENT_TYPES
                  ].name
                }{' '}
                Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
