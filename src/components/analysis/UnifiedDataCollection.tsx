'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Badge imported but not currently used
// import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

interface UnifiedDataCollectionProps {
  onDataCollected: (data: CollectedData) => void;
  initialData?: CollectedData | null;
  showDataPreview?: boolean;
}

interface CollectedData {
  url: string;
  title: string;
  metaDescription: string;
  cleanText: string;
  headings: string[];
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; text: string }>;
  metadata: {
    viewport: string;
    robots: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
  };
  technical: {
    language: string;
    charset: string;
    doctype: string;
    lastModified: string;
    contentLength: number;
  };
  scrapedAt: string;
}

export function UnifiedDataCollection({
  onDataCollected,
  initialData = null,
  showDataPreview = true,
}: UnifiedDataCollectionProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'paste' | 'upload'>(
    'url'
  );
  const [url, setUrl] = useState(initialData?.url || '');
  const [pastedData, setPastedData] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [collectedData, setCollectedData] = useState<CollectedData | null>(
    initialData
  );

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
        const scrapedData = data.scrapedData || data.data;
        const processedData: CollectedData = {
          url: url.trim(),
          title: scrapedData.title || 'Untitled',
          metaDescription: scrapedData.metaDescription || '',
          cleanText: scrapedData.cleanText || scrapedData.content || '',
          headings: scrapedData.headings || [],
          images: scrapedData.images || [],
          links: scrapedData.links || [],
          metadata: scrapedData.metadata || {
            viewport: '',
            robots: '',
            canonical: '',
            ogTitle: '',
            ogDescription: '',
            ogImage: '',
            twitterCard: '',
            twitterTitle: '',
            twitterDescription: '',
            twitterImage: '',
          },
          technical: scrapedData.technical || {
            language: '',
            charset: '',
            doctype: '',
            lastModified: '',
            contentLength: 0,
          },
          scrapedAt: new Date().toISOString(),
        };

        setCollectedData(processedData);
        onDataCollected(processedData);
        toast.success('Data collected successfully from URL');
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
      setValidationErrors(['Please paste some content to analyze']);
      return;
    }

    const processedData: CollectedData = {
      url: 'Pasted Content',
      title: 'Pasted Content',
      metaDescription: '',
      cleanText: pastedData.trim(),
      headings: [],
      images: [],
      links: [],
      metadata: {
        viewport: '',
        robots: '',
        canonical: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        twitterCard: '',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
      },
      technical: {
        language: '',
        charset: '',
        doctype: '',
        lastModified: '',
        contentLength: pastedData.length,
      },
      scrapedAt: new Date().toISOString(),
    };

    setCollectedData(processedData);
    onDataCollected(processedData);
    toast.success('Pasted content processed successfully');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPastedData(content);
    };
    reader.readAsText(file);
  };

  const handleCopyData = () => {
    if (collectedData) {
      navigator.clipboard.writeText(JSON.stringify(collectedData, null, 2));
      toast.success('Data copied to clipboard');
    }
  };

  const handleDownloadData = () => {
    if (collectedData) {
      const blob = new Blob([JSON.stringify(collectedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `collected-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data downloaded');
    }
  };

  const clearData = () => {
    setCollectedData(null);
    setUrl('');
    setPastedData('');
    setUploadedFile(null);
    setValidationErrors([]);
    onDataCollected(null as any);
  };

  return (
    <div className="space-y-6">
      {/* Data Collection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Data Collection
          </CardTitle>
          <CardDescription>
            Collect website data through URL scraping, paste content, or file
            upload
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={uploadMethod}
            onValueChange={(value) => setUploadMethod(value as any)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL Scraping
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Paste Content
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={isProcessing || !url.trim()}
                    className="min-w-[120px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      'Scrape Data'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pastedData">Paste Content</Label>
                <Textarea
                  id="pastedData"
                  placeholder="Paste your content here..."
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  rows={8}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handlePasteSubmit}
                  disabled={isProcessing || !pastedData.trim()}
                  className="w-full"
                >
                  Process Content
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".txt,.html,.json"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                {uploadedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)}{' '}
                    KB)
                  </div>
                )}
                <Button
                  onClick={handlePasteSubmit}
                  disabled={isProcessing || !pastedData.trim()}
                  className="w-full"
                >
                  Process File
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {validationErrors.length > 0 && (
            <Alert className="mt-4">
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
        </CardContent>
      </Card>

      {/* Data Preview Section */}
      {showDataPreview && collectedData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Collected Data
                </CardTitle>
                <CardDescription>
                  Data ready for analysis - {collectedData.cleanText.length}{' '}
                  characters
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyData}>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadData}
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={clearData}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">URL:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.url}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Title:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.title}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Content Length:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.cleanText.length} characters
                  </span>
                </div>
                <div>
                  <span className="font-medium">Headings:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.headings.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Images:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.images.length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Links:</span>
                  <span className="ml-2 text-gray-600">
                    {collectedData.links.length}
                  </span>
                </div>
              </div>

              {collectedData.metaDescription && (
                <div>
                  <span className="text-sm font-medium">Meta Description:</span>
                  <p className="mt-1 text-sm text-gray-600">
                    {collectedData.metaDescription}
                  </p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium">Content Preview:</span>
                <div className="mt-1 max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3">
                  <p className="text-sm text-gray-700">
                    {collectedData.cleanText.substring(0, 500)}
                    {collectedData.cleanText.length > 500 && '...'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
