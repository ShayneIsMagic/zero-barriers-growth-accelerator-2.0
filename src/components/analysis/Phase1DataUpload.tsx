'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Copy, FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Phase1DataUploadProps {
  onDataReceived: (data: any) => void;
  onContinue: () => void;
  initialData?: any;
}

export function Phase1DataUpload({ onDataReceived, onContinue, initialData }: Phase1DataUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'paste' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setValidationErrors(['Please enter a valid URL']);
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]);

    try {
      // Use the universal scraper to collect data
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (data.success) {
        onDataReceived(data.data);
        toast.success('Data collected successfully from URL');
      } else {
        setValidationErrors([data.error || 'Failed to collect data from URL']);
      }
    } catch (error) {
      setValidationErrors([`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
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
      // Try to parse as JSON first
      let parsedData;
      try {
        parsedData = JSON.parse(pastedData);
      } catch {
        // If not JSON, treat as raw content
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
          scrapedAt: new Date().toISOString()
        };
      }

      onDataReceived(parsedData);
      toast.success('Pasted data processed successfully');
      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([`Error processing pasted data: ${error instanceof Error ? error.message : 'Unknown error'}`]);
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
          onDataReceived(data);
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
          scrapedAt: new Date().toISOString()
        };
        onDataReceived(processedData);
        toast.success('Text file uploaded and processed successfully');
      };
      reader.readAsText(file);
    } else {
      setValidationErrors(['Unsupported file type. Please upload JSON, TXT, or HTML files.']);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Phase 1 Data Collection
          </CardTitle>
          <CardDescription>
            Choose how you want to provide content for analysis. You can collect from a new URL,
            paste previous content, or upload a saved report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Method Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Choose Data Source:</Label>
            {/* <RadioGroup value={uploadMethod} onValueChange={(value: 'url' | 'paste' | 'upload') => setUploadMethod(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Collect from New URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paste" id="paste" />
                <Label htmlFor="paste" className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Paste Previous Content
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload Saved Report
                </Label>
              </div>
            </RadioGroup> */}

            {/* Temporary replacement with select */}
            <select
              value={uploadMethod}
              onChange={(e) => setUploadMethod(e.target.value as 'url' | 'paste' | 'upload')}
              className="w-full p-2 border rounded-md"
            >
              <option value="url">Collect from New URL</option>
              <option value="paste">Paste Previous Content</option>
              <option value="upload">Upload Saved Report</option>
            </select>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* URL Collection */}
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

          {/* Paste Content */}
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
              <div className="flex gap-2">
                <Button onClick={handlePasteSubmit} disabled={!pastedData.trim()}>
                  Process Pasted Content
                </Button>
                {initialData && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(initialData, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Current Data
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* File Upload */}
          {uploadMethod === 'upload' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-input">Upload File</Label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".json,.txt,.html"
                  onChange={handleFileUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: JSON (analysis reports), TXT (plain text), HTML (web content)
                </p>
              </div>
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{uploadedFile.name}</span>
                  <Badge variant="secondary">{uploadedFile.type}</Badge>
                </div>
              )}
            </div>
          )}

          {/* Current Data Preview */}
          {initialData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Current Data Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="seo">SEO Data</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Title:</strong> {initialData.title || 'N/A'}</div>
                      <div><strong>Word Count:</strong> {initialData.wordCount || 0}</div>
                      <div><strong>Keywords:</strong> {initialData.extractedKeywords?.length || 0}</div>
                      <div><strong>Images:</strong> {initialData.images?.length || 0}</div>
                      <div><strong>Links:</strong> {(initialData.internalLinks?.length || 0) + (initialData.externalLinks?.length || 0)}</div>
                      <div><strong>Scraped:</strong> {initialData.scrapedAt ? new Date(initialData.scrapedAt).toLocaleString() : 'N/A'}</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-2">
                    <div className="max-h-40 overflow-y-auto text-sm bg-muted p-3 rounded">
                      {initialData.cleanText?.substring(0, 1000) || 'No content available'}
                      {initialData.cleanText?.length > 1000 && '...'}
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-2">
                    <div className="space-y-2 text-sm">
                      <div><strong>Meta Description:</strong> {initialData.metaDescription || 'N/A'}</div>
                      <div><strong>H1 Tags:</strong> {initialData.headings?.h1?.length || 0}</div>
                      <div><strong>H2 Tags:</strong> {initialData.headings?.h2?.length || 0}</div>
                      <div><strong>Keywords:</strong> {initialData.extractedKeywords?.slice(0, 10).join(', ') || 'N/A'}</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="raw" className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Raw JSON Data</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(initialData, null, 2))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto text-xs bg-muted p-3 rounded font-mono">
                      <pre>{JSON.stringify(initialData, null, 2)}</pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Continue Button */}
          {initialData && (
            <div className="flex justify-end pt-4">
              <Button onClick={onContinue} size="lg">
                Continue to Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
