'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewModalProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (index: number) => void;
  pageLabel?: (index: number) => string;
  selectedPages?: number[];
  onToggleSelect?: (index: number) => void;
}

export function ImagePreviewModal({
  images,
  currentIndex,
  open,
  onOpenChange,
  onNavigate,
  pageLabel = (idx) => `Page ${idx + 1}`,
  selectedPages = [],
  onToggleSelect,
}: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  const isSelected = selectedPages.includes(currentIndex);

  const handleToggleSelect = useCallback(() => {
    if (onToggleSelect) {
      onToggleSelect(currentIndex);
    }
  }, [currentIndex, onToggleSelect]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && onNavigate) {
      onNavigate(currentIndex - 1);
      setZoom(1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1 && onNavigate) {
      onNavigate(currentIndex + 1);
      setZoom(1);
    }
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case ' ':
          e.preventDefault();
          handleToggleSelect();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    open,
    handlePrevious,
    handleNext,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleToggleSelect,
  ]);

  // Reset zoom when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setZoom(1);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-3 border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle>{pageLabel(currentIndex)}</DialogTitle>
              <DialogDescription>
                {currentIndex + 1} of {images.length}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {onToggleSelect && (
                <Button
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleToggleSelect}
                  className="gap-2"
                  title={
                    isSelected
                      ? 'Deselect this page'
                      : 'Select this page for analysis'
                  }
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" />
                      Select Page
                    </>
                  )}
                </Button>
              )}
              <div className="h-6 w-px bg-border" />
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={zoom === 1}
                className="min-w-[60px]"
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-auto bg-slate-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <div
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out',
              }}
              className="relative max-w-full"
            >
              <Image
                src={images[currentIndex]}
                alt={pageLabel(currentIndex)}
                width={1200}
                height={1600}
                unoptimized
                className="w-auto h-auto max-w-full rounded shadow-lg"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg',
                  currentIndex === 0 && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                title="Previous page"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg',
                  currentIndex === images.length - 1 &&
                    'opacity-50 cursor-not-allowed'
                )}
                onClick={handleNext}
                disabled={currentIndex === images.length - 1}
                title="Next page"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Use{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              ←
            </kbd>{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              →
            </kbd>{' '}
            to navigate
            {onToggleSelect && (
              <>
                {' '}
                •{' '}
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                  Space
                </kbd>{' '}
                to select
              </>
            )}{' '}
            • Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              Esc
            </kbd>{' '}
            to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
