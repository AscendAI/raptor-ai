'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner';
import { extractAndSaveRoofData } from '@/lib/server/actions/extractAndSaveRoofData';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';
import { convertPdfToImages } from '@/lib/utils/pdf';

interface RoofReportUploadProps {
  taskId: string;
}

export function RoofReportUpload({ taskId }: RoofReportUploadProps) {
  const router = useRouter();

  const [roofFile, setRoofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Multi-step loading state
  type UploadStepStatus = 'pending' | 'running' | 'completed' | 'error'
  interface UploadStep {
    id: string
    title: string
    description: string
    status: UploadStepStatus
  }

  const INITIAL_STEPS: UploadStep[] = [
    {
      id: 'preparing',
      title: 'Preparing Upload',
      description: 'Setting up file processing',
      status: 'pending',
    },
    {
      id: 'extracting',
      title: 'Extracting Roof Data',
      description: 'Converting PDF and analyzing contents',
      status: 'pending',
    },
    {
      id: 'verifying',
      title: 'Verifying & Saving',
      description: 'Validating and saving extracted data',
      status: 'pending',
    },
  ]

  const [steps, setSteps] = useState<UploadStep[]>(INITIAL_STEPS)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const updateStepStatus = (
    stepIndex: number,
    status: UploadStepStatus
  ) => {
    setSteps((prev) =>
      prev.map((step, index) => (index === stepIndex ? { ...step, status } : step))
    )
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  useEffect(() => {
    if (!taskId) {
      toast.error('Invalid task ID');
      router.push('/dashboard');
      return;
    }
  }, [taskId, router]);

  const handleRoofFileChange = (file: File | null) => {
    setRoofFile(file);
  };

  const processRoofDocument = async () => {
    if (!roofFile) return;

    setIsProcessing(true);
    setIsComplete(false);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));
    try {
      toast.info('Processing roof document...');

      const FAKE_MS = 10000;

      // Step 1: Preparing (fake, non-blocking)
      updateStepStatus(0, 'running');
      setTimeout(() => updateStepStatus(0, 'completed'), FAKE_MS);

      // Kick off real processing immediately (concurrent with fake step)
      const convertAndExtractPromise = (async () => {
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

        return extractionResult;
      })();

      // After fake step completes visually, show extracting
      await sleep(FAKE_MS);
      setCurrentStepIndex(1);
      updateStepStatus(1, 'running');

      await convertAndExtractPromise;
      updateStepStatus(1, 'completed');

      // Step 3: Verifying & Saving
      setCurrentStepIndex(2);
      updateStepStatus(2, 'running');

      toast.info('Verifying extracted data...');
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult: Awaited<ReturnType<typeof getUserReviewData>> | undefined;

      while (retryCount < maxRetries) {
        console.log(
          `Verifying roof data${retryCount > 0 ? ` (attempt ${retryCount + 1}/${maxRetries})` : ''}...`
        );
        verificationResult = await getUserReviewData(taskId);

        if (verificationResult.success && verificationResult.data?.roofData) {
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount} second(s)...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!verificationResult?.success || !verificationResult.data?.roofData) {
        updateStepStatus(2, 'error');
        throw new Error('Verification failed: roof data not found after processing');
      }

      // Proceed immediately after verification

      updateStepStatus(2, 'completed');
      setIsComplete(true);
      toast.success('Roof document processed successfully!');

      // Keep steps visible and all green briefly before navigating
      setTimeout(() => {
        router.push(`/dashboard/${taskId}/roof-report-review`);
      }, 800);
    } catch (error) {
      console.error('Error processing roof document:', error);
      toast.error(
        'Failed to process roof document: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Roof Report Document
        </CardTitle>
        <CardDescription>
          Please upload your roof inspection report (PDF format)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          id="roof-file"
          accept=".pdf"
          selectedFile={roofFile}
          onFileSelect={handleRoofFileChange}
          disabled={isProcessing}
        />

        <Button
          onClick={processRoofDocument}
          disabled={!roofFile || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>Processing Document...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload and Process
            </>
          )}
        </Button>

        {(isProcessing || isComplete) && (
          <div className="space-y-4">
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-4 p-3 rounded-lg border"
                >
                  <div className="flex-shrink-0">
                    {step.status === 'running' && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    {step.status === 'pending' && (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-medium ${
                        step.status === 'running'
                          ? 'text-blue-600'
                          : step.status === 'completed'
                            ? 'text-green-600'
                            : step.status === 'error'
                              ? 'text-red-600'
                              : 'text-gray-600'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}