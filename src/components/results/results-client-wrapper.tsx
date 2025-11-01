'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, FileText, Eye, EyeOff } from 'lucide-react';
import { BsFilePdfFill } from 'react-icons/bs';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { type FileData } from '@/lib/types/files';
import { type InsuranceReportData } from '@/lib/types/extraction';
import { toast } from 'sonner';
import { MultiStructureComparisonResults } from '@/components/results/multi-structure-comparison-results';
import { type ComparisonResult } from '@/lib/types/comparison';
import {
  evaluatePriceListVsInsuranceDate,
  type PriceListDateStatus,
} from '@/lib/utils/compare-pricelist-date';

interface ResultsClientWrapperProps {
  taskId: string;
  comparison: ComparisonResult;
  files: FileData[];
  insuranceData?: InsuranceReportData;
}

export function ResultsClientWrapper({
  taskId,
  comparison,
  files,
  insuranceData,
}: ResultsClientWrapperProps) {
  const router = useRouter();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'roof' | 'insurance'>('roof');

  const roofPdfFile = files.find(
    (file) => file.name.includes('roofReport') && file.name.endsWith('.pdf')
  );
  const insurancePdfFile = files.find(
    (file) =>
      file.name.includes('insuranceReport') && file.name.endsWith('.pdf')
  );

  const priceListStatus: PriceListDateStatus | null = React.useMemo(() => {
    if (!insuranceData) return null;
    // Compare using only insurance date and price list
    return evaluatePriceListVsInsuranceDate(
      insuranceData.price_list,
      insuranceData.date
    );
  }, [insuranceData]);

  const handleDownloadReport = () => {
    const reportContent = `# Roof vs Insurance Report Analysis\n\n## Summary\n- Total Checkpoints: ${comparison.summary.total}\n- Matching (Pass): ${comparison.summary.pass}\n- Discrepancies (Failed): ${comparison.summary.failed}\n- Missing Data: ${comparison.summary.missing}\n\n## Detailed Comparison\n${
      comparison.comparisons
        ? comparison.comparisons
            .map(
              (item) =>
                `### ${item.checkpoint}\n**Status:** ${item.status.toUpperCase()}\n**Roof Report:** ${item.roof_report_value || 'N/A'}\n**Insurance Report:** ${item.insurance_report_value || 'N/A'}\n**Notes:** ${item.notes}${item.warning ? `\n**Warning:** ${item.warning}` : ''}\n`
            )
            .join('\n')
        : comparison.structures
          ? comparison.structures
              .map(
                (structure) =>
                  `## Structure ${structure.structureNumber}\n${structure.comparisons
                    .map(
                      (item) =>
                        `### ${item.checkpoint}\n**Status:** ${item.status.toUpperCase()}\n**Roof Report:** ${item.roof_report_value || 'N/A'}\n**Insurance Report:** ${item.insurance_report_value || 'N/A'}\n**Notes:** ${item.notes}${item.warning ? `\n**Warning:** ${item.warning}` : ''}\n`
                    )
                    .join('\n')}`
              )
              .join('\n\n')
          : 'No comparison data available'
    }`;
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
            Your roof vs insurance report comparison has been successfully
            completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
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

      {/* Insurance Basic Information */}
      {insuranceData && (
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Insurance Details</CardTitle>
            <CardDescription>
              Basic information extracted from the insurance estimate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground">Claim ID</div>
                <div className="text-sm font-medium break-all">
                  {insuranceData.claim_id || '—'}
                </div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="text-sm font-medium">
                  {insuranceData.date || '—'}
                </div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground">Price List</div>
                <div className="text-sm font-medium">
                  {insuranceData.price_list || '—'}
                </div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30 sm:col-span-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {priceListStatus ? (
                    <Badge
                      variant="outline"
                      className={
                        priceListStatus.status === 'pass'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : priceListStatus.status === 'failed'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                      }
                      title={priceListStatus.message}
                    >
                      {priceListStatus.status.toUpperCase()}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">N/A</Badge>
                  )}
                  {priceListStatus && (
                    <div className="text-xs text-muted-foreground">
                      {priceListStatus.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results + PDF Preview */}
      <div
        className={`${showPdfPreview && (roofPdfFile || insurancePdfFile) ? 'grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6' : ''}`}
      >
        <div
          className={
            showPdfPreview && (roofPdfFile || insurancePdfFile)
              ? 'xl:col-span-1'
              : ''
          }
        >
          <MultiStructureComparisonResults data={comparison} />
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
                  {activeTab === 'roof'
                    ? 'Original roof report document'
                    : 'Original insurance report document'}
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
                    <div
                      className={`${activeTab === 'roof' ? 'block' : 'hidden'} absolute inset-0`}
                    >
                      <PDFViewer pdfUrl={roofPdfFile.url} className="h-full" />
                    </div>
                  )}
                  {insurancePdfFile && (
                    <div
                      className={`${activeTab === 'insurance' ? 'block' : 'hidden'} absolute inset-0`}
                    >
                      <PDFViewer
                        pdfUrl={insurancePdfFile.url}
                        className="h-full"
                      />
                    </div>
                  )}
                  {!roofPdfFile && !insurancePdfFile && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Selected report file not available.
                    </div>
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
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/${taskId}/insurance-report-review`)
                  }
                >
                  View Review Steps
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
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
