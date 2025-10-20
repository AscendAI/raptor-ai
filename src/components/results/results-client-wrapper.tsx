'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, Eye, EyeOff } from 'lucide-react';
import { BsFilePdfFill } from 'react-icons/bs';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { type FileData } from '@/lib/types/files';
import { toast } from 'sonner';
import { ComparisonResults } from '@/components/results/comparison-results';
import { type ComparisonResult } from '@/lib/types/comparison';

interface ResultsClientWrapperProps {
  taskId: string;
  comparison: ComparisonResult;
  files: FileData[];
}

export function ResultsClientWrapper({ taskId, comparison, files }: ResultsClientWrapperProps) {
  const router = useRouter();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'roof' | 'insurance'>('roof');

  const roofPdfFile = files.find(
    (file) => file.name.includes('roofReport') && file.name.endsWith('.pdf')
  );
  const insurancePdfFile = files.find(
    (file) => file.name.includes('insuranceReport') && file.name.endsWith('.pdf')
  );

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                Analysis Complete
              </Badge>
            </div>
            {(roofPdfFile || insurancePdfFile) && (
              <Button
                onClick={() => setShowPdfPreview(!showPdfPreview)}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border-emerald-200 text-emerald-700 hover:text-emerald-800 shadow-sm"
                variant="outline"
              >
                {showPdfPreview ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Report
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    View Report
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results + PDF Preview */}
      <div className={`${showPdfPreview && (roofPdfFile || insurancePdfFile) ? 'grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6' : ''}`}>
        <div className={showPdfPreview && (roofPdfFile || insurancePdfFile) ? 'xl:col-span-1' : ''}>
          <ComparisonResults data={comparison} />
        </div>
        {showPdfPreview && (roofPdfFile || insurancePdfFile) && (
          <div className="xl:col-span-1">
            <Card className="shadow-sm border-slate-200 sticky top-2 pb-0">
              <CardHeader className="py-0">
                <CardTitle className="text-base font-medium py-0 flex items-center gap-2">
                  <div className="p-2 bg-muted rounded-lg">
                    <BsFilePdfFill className="w-5 h-5 text-primary" />
                  </div>
                  PDF Preview
                </CardTitle>
                <CardDescription className="text-sm py-0">
                  {activeTab === 'roof' ? 'Original roof report document' : 'Original insurance report document'}
                </CardDescription>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant={activeTab === 'roof' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('roof')}
                    disabled={!roofPdfFile}
                  >
                    Roof Report
                  </Button>
                  <Button
                    variant={activeTab === 'insurance' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('insurance')}
                    disabled={!insurancePdfFile}
                  >
                    Insurance Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[calc(100vh-130px)] min-h-[600px]">
                  {roofPdfFile && (
                    <div className={`${activeTab === 'roof' ? 'block' : 'hidden'} absolute inset-0`}>
                      <PDFViewer pdfUrl={roofPdfFile.url} className="h-full" />
                    </div>
                  )}
                  {insurancePdfFile && (
                    <div className={`${activeTab === 'insurance' ? 'block' : 'hidden'} absolute inset-0`}>
                      <PDFViewer pdfUrl={insurancePdfFile.url} className="h-full" />
                    </div>
                  )}
                  {!roofPdfFile && !insurancePdfFile && (
                    <div className="p-4 text-sm text-muted-foreground">Selected report file not available.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

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