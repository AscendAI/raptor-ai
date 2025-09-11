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
import { InsuranceDataEditor } from './insurance-data-editor';
import { InsuranceReportData, RoofReportData } from '@/lib/schemas/extraction';
import { saveUserReviewData } from '@/lib/server/actions';

interface SteppedInsuranceReviewProps {
  taskId: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  onNext: () => void;
  onBack: () => void;
}

export function SteppedInsuranceReview({
  taskId,
  roofData,
  insuranceData,
  onNext,
  onBack,
}: SteppedInsuranceReviewProps) {
  const [currentInsuranceData, setCurrentInsuranceData] =
    useState<InsuranceReportData>(insuranceData);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAndContinuing, setIsSavingAndContinuing] = useState(false);

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
    <div className="space-y-8">
      <Card className="shadow-sm border-slate-200 pt-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b border-indigo-200 rounded-t-xl pt-6">
          <CardTitle className="text-slate-800 text-xl">
            Review Insurance Data
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            Review and modify the extracted insurance data. Make any necessary
            corrections before generating the final analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-200 rounded-lg flex-shrink-0">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-indigo-800 mb-2">
                  Insurance Data Ready for Review
                </h4>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  The insurance document has been processed and data extracted.
                  Please review the information below and make any necessary
                  corrections before proceeding to analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InsuranceDataEditor
        data={currentInsuranceData}
        onChange={setCurrentInsuranceData}
      />

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
