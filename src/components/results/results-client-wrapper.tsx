'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ComparisonResults } from '@/components/results/comparison-results';
import { type ComparisonResult } from '@/lib/types/comparison';

interface ResultsClientWrapperProps {
  taskId: string;
  comparison: ComparisonResult;
}

export function ResultsClientWrapper({ taskId, comparison }: ResultsClientWrapperProps) {
  const router = useRouter();

  const handleDownloadReport = () => {
    const reportContent = `# Roof vs Insurance Report Analysis\n\n## Summary\n- Total Checkpoints: ${comparison.summary.total}\n- Matching (Pass): ${comparison.summary.pass}\n- Discrepancies (Failed): ${comparison.summary.failed}\n- Missing Data: ${comparison.summary.missing}\n\n## Detailed Comparison\n${comparison.comparisons
      .map(
        (item) =>
          `### ${item.checkpoint}\n**Status:** ${item.status.toUpperCase()}\n**Roof Report:** ${item.roof_report_value || 'N/A'}\n**Insurance Report:** ${item.insurance_report_value || 'N/A'}\n**Notes:** ${item.notes}\n`
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

  return (
    <div className="space-y-8">
      {/* Header Summary */}
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analysis Complete
          </CardTitle>
          <CardDescription>
            Your roof vs insurance report comparison has been successfully completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
              Analysis Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      <ComparisonResults data={comparison} />

      {/* Actions */}
      <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export & Actions
          </CardTitle>
          <CardDescription>
            Download your analysis report or start a new analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Save the analysis in Markdown format for offline review
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownloadReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => router.push(`/dashboard/${taskId}/insurance-report-review`)}>
                  View Review Steps
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}