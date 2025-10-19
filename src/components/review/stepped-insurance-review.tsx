'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { BsFilePdfFill } from 'react-icons/bs';
import { InsuranceDataEditor } from './insurance-data-editor';
import { InsuranceReportData, RoofReportData } from '@/lib/types/extraction';
import { saveUserReviewData } from '@/lib/server/actions/saveUserReviewData';
import { FileData } from '@/lib/types/files';
import { PDFViewer } from '@/components/ui/pdf-viewer';

interface SteppedInsuranceReviewProps {
  taskId: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  files: FileData[];
  onNext: () => void;
  onBack: () => void;
}

export function SteppedInsuranceReview({
  taskId,
  roofData,
  insuranceData,
  files,
  onNext,
  onBack,
}: SteppedInsuranceReviewProps) {
  const [currentInsuranceData, setCurrentInsuranceData] =
    useState<InsuranceReportData>(insuranceData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndContinuing, setIsSavingAndContinuing] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Find the insurance report PDF
  const insurancePdfFile = files.find(
    (file) =>
      file.name.includes('insuranceReport') && file.name.endsWith('.pdf')
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      toast.info('Saving insurance data...');

      const result = await saveUserReviewData(
        taskId,
        roofData,
        currentInsuranceData
      );

      if (result.success) {
        toast.success('Insurance data saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save insurance data');
      }
    } catch (error) {
      console.error('Error saving insurance data:', error);
      toast.error('Failed to save insurance data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    try {
      setIsSavingAndContinuing(true);
      toast.info('Saving insurance data...');

      const result = await saveUserReviewData(
        taskId,
        roofData,
        currentInsuranceData
      );

      if (result.success) {
        toast.success('Insurance data saved successfully!');
        onNext();
      } else {
        toast.error(result.error || 'Failed to save insurance data');
      }
    } catch (error) {
      console.error('Error saving insurance data:', error);
      toast.error('Failed to save insurance data');
    } finally {
      setIsSavingAndContinuing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/60">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-transparent"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 mb-1">
                  Data Extraction Complete
                </h3>
                <p className="text-emerald-700 text-sm leading-relaxed max-w-md">
                  Your insurance document has been successfully processed.
                  Review and edit the extracted data below to ensure accuracy.
                </p>
              </div>
            </div>
            {insurancePdfFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-emerald-200 text-emerald-700 hover:text-emerald-800 shadow-sm"
              >
                {showPdfPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide PDF Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show PDF Preview
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        className={`${showPdfPreview && insurancePdfFile ? 'grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6' : ''}`}
      >
        <div
          className={showPdfPreview && insurancePdfFile ? 'xl:col-span-1' : ''}
        >
          <InsuranceDataEditor
            data={currentInsuranceData}
            onChange={setCurrentInsuranceData}
          />
        </div>
        {showPdfPreview && insurancePdfFile && (
          <div className="xl:col-span-1">
            <Card className="shadow-sm border-slate-200 sticky top-2 pb-0">
              <CardHeader className="py-0">
                <CardTitle className="text-base font-medium py-0 flex items-center gap-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <BsFilePdfFill className="w-5 h-5 text-primary" />
                  </div>
                  PDF Preview
                </CardTitle>
                <CardDescription className="text-sm py-0">
                  Original insurance report document
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(100vh-130px)] min-h-[600px]">
                  <PDFViewer pdfUrl={insurancePdfFile.url} className="h-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || isSavingAndContinuing}
                className="w-full sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={handleSaveAndNext}
                disabled={isSaving || isSavingAndContinuing}
                className="w-full sm:w-auto"
              >
                {isSavingAndContinuing && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSavingAndContinuing
                  ? 'Saving & Continuing...'
                  : 'Save & Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
