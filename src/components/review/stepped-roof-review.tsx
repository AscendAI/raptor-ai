'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, ArrowRight } from 'lucide-react';
import { RoofDataEditor } from './roof-data-editor';
import { RoofReportData } from '@/lib/schemas/extraction';
import { saveUserReviewData } from '@/lib/server/actions';

interface SteppedRoofReviewProps {
  taskId: string;
  roofData: RoofReportData;
  onNext: () => void;
  onBack: () => void;
}

export function SteppedRoofReview({ taskId, roofData, onNext, onBack }: SteppedRoofReviewProps) {
  const [currentRoofData, setCurrentRoofData] = useState<RoofReportData>(roofData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!taskId) {
      console.log('Skipping save - no taskId');
      return;
    }

    try {
      setIsSaving(true);
      toast.info('Saving roof data...');

      // Save with empty insurance data for now
      const emptyInsuranceData = {
        claim_id: '',
        date: '',
        price_list: '',
        sections: []
      };

      const result = await saveUserReviewData(taskId, currentRoofData, emptyInsuranceData);
      
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
      <Card>
        <CardHeader>
          <CardTitle>Review Roof Data</CardTitle>
          <CardDescription>
            Review and modify the extracted roof data. Make any necessary corrections before proceeding to the insurance upload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                The roof document has been processed and data extracted. Please review the information below and make any necessary corrections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoofDataEditor 
        data={currentRoofData} 
        onChange={setCurrentRoofData} 
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
                disabled={isSaving || !taskId}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button 
                onClick={handleSaveAndNext}
                disabled={isSaving}
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