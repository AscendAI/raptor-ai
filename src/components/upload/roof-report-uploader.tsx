'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { convertPdfToImages } from '@/lib/utils/pdf';
import { extractAndSaveRoofData, getUserReviewData } from '@/lib/server/actions';

type TaskFile = { id: string; name: string; url: string };

interface RoofReportUploaderProps {
  taskId: string;
  taskFiles?: TaskFile[];
}

export function RoofReportUploader({ taskId, taskFiles = [] }: RoofReportUploaderProps) {
  const router = useRouter();
  const [roofFile, setRoofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const existing = taskFiles.find((f) => f.name === `task_${taskId}_roofReport.pdf`);

  const handleRoofFileChange = (file: File | null) => {
    setRoofFile(file);
  };

  const processRoofDocument = async () => {
    if (!roofFile) return;
    setIsProcessing(true);
    try {
      toast.info('Processing roof document...');

      const roofImages = await convertPdfToImages(roofFile);

      toast.info('Extracting roof data...');
      const extractionResult = await extractAndSaveRoofData(
        roofImages,
        taskId,
        roofFile
      );

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(extractionResult.error || 'Failed to extract roof data');
      }

      toast.success('Roof document processed successfully!');

      // Verify data exists before navigation with retry mechanism
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult;
      while (retryCount < maxRetries) {
        verificationResult = await getUserReviewData(taskId);
        if (verificationResult.success && verificationResult.data?.roofData) {
          break;
        }
        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!verificationResult?.success || !verificationResult.data?.roofData) {
        throw new Error('Data verification failed after multiple attempts');
      }

      router.push(`/dashboard/roof-report-review/${taskId}`);
    } catch (error) {
      console.error('Error processing roof document:', error);
      toast.error('Failed to process roof document');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Existing uploaded file info */}
      {taskFiles && taskFiles.length > 0 && !roofFile && (
        (() => {
          const existing = taskFiles.find(
            (f) => f.name === `task_${taskId}_roofReport.pdf`
          );
          if (!existing) return null;
          return (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p>
                  Existing roof report: <span className="font-medium">{existing.name}</span>
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
        id="roof-file"
        accept=".pdf"
        selectedFile={roofFile}
        onFileSelect={handleRoofFileChange}
        disabled={isProcessing}
        label={existing ? 'Replace file (optional)' : undefined}
        description={
          existing
            ? 'A roof report is already uploaded. You may replace it if needed.'
            : undefined
        }
      />

      <Button
        onClick={processRoofDocument}
        disabled={!roofFile || isProcessing}
        className="w-full"
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
  );
}
