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
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { RoofDataEditor } from './roof-data-editor';
import { RoofReportData } from '@/lib/schemas/extraction';
import { saveRoofReviewData } from '@/lib/server/actions';

interface SteppedRoofReviewProps {
  taskId: string;
  roofData: RoofReportData;
  onNext: () => void;
  onBack: () => void;
}

export function SteppedRoofReview({
  taskId,
  roofData,
  onNext,
  onBack,
}: SteppedRoofReviewProps) {
  const [currentRoofData, setCurrentRoofData] =
    useState<RoofReportData>(roofData);
  const [isSaving, setIsSaving] = useState(false);

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
    <div className="space-y-8">
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b border-blue-200 rounded-t-xl pt-6">
          <CardTitle className="text-slate-800 text-xl">
            Review Roof Data
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            Review and modify the extracted roof data. Make any necessary
            corrections before proceeding to the insurance upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-200 rounded-lg flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Data Extraction Complete
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  The roof document has been processed and data extracted.
                  Please review the information below and make any necessary
                  corrections to ensure accuracy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoofDataEditor data={currentRoofData} onChange={setCurrentRoofData} />

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
