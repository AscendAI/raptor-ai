'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { convertPdfToImages } from '@/lib/utils/pdf';
import { extractAndSaveInsuranceData, getUserReviewData } from '@/lib/server/actions';

type TaskFile = { id: string; name: string; url: string };

interface InsuranceReportUploaderProps {
  taskId: string;
  taskFiles?: TaskFile[];
}

export function InsuranceReportUploader({ taskId, taskFiles = [] }: InsuranceReportUploaderProps) {
  const router = useRouter();
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const existing = taskFiles.find((f) => f.name === `task_${taskId}_insuranceReport.pdf`);

  const handleInsuranceFileChange = (file: File | null) => {
    setInsuranceFile(file);
  };

  const processInsuranceDocument = async () => {
    if (!insuranceFile) return;
    setIsProcessing(true);
    try {
      toast.info('Processing insurance document...');

      const insuranceImages = await convertPdfToImages(insuranceFile);

      toast.info('Extracting insurance data...');
      const extractionResult = await extractAndSaveInsuranceData(
        insuranceImages,
        taskId,
        insuranceFile
      );

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract insurance data'
        );
      }

      toast.success('Insurance document processed successfully!');

      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult;
      while (retryCount < maxRetries) {
        verificationResult = await getUserReviewData(taskId);
        if (verificationResult.success && verificationResult.data?.insuranceData) {
          break;
        }
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!verificationResult?.success || !verificationResult.data?.insuranceData) {
        throw new Error('Data verification failed after multiple attempts');
      }

      router.push(`/dashboard/insurance-report-review/${taskId}`);
    } catch (error) {
      console.error('Error processing insurance document:', error);
      toast.error('Failed to process insurance document');
    }
    setIsProcessing(false);
  };

  const handleBack = () => {
    router.push(`/dashboard/roof-report-review/${taskId}`);
  };

  return (
    <div className="space-y-6">
      {/* Existing uploaded file info */}
      {taskFiles && taskFiles.length > 0 && !insuranceFile && (
        (() => {
          const existing = taskFiles.find(
            (f) => f.name === `task_${taskId}_insuranceReport.pdf`
          );
          if (!existing) return null;
          return (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p>
                  Existing insurance report: <span className="font-medium">{existing.name}</span>
                </p>
                <a
                  href={existing.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  View
                </a>
              </div>
              <p className="text-muted-foreground mt-1">
                You can keep this file or replace it by uploading a new one.
              </p>
            </div>
          );
        })()
      )}
      <FileUpload
        id="insurance-file"
        accept=".pdf"
        selectedFile={insuranceFile}
        onFileSelect={handleInsuranceFileChange}
        disabled={isProcessing}
        label={existing ? 'Replace file (optional)' : undefined}
        description={
          existing
            ? 'An insurance report is already uploaded. You may replace it if needed.'
            : undefined
        }
      />

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
    </div>
  );
}
