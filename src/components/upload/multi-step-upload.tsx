'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/ui/step-indicator';
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
import { Loader2, Upload, BarChart3, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  extractRoofData,
  extractInsuranceData,
  createRoofReviewTask,
  updateTaskWithInsuranceData,
  createUserReviewTask,
  completeAnalysisWorkflow,
} from '@/lib/server/actions';
import { SteppedRoofReview } from '@/components/review/stepped-roof-review';
import { SteppedInsuranceReview } from '@/components/review/stepped-insurance-review';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';

// Import existing functions from upload-file
function readFileData(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

async function convertPdfToImages(file: File) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  const images: string[] = [];
  const data = await readFileData(file);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = await pdfjs.getDocument(data as any).promise;
  const canvas = document.createElement('canvas');
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 0.75 });
    const context = canvas.getContext('2d');
    if (!context) continue;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport, canvas })
      .promise;
    // Use JPEG compression with 0.7 quality to reduce file size
    images.push(canvas.toDataURL('image/jpeg', 0.7));
  }
  canvas.remove();
  return images;
}

const STEPS = [
  {
    id: 'roof-upload',
    title: 'Upload Roof Report',
    description: 'Upload your roofing document',
  },
  {
    id: 'roof-review',
    title: 'Review Roof Data',
    description: 'Check and modify extracted data',
  },
  {
    id: 'insurance-upload',
    title: 'Upload Insurance Report',
    description: 'Upload your insurance document',
  },
  {
    id: 'insurance-review',
    title: 'Review Insurance Data',
    description: 'Check and modify extracted data',
  },
  {
    id: 'analysis',
    title: 'Generate Analysis',
    description: 'View comparison results',
  },
];

interface MultiStepUploadState {
  currentStep: number;
  roofFile: File | null;
  insuranceFile: File | null;
  roofImages: string[];
  insuranceImages: string[];
  roofData: RoofReportData | null;
  insuranceData: InsuranceReportData | null;
  isProcessing: boolean;
  taskId: string | null;
}

