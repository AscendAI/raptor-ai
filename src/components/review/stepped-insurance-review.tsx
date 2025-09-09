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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Insurance Data</CardTitle>
          <CardDescription>
            Review and modify the extracted insurance data. Make any necessary
            corrections before generating the final analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                The insurance document has been processed and data extracted.
                Please review the information below and make any necessary
                corrections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <InsuranceDataEditor
        data={currentInsuranceData}
        onChange={setCurrentInsuranceData}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || isSavingAndContinuing}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={handleSaveAndNext}
                disabled={isSaving || isSavingAndContinuing}
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
