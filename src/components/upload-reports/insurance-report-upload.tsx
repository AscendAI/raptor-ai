'use client';

import { useState } from 'react';
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
import { Loader2, Upload, FileText, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { extractAndSaveInsuranceData } from '@/lib/server/actions/extractAndSaveInsuranceData';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';
import { convertPdfToImages } from '@/lib/utils/pdf';

interface InsuranceReportUploadProps {
  taskId: string;
}

export function InsuranceReportUpload({ taskId }: InsuranceReportUploadProps) {
  const router = useRouter();
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Utility
  // sleep utility defined above;

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
      title: 'Extracting Insurance Data',
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

  const handleInsuranceFileChange = (file: File | null) => {
    setInsuranceFile(file);
  };

  const processInsuranceDocument = async () => {
    if (!insuranceFile) return;

    setIsProcessing(true);
    setIsComplete(false);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));
    try {
      toast.info('Processing insurance document...');

      const FAKE_MS = 10000;

      // Step 1: Preparing (fake, non-blocking)
      updateStepStatus(0, 'running');
      setTimeout(() => updateStepStatus(0, 'completed'), FAKE_MS);

      // Kick off real processing immediately (concurrent with fake step)
      const convertAndExtractPromise = (async () => {
        const insuranceImages = await convertPdfToImages(insuranceFile);

        toast.info('Extracting insurance data...');
        const extractionResult = await extractAndSaveInsuranceData(
          insuranceImages,
          taskId,
          insuranceFile
        );

        if (!extractionResult.success || !extractionResult.data) {
          throw new Error(extractionResult.error || 'Failed to extract insurance data');
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
          `Verifying insurance data${retryCount > 0 ? ` (attempt ${retryCount + 1}/${maxRetries})` : ''}...`
        );
        verificationResult = await getUserReviewData(taskId);

        if (verificationResult.success && verificationResult.data?.insuranceData) {
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount} second(s)...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!verificationResult?.success || !verificationResult.data?.insuranceData) {
        updateStepStatus(2, 'error');
        throw new Error('Verification failed: insurance data not found after processing');
      }

      // Proceed immediately after verification

      updateStepStatus(2, 'completed');
      setIsComplete(true);
      toast.success('Insurance document processed successfully!');

      // Keep steps visible and all green briefly before navigating
      setTimeout(() => {
        router.push(`/dashboard/${taskId}/insurance-report-review`);
      }, 800);
    } catch (error) {
      console.error('Error processing insurance document:', error);
      toast.error(
        'Failed to process insurance document: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/${taskId}/roof-report-review`);
  };

  return (
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
        <FileUpload
          id="insurance-file"
          accept=".pdf"
          selectedFile={insuranceFile}
          onFileSelect={handleInsuranceFileChange}
          disabled={isProcessing}
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
            <>Processing Document...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload and Process
            </>
          )}
          </Button>
        </div>

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