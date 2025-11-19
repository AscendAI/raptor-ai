'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PDFReportTemplate } from './pdf-report-template';
import { type ComparisonResult } from '@/lib/types/comparison';
import { type InsuranceReportData } from '@/lib/types/extraction';
import { Button } from '@/components/ui/button';
import { Download, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  generatePDFServerSide,
  expandAllAccordions,
} from '@/lib/utils/pdf-server-side';

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: ComparisonResult;
  insuranceData?: InsuranceReportData;
  taskId: string;
  priceListStatus?: {
    status: 'pass' | 'failed' | 'warning';
    message: string;
  } | null;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  comparison,
  insuranceData,
  taskId,
  priceListStatus,
}: PDFPreviewDialogProps) {
  const templateRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');

  const handleDownloadPDF = async () => {
    if (!templateRef.current) {
      toast.error('Unable to generate PDF. Please try again.');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportMessage('Starting...');

      // Expand all accordions first
      const cleanup = expandAllAccordions(templateRef.current);

      // Small delay for accordions to expand
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate and download PDF with progress tracking using server-side rendering
      await generatePDFServerSide(templateRef.current, {
        filename: `analysis-report-${taskId.slice(-8)}.pdf`,
        onProgress: (progress: number, message: string) => {
          setExportProgress(progress);
          setExportMessage(message);
        },
      });

      // Restore accordion states
      cleanup();

      toast.success('PDF downloaded successfully!');
      // Close dialog after successful download
      setTimeout(() => {
        onOpenChange(false);
        setExportProgress(0);
        setExportMessage('');
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 gap-0">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Download className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                PDF Report Preview
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Review before downloading as PDF
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {exportMessage || 'Generating...'}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={isExporting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isExporting && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-700 min-w-[3rem]">
                {exportProgress}%
              </span>
            </div>
          </div>
        )}

        <div className="overflow-auto p-8 bg-gray-100">
          <div className="max-w-[240mm] mx-auto bg-white shadow-lg">
            <PDFReportTemplate
              ref={templateRef}
              comparison={comparison}
              insuranceData={insuranceData}
              taskId={taskId}
              priceListStatus={priceListStatus}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