export function MultiStepUpload() {
  const router = useRouter();
  const [state, setState] = useState<MultiStepUploadState>({
    currentStep: 1,
    roofFile: null,
    insuranceFile: null,
    roofImages: [],
    insuranceImages: [],
    roofData: null,
    insuranceData: null,
    isProcessing: false,
    taskId: null,
  });

  const handleRoofFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setState((prev) => ({ ...prev, roofFile: selectedFile }));
  };

  const handleInsuranceFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    setState((prev) => ({ ...prev, insuranceFile: selectedFile }));
  };

  const processRoofDocument = async () => {
    if (!state.roofFile) return;

    try {
      setState((prev) => ({ ...prev, isProcessing: true }));
      toast.info('Processing roof document...');

      // Convert PDF to images
      const roofImages = await convertPdfToImages(state.roofFile);

      // Extract roof data
      toast.info('Extracting roof data...');
      const extractionResult = await extractRoofData(roofImages);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract roof data'
        );
      }

      // Create a task with the roof data immediately
      const taskResult = await createRoofReviewTask(extractionResult.data);
      
      if (taskResult.success && taskResult.taskId) {
        setState((prev) => ({
          ...prev,
          roofImages,
          roofData: extractionResult.data || null,
          taskId: taskResult.taskId,
          currentStep: 2,
          isProcessing: false,
        }));
        toast.success('Roof document processed and data extracted successfully!');
      } else {
        throw new Error(taskResult.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error processing roof document:', error);
      toast.error('Failed to process roof document');
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const processInsuranceDocument = async () => {
    if (!state.insuranceFile || !state.taskId) return;

    try {
      setState((prev) => ({ ...prev, isProcessing: true }));
      toast.info('Processing insurance document...');

      // Convert PDF to images
      const insuranceImages = await convertPdfToImages(state.insuranceFile);

      // Extract insurance data
      toast.info('Extracting insurance data...');
      const extractionResult = await extractInsuranceData(insuranceImages);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract insurance data'
        );
      }

      // Update the existing task with insurance data
      const updateResult = await updateTaskWithInsuranceData(state.taskId, extractionResult.data);
      
      if (updateResult.success) {
        setState((prev) => ({
          ...prev,
          insuranceImages,
          insuranceData: extractionResult.data || null,
          currentStep: 4,
          isProcessing: false,
        }));
        toast.success(
          'Insurance document processed and data extracted successfully!'
        );
      } else {
        throw new Error(updateResult.error || 'Failed to update task with insurance data');
      }
    } catch (error) {
      console.error('Error processing insurance document:', error);
      toast.error('Failed to process insurance document');
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const goToPreviousStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  };

  const generateAnalysis = async () => {
    if (!state.taskId) {
      toast.error('No task ID available');
      return;
    }

    try {
      setState((prev) => ({ ...prev, isProcessing: true }));
      toast.info('Generating final analysis...');

      const result = await completeAnalysisWorkflow(state.taskId);

      if (result.success) {
        toast.success('Analysis completed!');
        router.push(`/dashboard/results/${state.taskId}`);
      } else {
        toast.error(result.error || 'Failed to generate analysis');
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error('Failed to generate analysis');
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const createTaskForReview = async () => {
    if (!state.roofData || !state.insuranceData) {
      toast.error('Both roof and insurance data must be available');
      return;
    }

    try {
      setState((prev) => ({ ...prev, isProcessing: true }));
      toast.info('Preparing analysis...');

      const result = await createUserReviewTask(
        state.roofData,
        state.insuranceData
      );

      if (result.success && result.taskId) {
        setState((prev) => ({
          ...prev,
          taskId: result.taskId,
          currentStep: 5,
          isProcessing: false,
        }));
        toast.success('Ready to generate analysis!');
        return result.taskId;
      } else {
        throw new Error(result.error || 'Failed to create review task');
      }
    } catch (error) {
      console.error('Error creating review task:', error);
      toast.error('Failed to create review task');
      setState((prev) => ({ ...prev, isProcessing: false }));
      return null;
    }
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Roof Report
              </CardTitle>
              <CardDescription>
                Please upload your roofing document (PDF format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roof-file">Roof Report Document</Label>
                <Input
                  id="roof-file"
                  type="file"
                  onChange={handleRoofFileChange}
                  accept="application/pdf"
                  className="mt-1"
                />
              </div>
              {state.roofFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Selected: {state.roofFile.name}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  onClick={processRoofDocument}
                  disabled={!state.roofFile || state.isProcessing}
                >
                  {state.isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {state.isProcessing ? 'Processing...' : 'Process Document'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Roof Data Extracted Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Review and modify the extracted data below, then proceed to
                upload your insurance document.
              </p>
            </div>
            {state.roofData && state.taskId && (
              <SteppedRoofReview
                taskId={state.taskId}
                roofData={state.roofData}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 1 }))}
                onNext={() => setState((prev) => ({ ...prev, currentStep: 3 }))}
              />
            )}
          </div>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Insurance Report
              </CardTitle>
              <CardDescription>
                Please upload your insurance document (PDF format)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="insurance-file">
                  Insurance Report Document
                </Label>
                <Input
                  id="insurance-file"
                  type="file"
                  onChange={handleInsuranceFileChange}
                  accept="application/pdf"
                  className="mt-1"
                />
              </div>
              {state.insuranceFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Selected: {state.insuranceFile.name}
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button
                  onClick={processInsuranceDocument}
                  disabled={!state.insuranceFile || state.isProcessing}
                >
                  {state.isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {state.isProcessing ? 'Processing...' : 'Process Document'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Insurance Data Extracted Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Review and modify the extracted data below, then generate your
                analysis.
              </p>
            </div>
            {state.insuranceData && state.roofData && state.taskId && (
              <SteppedInsuranceReview
                taskId={state.taskId}
                roofData={state.roofData}
                insuranceData={state.insuranceData}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 3 }))}
                onNext={() => setState((prev) => ({ ...prev, currentStep: 5 }))}
              />
            )}
          </div>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Generate Analysis
              </CardTitle>
              <CardDescription>
                Ready to generate the final analysis report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  All steps completed. The system will now extract data from
                  both documents and redirect you to the review page.
                </p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousStep}>
                  Back
                </Button>
                <Button
                  onClick={generateAnalysis}
                  disabled={!state.taskId || state.isProcessing}
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={state.currentStep} />

      {/* Step Content */}
      {renderStepContent()}

      {/* Processing Indicator */}
      {state.isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Processing your document. This may take a moment...
          </p>
        </div>
      )}
    </div>
  );
}
