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
import { SingleStructureRoofEditor } from './single-structure-roof-editor';
import { MultiStructureRoofEditor } from './multi-structure-roof-editor';
import { RoofReportData } from '@/lib/types/extraction';
import { saveRoofReviewData } from '@/lib/server/actions/saveRoofReviewData';
import { FileData } from '@/lib/types/files';
import { PDFViewer } from '@/components/ui/pdf-viewer';

interface SteppedRoofReviewProps {
  taskId: string;
  roofData: RoofReportData;
  files: FileData[];
  onNext: () => void;
  onBack: () => void;
}

export function SteppedRoofReview({
  taskId,
  roofData,
  files,
  onNext,
  onBack,
}: SteppedRoofReviewProps) {
  const [currentRoofData, setCurrentRoofData] =
    useState<RoofReportData>(roofData);
  const [isSaving, setIsSaving] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Find the roof report PDF
  const roofPdfFile = files.find(
    (file) => file.name.includes('roofReport') && file.name.endsWith('.pdf')
  );

  const handleSave = async () => {
    if (!taskId) {
      console.log('Skipping save - no taskId');
      return;
    }

    try {
      setIsSaving(true);
      toast.info('Saving roof data...');

      const result = await saveRoofReviewData(taskId, currentRoofData);

      if (result.success) {
        toast.success('Roof data saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save roof data');
      }
    } catch (error) {
      console.error('Error saving roof data:', error);
      toast.error('Failed to save roof data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndNext = async () => {
    await handleSave();
    // Always proceed to next step, even if saving was skipped
    onNext();
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
                  Document processed successfully. Review and edit the data below for accuracy.
                </p>
              </div>
            </div>
            {roofPdfFile && (
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
        className={`${showPdfPreview && roofPdfFile ? 'grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6' : ''}`}
      >
        <div className={showPdfPreview && roofPdfFile ? 'xl:col-span-1' : ''}>
          {currentRoofData.structureCount > 1 ? (
            <MultiStructureRoofEditor
              data={currentRoofData}
              onChange={setCurrentRoofData}
            />
          ) : (
            <SingleStructureRoofEditor
              data={{
                measurements: currentRoofData.structures[0]?.measurements || {},
                pitch_breakdown: currentRoofData.structures[0]?.pitch_breakdown || [],
                waste_table: currentRoofData.structures[0]?.waste_table || [],
              }}
              onChange={(singleData) => {
                const updatedMultiData: RoofReportData = {
                  structureCount: 1,
                  structures: [{
                    structureNumber: 1,
                    measurements: singleData.measurements,
                    pitch_breakdown: singleData.pitch_breakdown,
                    waste_table: singleData.waste_table,
                  }],
                };
                setCurrentRoofData(updatedMultiData);
              }}
            />
          )}
        </div>
        {showPdfPreview && roofPdfFile && (
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
                  Original roof report document
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[calc(100vh-130px)] min-h-[600px]">
                  <PDFViewer pdfUrl={roofPdfFile.url} className="h-full" />
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
                disabled={isSaving || !taskId}
                className="w-full sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={handleSaveAndNext}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
