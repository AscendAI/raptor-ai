'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, CheckCircle } from 'lucide-react';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';
import { ComparisonResult } from '@/lib/schemas/comparison';
import { getAnalysisResults } from '@/lib/server/actions';
import { ComparisonResults } from '@/components/results/comparison-results';
import { toast } from 'sonner';
import { WorkflowLayout } from '@/components/common/workflow-layout';

interface AnalysisResult {
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  comparison: ComparisonResult;
}

interface ResultsPageState {
  loading: boolean;
  result: AnalysisResult | null;
  error: string | null;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [state, setState] = useState<ResultsPageState>({
    loading: true,
    result: null,
    error: null,
  });

  const loadAnalysisResults = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const result = await getAnalysisResults(taskId);

      if (result.success && result.data) {
        setState({
          loading: false,
          result: {
            roofData: result.data.roofData,
            insuranceData: result.data.insuranceData,
            comparison:
              typeof result.data.comparison === 'string'
                ? JSON.parse(result.data.comparison)
                : result.data.comparison,
          },
          error: null,
        });
      } else {
        setState({
          loading: false,
          result: null,
          error: result.error || 'Analysis results not found',
        });
      }
    } catch (error) {
      console.error('Error loading analysis results:', error);
      setState({
        loading: false,
        result: null,
        error: 'Failed to load analysis results',
      });
    }
  }, [taskId]);

  useEffect(() => {
    loadAnalysisResults();
  }, [loadAnalysisResults]);

  const handleDownloadReport = () => {
    if (!state.result) return;

    const comparison = state.result.comparison;
    const reportContent = `# Roof vs Insurance Report Analysis

## Summary
- Total Checkpoints: ${comparison.summary.total}
- Matching (Pass): ${comparison.summary.pass}
- Discrepancies (Failed): ${comparison.summary.failed}
- Missing Data: ${comparison.summary.missing}

## Detailed Comparison
${comparison.comparisons
  .map(
    (item) =>
      `### ${item.checkpoint}
**Status:** ${item.status.toUpperCase()}
**Roof Report:** ${item.roof_report_value || 'N/A'}
**Insurance Report:** ${item.insurance_report_value || 'N/A'}
**Notes:** ${item.notes}
`
  )
  .join('\n')}`;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-report-${taskId.slice(-8)}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  if (state.loading) {
    return (
      <WorkflowLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading analysis results...</p>
          </div>
        </div>
      </WorkflowLayout>
    );
  }

  if (state.error) {
    return (
      <WorkflowLayout
        title="Analysis Results"
        description="Final comparison analysis"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              Results Not Available
            </CardTitle>
            <CardDescription>{state.error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The analysis has been completed, but the detailed results are no
              longer stored in the system. This is normal behavior as sessions
              are cleaned up after successful completion.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </WorkflowLayout>
    );
  }

  return (
    <WorkflowLayout
      title="Analysis Results"
      description="Final comparison analysis"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Task Status Header */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Task: {taskId.slice(-8)}</Badge>
              <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                Analysis Complete
              </Badge>
            </div>
          </div>
        </div>

        {/* Analysis Results - No wrapper card, let the component handle its own layout */}
        {state.result?.comparison && (
          <ComparisonResults data={state.result.comparison} />
        )}

        {/* Actions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export & Actions
            </CardTitle>
            <CardDescription>
              Download your analysis report or start a new analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">Analysis Complete</p>
                <p className="text-sm text-muted-foreground">
                  Your comparison analysis has been completed successfully.
                  Download the report or start a new analysis when ready.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleDownloadReport}
                  variant="outline"
                  className="min-w-[140px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/dashboard/new-analysis');
                  }}
                  className="min-w-[120px]"
                >
                  New Analysis
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push('/dashboard');
                  }}
                  className="min-w-[120px]"
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkflowLayout>
  );
}
