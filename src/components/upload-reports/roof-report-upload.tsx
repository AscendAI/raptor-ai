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
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadRoofReportFile } from '@/lib/server/actions/uploadRoofReportFile';
import { extractRoofDataFromImages } from '@/lib/server/actions/extractRoofDataFromImages';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';
import { convertPdfToImages } from '@/lib/utils/pdf';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface RoofReportUploadProps {
  taskId: string;
}

export function RoofReportUpload({ taskId }: RoofReportUploadProps) {
  const router = useRouter();

  const [roofFile, setRoofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isGeneratingPages, setIsGeneratingPages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

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

  useEffect(() => {
    if (!taskId) {
      toast.error('Invalid task ID');
      router.push('/dashboard');
      return;
    }
  }, [taskId, router]);

  const handleRoofFileChange = (file: File | null) => {
    setRoofFile(file);
    setPageImages([]);
    setSelectedPages([]);
    setIsUploaded(false);
    setIsGeneratingPages(false);
    // Do not generate pages until after upload
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
    if (!roofFile) return;
    setIsUploading(true);
    try {
      console.log(
        '[client] Uploading roof PDF for task:',
        taskId,
        'file:',
        roofFile.name
      );
      toast.info('Uploading roof PDF...');
      const res = await uploadRoofReportFile(taskId, roofFile);
      if (!res.success) {
        throw new Error(res.error || 'Upload failed');
      }
      setIsUploaded(true);
      toast.success('PDF uploaded. Generating thumbnails...');
      await generatePageImages(roofFile);
    } catch (error) {
      console.error('Error uploading roof PDF:', error);
      toast.error(
        'Failed to upload PDF: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsUploading(false);
    }
  };

  const confirmAndExtract = async () => {
    if (!roofFile || !isUploaded) return;

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

      console.log('[client] Selected pages for AI:', selectedPages);
      toast.info('Extracting roof data...');
      const extractionResult = await extractRoofDataFromImages(
        selectedImages,
        taskId,
        selectedPages
      );

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract roof data'
        );
      }

      updateStepStatus(0, 'completed');

      // Step 2: Verifying & Saving
      setCurrentStepIndex(1);
      updateStepStatus(1, 'running');

      toast.info('Verifying extracted data...');
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult:
        | Awaited<ReturnType<typeof getUserReviewData>>
        | undefined;

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
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      if (!verificationResult?.success || !verificationResult.data?.roofData) {
        updateStepStatus(1, 'error');
        throw new Error(
          'Verification failed: roof data not found after processing'
        );
      }

      updateStepStatus(1, 'completed');
      setIsComplete(true);
      toast.success('Roof document processed successfully!');

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
        {roofFile && isUploaded && (
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
          id="roof-file"
          accept=".pdf"
          selectedFile={roofFile}
          onFileSelect={handleRoofFileChange}
          disabled={isProcessing}
        />

        {roofFile && !isUploaded && (
          <Button
            onClick={uploadPdf}
            disabled={isUploading}
            className="w-full"
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

        {isUploaded && (
          <Button
            onClick={confirmAndExtract}
            disabled={
              !roofFile ||
              isProcessing ||
              isGeneratingPages ||
              selectedPages.length === 0
            }
            className="w-full"
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
