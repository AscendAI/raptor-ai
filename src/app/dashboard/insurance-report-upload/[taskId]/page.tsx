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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  extractInsuranceData,
  updateTaskWithInsuranceData,
  getUserReviewData,
} from '@/lib/server/actions';
import { convertPdfToImages } from '@/lib/utils/pdf';
import { WorkflowLayout } from '@/components/common/workflow-layout';

export default function InsuranceReportUploadPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskExists, setTaskExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTask = async () => {
      if (!taskId) {
        toast.error('Invalid task ID');
        router.push('/dashboard');
        return;
      }

      try {
        const result = await getUserReviewData(taskId);
        if (result.success && result.data?.roofData) {
          setTaskExists(true);
        } else {
          toast.error('Task not found or roof data missing');
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking task:', error);
        toast.error('Failed to verify task');
        router.push('/dashboard');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkTask();
  }, [taskId, router]);

  const handleInsuranceFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    setInsuranceFile(selectedFile);
  };

  const processInsuranceDocument = async () => {
    if (!insuranceFile) return;

    try {
      setIsProcessing(true);
      toast.info('Processing insurance document...');

      // Convert PDF to images
      const insuranceImages = await convertPdfToImages(insuranceFile);

      // Extract insurance data
      toast.info('Extracting insurance data...');
      const extractionResult = await extractInsuranceData(insuranceImages);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract insurance data'
        );
      }

      // Update the existing task with insurance data
      const updateResult = await updateTaskWithInsuranceData(
        taskId,
        extractionResult.data
      );

      if (updateResult.success) {
        toast.success('Insurance document processed successfully!');
        // Navigate to insurance review page
        router.push(`/dashboard/insurance-report-review/${taskId}`);
      } else {
        throw new Error(
          updateResult.error || 'Failed to update task with insurance data'
        );
      }
    } catch (error) {
      console.error('Error processing insurance document:', error);
      toast.error('Failed to process insurance document');
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/roof-report-review/${taskId}`);
  };

  if (loading) {
    return (
      <WorkflowLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying task...</p>
          </div>
        </div>
      </WorkflowLayout>
    );
  }

  if (!taskExists) {
    return (
      <WorkflowLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Task Not Found</CardTitle>
            <CardDescription>
              The specified task could not be found or does not have roof data.
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
      title="Upload Insurance Report"
      description="Upload your insurance document to continue the analysis process"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Insurance Report Document
          </CardTitle>
          <CardDescription>
            Please upload your insurance claim report (PDF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="insurance-file">Select Insurance Report PDF</Label>
            <Input
              id="insurance-file"
              type="file"
              accept=".pdf"
              onChange={handleInsuranceFileChange}
              disabled={isProcessing}
            />
          </div>

          {insuranceFile && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="text-sm text-muted-foreground">
                {insuranceFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Size: {(insuranceFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={handleBack} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roof Review
            </Button>

            <Button
              onClick={processInsuranceDocument}
              disabled={!insuranceFile || isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload and Process
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}
