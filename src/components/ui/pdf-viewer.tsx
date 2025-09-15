'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  className?: string;
}

export function PDFViewer({ pdfUrl, className = '' }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center h-full p-6">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to load PDF</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            The PDF file could not be displayed. You can try downloading it instead.
          </p>
          <Button
            variant="outline"
            onClick={() => window.open(pdfUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Open in New Tab
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full ${className}`}>
      <CardContent className="p-0 h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0 rounded-lg"
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Preview"
        />
      </CardContent>
    </Card>
  );
}