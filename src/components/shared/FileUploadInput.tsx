/**
 * Reusable File Upload Component
 * Supports JSON, Markdown, and Text files
 * Stores uploaded files in UnifiedLocalForageStorage
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedLocalForageStorage } from '@/lib/services/unified-localforage-storage.service';
import { AlertCircle, FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FileUploadInputProps {
  onFileLoaded: (content: string, fileName: string, fileType: 'json' | 'markdown' | 'text') => void;
  acceptedTypes?: string[];
  label?: string;
  description?: string;
}

export function FileUploadInput({
  onFileLoaded,
  acceptedTypes = ['.json', '.md', '.txt', '.markdown'],
  label = 'Upload File',
  description = 'Upload JSON, Markdown, or Text files for analysis',
}: FileUploadInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const fileContent = await readFileContent(file);
      const fileType = determineFileType(file.name, file.type);
      
      // Store in UnifiedLocalForageStorage (it expects a File object)
      await UnifiedLocalForageStorage.importFile(file);
      
      // Call callback with content
      onFileLoaded(fileContent, file.name, fileType);
      
      toast.success(`File "${file.name}" uploaded and stored successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to read file';
      setError(errorMessage);
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const determineFileType = (fileName: string, mimeType: string): 'json' | 'markdown' | 'text' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (extension === 'json' || mimeType === 'application/json') {
      return 'json';
    }
    if (extension === 'md' || extension === 'markdown' || mimeType.includes('markdown')) {
      return 'markdown';
    }
    return 'text';
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="flex items-center gap-2">
        <Input
          id="file-upload"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
        />
        {selectedFile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedFile && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">{selectedFile.name}</span>
          <span className="text-xs text-muted-foreground">
            ({(selectedFile.size / 1024).toFixed(1)} KB)
          </span>
          {isProcessing && (
            <span className="text-xs text-muted-foreground">Processing...</span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

