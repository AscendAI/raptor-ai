'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { completeAnalysisWorkflow } from '@/lib/server/actions/completeAnalysisWorkflow';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';

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

interface AnalysisClientWrapperProps {
  taskId: string;
}

export function AnalysisClientWrapper({ taskId }: AnalysisClientWrapperProps) {
  const router = useRouter();
  const [steps, setSteps] = useState<AnalysisStep[]>(ANALYSIS_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStepStatus = useCallback(
    (index: number, status: AnalysisStep['status']) => {
      setSteps((prev) => {
        const newSteps = [...prev];
        newSteps[index] = { ...newSteps[index], status };
        return newSteps;
      });
    },
    []
  );

  const startAnalysis = useCallback(async () => {
    try {
      setError(null);

      // Validate prerequisites
      const reviewData = await getUserReviewData(taskId);
      if (!reviewData.success || !reviewData.data) {
        throw new Error(reviewData.error || 'Task not found');
      }
      const { roofData, insuranceData } = reviewData.data;
      if (!roofData || !insuranceData) {
        if (!roofData) {
          setError('Roof data not found. Redirecting to roof upload...');
          setTimeout(() => router.push(`/dashboard/${taskId}/roof-report-upload`), 2000);
        } else if (!insuranceData) {
          setError('Insurance data not found. Redirecting to insurance upload...');
          setTimeout(() => router.push(`/dashboard/${taskId}/insurance-report-upload`), 2000);
        }
        throw new Error(
          'Task is missing required roof or insurance data. Please complete the previous steps.'
        );
      }

      // Step 1: Processing
      setCurrentStepIndex(0);
      updateStepStatus(0, 'running');
      const analysisPromise = completeAnalysisWorkflow(taskId);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      updateStepStatus(0, 'completed');

      // Step 2: Comparing
      setCurrentStepIndex(1);
      updateStepStatus(1, 'running');
      await new Promise((resolve) => setTimeout(resolve, 12000));
      updateStepStatus(1, 'completed');

      // Step 3: Generating Analysis (wait for actual background analysis)
      setCurrentStepIndex(2);
      updateStepStatus(2, 'running');
      const result = await analysisPromise;
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate analysis');
      }
      updateStepStatus(2, 'completed');

      // Step 4: Finalizing
      setCurrentStepIndex(3);
      updateStepStatus(3, 'running');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStepStatus(3, 'completed');

      setIsComplete(true);

      // Navigate to results
      router.push(`/dashboard/${taskId}/results`);
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setCurrentStepIndex(0);
      setIsComplete(false);
      updateStepStatus(0, 'error');
    }
  }, [router, taskId, updateStepStatus]);

  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  const handleRetry = () => {
    setSteps(ANALYSIS_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setCurrentStepIndex(0);
    setIsComplete(false);
    setError(null);
    startAnalysis();
  };

  const handleGoBack = () => {
    router.push(`/dashboard/${taskId}/insurance-report-review`);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analysis Progress
        </CardTitle>
        <CardDescription>
          Processing your roof and insurance reports to generate comprehensive analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex-shrink-0">
                {step.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                {step.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {step.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                {step.status === 'pending' && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{step.title}</p>
                  {currentStepIndex === idx && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              <div className="ml-auto">
                <Badge
                  variant={
                    step.status === 'completed'
                      ? 'default'
                      : step.status === 'error'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-md border border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">Analysis Failed</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>

            <div className="flex gap-2 mt-3">
              <Button onClick={handleRetry} size="sm">
                Retry Analysis
              </Button>
              <Button variant="outline" onClick={handleGoBack} size="sm">
                Go Back
              </Button>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="p-4 rounded-md border bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-700 font-medium">Analysis Complete</p>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Redirecting to results...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}