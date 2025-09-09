'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  getUserReviewData,
  completeAnalysisWorkflow,
} from '@/lib/server/actions';
import { toast } from 'sonner';
import { SteppedInsuranceReview } from '@/components/review/stepped-insurance-review';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';

interface TaskDetails {
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  createdAt: Date;
  updatedAt: Date;
}

export default function InsuranceReportReviewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [taskDetails, setTaskDetails] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaskDetails = async () => {
      if (!taskId) {
        setError('Invalid task ID');
        return;
      }

      try {
        setLoading(true);
        const result = await getUserReviewData(taskId);

        if (result.success && result.data) {
          if (!result.data.insuranceData) {
            setError(
              'Insurance data not found. Please upload insurance report first.'
            );
            return;
          }
          setTaskDetails(result.data as TaskDetails);
        } else {
          setError(result.error || 'Failed to load task details');
        }
      } catch (err) {
        console.error('Error loading task details:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTaskDetails();
  }, [taskId]);

  const handleContinue = async () => {
    try {
      toast.info('Generating final analysis...');

      const result = await completeAnalysisWorkflow(taskId);

      if (result.success) {
        toast.success('Analysis completed!');
        // Navigate to results page
        router.push(`/dashboard/results/${taskId}`);
      } else {
        toast.error(result.error || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis');
    }
  };

  const handleBack = () => {
    // Navigate back to insurance upload page
    router.push(`/dashboard/insurance-report-upload/${taskId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !taskDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Failed to load task details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Insurance Upload
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Review Insurance Data</h1>
        <p className="text-muted-foreground mt-2">
          Review and edit the extracted insurance report data before generating
          analysis
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <SteppedInsuranceReview
          taskId={taskId}
          roofData={taskDetails.roofData}
          insuranceData={taskDetails.insuranceData}
          onNext={handleContinue}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
