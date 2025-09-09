'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';
import { ComparisonResult } from '@/lib/schemas/comparison';
import { getAnalysisResults } from '@/lib/server/actions';
import { ComparisonResults } from '@/components/results/comparison-results';
import { toast } from 'sonner';

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

  useEffect(() => {
    loadAnalysisResults();
  }, [taskId]);

  const loadAnalysisResults = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const result = await getAnalysisResults(taskId);
      
      if (result.success && result.data) {
        setState({
          loading: false,
          result: {
            roofData: result.data.roofData,
            insuranceData: result.data.insuranceData,
            comparison: typeof result.data.comparison === 'string' 
              ? JSON.parse(result.data.comparison) 
              : result.data.comparison
          },
          error: null
        });
      } else {
        setState({
          loading: false,
          result: null,
          error: result.error || 'Analysis results not found'
        });
      }
    } catch (error) {
      console.error('Error loading analysis results:', error);
      setState({
        loading: false,
        result: null,
        error: 'Failed to load analysis results'
      });
    }
  };

  const handleDownloadReport = () => {
    if (!state.result) return;
    
    const comparison = state.result.comparison;
    const reportContent = `# Roof vs Insurance Report Analysis

## Summary
- Total Checkpoints: ${comparison.summary.total}
- Matching (Green): ${comparison.summary.green}
- Discrepancies (Red): ${comparison.summary.red}
- Missing Data: ${comparison.summary.missing}

## Detailed Comparison
${comparison.comparisons.map(item => 
  `### ${item.checkpoint}
**Status:** ${item.status.toUpperCase()}
**Roof Report:** ${item.roof_report_value || 'N/A'}
**Insurance Report:** ${item.insurance_report_value || 'N/A'}
**Notes:** ${item.notes}
`
).join('\n')}`;
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Loading analysis results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Analysis Results</h1>
                  <p className="text-muted-foreground text-sm">
                    Final comparison analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Results Not Available</CardTitle>
              <CardDescription>
                {state.error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The analysis has been completed, but the detailed results are no longer stored in the system. 
                This is normal behavior as sessions are cleaned up after successful completion.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Start New Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Analysis Results</h1>
                <p className="text-muted-foreground text-sm">
                  Final comparison analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Task: {taskId.slice(-8)}</Badge>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Analysis Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Comparison Analysis</CardTitle>
                <CardDescription>
                  AI-generated analysis comparing roof report data with insurance report data
                </CardDescription>
              </div>
              <Button onClick={handleDownloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardHeader>
            <CardContent>
              {state.result?.comparison && (
                <ComparisonResults data={state.result.comparison} />
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium">Analysis Complete</h3>
                  <p className="text-sm text-muted-foreground">
                    Your analysis has been completed successfully. You can download the report or start a new analysis.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/new')}
                  >
                    New Analysis
                  </Button>
                  <Button onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}