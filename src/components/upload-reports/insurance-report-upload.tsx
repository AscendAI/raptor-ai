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
import {
  Loader2,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractAndSaveInsuranceData } from '@/lib/server/actions/extractAndSaveInsuranceData';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';
import { convertPdfToImages } from '@/lib/utils/pdf';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { uploadInsuranceReportFile } from '@/lib/server/actions/uploadInsuranceReportFile';

interface InsuranceReportUploadProps {
  taskId: string;
}

export function InsuranceReportUpload({ taskId }: InsuranceReportUploadProps) {
  const router = useRouter();
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isGeneratingPages, setIsGeneratingPages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  // Utility
  // sleep utility defined above;

  // Multi-step loading state
  type UploadStepStatus = 'pending' | 'running' | 'completed' | 'error';
  interface UploadStep {
    id: string;
    title: string;
    description: string;
    status: UploadStepStatus;
  }

  const INITIAL_STEPS: UploadStep[] = [
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
  ];

  const [steps, setSteps] = useState<UploadStep[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const updateStepStatus = (stepIndex: number, status: UploadStepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleInsuranceFileChange = (file: File | null) => {
    setInsuranceFile(file);
    setPageImages([]);
    setSelectedPages([]);
    setIsUploaded(false);
    setIsGeneratingPages(false);
  };

  const generatePageImages = async (file: File) => {
    try {
      setIsGeneratingPages(true);
      toast.info('Generating page thumbnails...');
      const images = await convertPdfToImages(file);
      setPageImages(images);
      setSelectedPages([]);
      toast.success(`Loaded ${images.length} page(s)`);
    } catch (error) {
      console.error('Error generating page images:', error);
      toast.error('Failed to read PDF pages');
    } finally {
      setIsGeneratingPages(false);
    }
  };

  const togglePage = (index: number) => {
    setSelectedPages((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () =>
    setSelectedPages(pageImages.map((_, idx) => idx));
  const clearAllPages = () => setSelectedPages([]);

  const uploadPdf = async () => {
    if (!insuranceFile) return;
    setIsUploading(true);
    try {
      toast.info('Uploading insurance PDF...');
      const res = await uploadInsuranceReportFile(taskId, insuranceFile);
      if (!res.success) {
        throw new Error(res.error || 'Upload failed');
      }
      setIsUploaded(true);
      toast.success('PDF uploaded. Generating thumbnails...');
      await generatePageImages(insuranceFile);
    } catch (error) {
      console.error('Error uploading insurance PDF:', error);
      toast.error(
        'Failed to upload PDF: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const confirmAndExtract = async () => {
    if (!insuranceFile || !isUploaded) return;

    setIsProcessing(true);
    setIsComplete(false);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setCurrentStepIndex(0);
    updateStepStatus(0, 'running');

    try {
      const selectedImages = selectedPages
        .map((idx) => pageImages[idx])
        .filter((img): img is string => Boolean(img));

      if (selectedImages.length === 0) {
        throw new Error('No pages selected for analysis');
      }

      toast.info('Extracting insurance data...');
      const extractionResult = await extractAndSaveInsuranceData(
        selectedImages,
        taskId,
        insuranceFile
      );

      if (!extractionResult.success || !extractionResult.data) {
        updateStepStatus(0, 'error');
        throw new Error(
          extractionResult.error || 'Failed to extract insurance data'
        );
      }

      updateStepStatus(0, 'completed');

      setCurrentStepIndex(1);
      updateStepStatus(1, 'running');

      toast.info('Verifying extracted data...');
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult:
        | Awaited<ReturnType<typeof getUserReviewData>>
        | undefined;

      while (retryCount < maxRetries) {
        verificationResult = await getUserReviewData(taskId);

        if (
          verificationResult.success &&
          verificationResult.data?.insuranceData
        ) {
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      if (
        !verificationResult?.success ||
        !verificationResult.data?.insuranceData
      ) {
        updateStepStatus(1, 'error');
        throw new Error(
          'Verification failed: insurance data not found after processing'
        );
      }

      updateStepStatus(1, 'completed');
      setIsComplete(true);
      toast.success('Insurance document processed successfully!');

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

  // migrated: old processInsuranceDocument flow removed in favor of upload + page selection + confirm extraction.

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
        {insuranceFile && isUploaded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-medium">Select Pages to Analyze</h3>
                <p className="text-xs text-muted-foreground">
                  Tip: Select only the relevant pages to improve accuracy.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllPages}
                  disabled={isGeneratingPages || pageImages.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllPages}
                  disabled={isGeneratingPages || pageImages.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {isGeneratingPages ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating thumbnails...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pageImages.map((src, idx) => {
                  const selected = selectedPages.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePage(idx)}
                      className={cn(
                        'relative border rounded-md overflow-hidden group',
                        selected
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-slate-200'
                      )}
                    >
                      <Image
                        src={src}
                        alt={`Page ${idx + 1}`}
                        width={512}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-1 left-1 px-2 py-1 text-xs bg-white/80 rounded-md shadow">
                        Page {idx + 1}
                      </div>
                      {selected && (
                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {pageImages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No pages detected in the PDF.
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedPages.length} page(s) selected
            </p>
          </div>
        )}

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

          {insuranceFile && !isUploaded && (
            <Button
              onClick={uploadPdf}
              disabled={isUploading}
              className="flex-1"
              size="lg"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </>
              )}
            </Button>
          )}

          {insuranceFile && isUploaded && (
            <Button
              onClick={confirmAndExtract}
              disabled={
                isProcessing || isGeneratingPages || selectedPages.length === 0
              }
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>Processing Document...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Confirm and continue to extraction
                </>
              )}
            </Button>
          )}
        </div>

        {false && insuranceFile && isUploaded && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-medium">Select Pages to Analyze</h3>
                <p className="text-xs text-muted-foreground">
                  Tip: Select only the relevant pages to improve accuracy.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllPages}
                  disabled={isGeneratingPages || pageImages.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllPages}
                  disabled={isGeneratingPages || pageImages.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {isGeneratingPages ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating thumbnails...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pageImages.map((src, idx) => {
                  const selected = selectedPages.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => togglePage(idx)}
                      className={cn(
                        'relative border rounded-md overflow-hidden group',
                        selected
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-slate-200'
                      )}
                    >
                      <Image
                        src={src}
                        alt={`Page ${idx + 1}`}
                        width={512}
                        height={128}
                        unoptimized
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-1 left-1 px-2 py-1 text-xs bg-white/80 rounded-md shadow">
                        Page {idx + 1}
                      </div>
                      {selected && (
                        <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1">
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
                {pageImages.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No pages detected in the PDF.
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedPages.length} page(s) selected
            </p>
          </div>
        )}

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
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
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
