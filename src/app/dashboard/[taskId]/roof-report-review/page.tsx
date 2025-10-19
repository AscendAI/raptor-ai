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
import { Loader2 } from 'lucide-react';
import { getUserReviewData } from '@/lib/server/actions';
import { SteppedRoofReview } from '@/components/review/stepped-roof-review';
import { RoofReportData, InsuranceReportData } from '@/lib/types/extraction';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { FileData } from '@/lib/types/files';

interface TaskDetails {
  roofData: RoofReportData;
  insuranceData?: InsuranceReportData;
  files: FileData[];
  createdAt: Date;
  updatedAt: Date;
}

export default function RoofReportReviewPage() {
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
          setTaskDetails(result.data);
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

  const handleContinue = () => {
    // Navigate to insurance upload page
    router.push(`/dashboard/${taskId}/insurance-report-upload`);
  };

  const handleBack = () => {
    // Navigate back to roof upload page
    router.push(`/dashboard/${taskId}/roof-report-upload`);
  };

  if (loading) {
    return (
      <WorkflowLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        </div>
      </WorkflowLayout>
    );
  }

  if (error || !taskDetails) {
    return (
      <WorkflowLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Failed to load task details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </WorkflowLayout>
    );
  }

  return (
    <WorkflowLayout
      title="Review Roof Data"
      description="Review and edit the extracted roof report data before proceeding"
    >
      <div className="w-full">
        <SteppedRoofReview
          taskId={taskId}
          roofData={taskDetails.roofData}
          files={taskDetails.files}
          onNext={handleContinue}
          onBack={handleBack}
        />
      </div>
    </WorkflowLayout>
  );
}
