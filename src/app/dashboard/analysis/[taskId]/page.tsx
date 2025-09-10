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
import { Loader2, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { completeAnalysisWorkflow } from '@/lib/server/actions';
import { WorkflowLayout } from '@/components/common/workflow-layout';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'processing',
    title: 'Processing Data',
    description: 'Preparing roof and insurance data for analysis',
    status: 'pending',
  },
  {
    id: 'comparison',
    title: 'Comparing Reports',
    description: 'Analyzing differences between reports',
    status: 'pending',
  },
  {
    id: 'generating',
    title: 'Generating Analysis',
    description: 'Creating comprehensive comparison report',
    status: 'pending',
  },
  {
    id: 'finalizing',
    title: 'Finalizing Results',
    description: 'Preparing final analysis report',
    status: 'pending',
  },
];

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [steps, setSteps] = useState<AnalysisStep[]>(ANALYSIS_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStepStatus = (
    stepIndex: number,
    status: 'pending' | 'running' | 'completed' | 'error'
  ) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status } : step
      )
    );
  };

  const startAnalysis = async () => {
    try {
      console.log('Starting analysis for task:', taskId);

      // Step 1: Processing Data - Validate task exists
      setCurrentStepIndex(0);
      updateStepStatus(0, 'running');

      // First, verify the task exists and has required data
      const { getUserReviewData } = await import('@/lib/server/actions');
      const taskData = await getUserReviewData(taskId);

      console.log('Task data retrieved:', taskData);

      if (!taskData.success) {
        console.error('Task retrieval failed:', taskData.error);
        throw new Error(taskData.error || 'Task not found or invalid');
      }

      if (!taskData.data?.roofData || !taskData.data?.insuranceData) {
        console.error(
          'Missing data - roofData:',
          !!taskData.data?.roofData,
          'insuranceData:',
          !!taskData.data?.insuranceData
        );
        // Redirect back to appropriate step if data is missing
        if (!taskData.data?.roofData) {
          toast.error('Roof data not found. Redirecting to roof upload...');
          setTimeout(
            () => router.push(`/dashboard/roof-report-upload/${taskId}`),
            2000
          );
        } else if (!taskData.data?.insuranceData) {
          toast.error(
            'Insurance data not found. Redirecting to insurance upload...'
          );
          setTimeout(
            () => router.push(`/dashboard/insurance-report-upload/${taskId}`),
            2000
          );
        }
        throw new Error(
          'Task is missing required roof or insurance data. Please complete the previous steps.'
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing
      updateStepStatus(0, 'completed');

      // Step 2: Comparing Reports
      setCurrentStepIndex(1);
      updateStepStatus(1, 'running');
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate comparison
      updateStepStatus(1, 'completed');

      // Step 3: Generating Analysis
      setCurrentStepIndex(2);
      updateStepStatus(2, 'running');

      // This is where the actual analysis happens
      const result = await completeAnalysisWorkflow(taskId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate analysis');
      }

      updateStepStatus(2, 'completed');

      // Step 4: Finalizing Results
      setCurrentStepIndex(3);
      updateStepStatus(3, 'running');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate finalization
      updateStepStatus(3, 'completed');

      setIsComplete(true);
      toast.success('Analysis completed successfully!');

      // Redirect to results page after a brief delay
      setTimeout(() => {
        router.push(`/dashboard/results/${taskId}`);
      }, 1500);
    } catch (err) {
      console.error('Error during analysis:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      updateStepStatus(currentStepIndex, 'error');
      toast.error('Analysis failed: ' + errorMessage);
    }
  };

  useEffect(() => {
    if (!taskId) {
      toast.error('Invalid task ID');
      router.push('/dashboard');
      return;
    }

    // Add a small delay to ensure any navigation is complete
    const timer = setTimeout(() => {
      startAnalysis();
    }, 500);

    return () => clearTimeout(timer);
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    setSteps(ANALYSIS_STEPS.map((step) => ({ ...step, status: 'pending' })));
    setCurrentStepIndex(0);
    setIsComplete(false);
    setError(null);
    startAnalysis();
  };

  const handleGoBack = () => {
    router.push(`/dashboard/insurance-report-review/${taskId}`);
  };

  return (
    <WorkflowLayout
      title="Generating Analysis"
      description="Please wait while we analyze your documents and generate the comparison report"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analysis Progress
          </CardTitle>
          <CardDescription>
            Processing your roof and insurance reports to generate comprehensive
            analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 rounded-lg border"
              >
                <div className="flex-shrink-0">
                  {step.status === 'running' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {step.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {step.status === 'pending' && (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
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
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Success Message */}
          {isComplete && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-700 font-medium">Analysis Complete!</p>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Redirecting to results page...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-700 font-medium">Analysis Failed</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>

              {error.includes('Task not found') && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                  <p className="text-red-700 text-sm font-medium">
                    Possible Solutions:
                  </p>
                  <ul className="text-red-600 text-sm mt-1 list-disc list-inside space-y-1">
                    <li>Start a new analysis from the dashboard</li>
                    <li>
                      Make sure you completed the roof and insurance upload
                      steps
                    </li>
                    <li>Check that your task ID is valid</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button onClick={handleRetry} size="sm">
                  Retry Analysis
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="sm"
                >
                  Back to Dashboard
                </Button>
                <Button onClick={handleGoBack} variant="outline" size="sm">
                  Go Back
                </Button>
              </div>
            </div>
          )}

          {/* Loading Footer */}
          {!isComplete && !error && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                This process typically takes 30-60 seconds
              </p>
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                disabled={currentStepIndex >= 2} // Disable cancel once actual analysis starts
              >
                Cancel Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}
