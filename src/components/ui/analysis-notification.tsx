'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, RefreshCw, Settings } from 'lucide-react';

interface AnalysisNotificationProps {
  type: 'error' | 'success' | 'info';
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function AnalysisNotification({ 
  type, 
  title, 
  message, 
  details, 
  action, 
  onDismiss 
}: AnalysisNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCardClass = () => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getTextClass = () => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <Card className={`border-2 ${getCardClass()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className={`font-semibold ${getTextClass()}`}>{title}</h4>
            <p className={`text-sm ${getTextClass()} opacity-80 mt-1`}>{message}</p>
            {details && (
              <p className={`text-xs ${getTextClass()} opacity-60 mt-2`}>{details}</p>
            )}
            {action && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant={type === 'error' ? 'destructive' : 'default'}
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SiteIdentificationProps {
  url: string;
  isAnalyzing?: boolean;
}

export function SiteIdentification({ url, isAnalyzing = false }: SiteIdentificationProps) {
  const [siteInfo, setSiteInfo] = useState<{
    title: string;
    favicon: string;
    domain: string;
  } | null>(null);

  useEffect(() => {
    if (url) {
      try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        setSiteInfo({
          title: domain.replace('www.', ''),
          favicon: `https://www.google.com/s2/favicons?domain=${domain}`,
          domain: domain
        });
      } catch (error) {
        setSiteInfo({
          title: url,
          favicon: '',
          domain: url
        });
      }
    }
  }, [url]);

  if (!siteInfo) return null;

  return (
    <Card className="border-2 border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {siteInfo.favicon && (
            <Image 
              src={siteInfo.favicon} 
              alt={`${siteInfo.domain} favicon`}
              width={24}
              height={24}
              className="rounded-sm w-6 h-6"
              style={{ width: 'auto', height: 'auto' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{siteInfo.title}</h3>
            <p className="text-sm text-gray-600">{siteInfo.domain}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {isAnalyzing ? 'Analyzing...' : 'Ready'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-400 hover:text-gray-600"
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
