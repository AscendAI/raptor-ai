'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Save,
  X as XIcon,
  Loader2,
} from 'lucide-react';
import { BsFilePdfFill } from 'react-icons/bs';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { type FileData } from '@/lib/types/files';
import { type InsuranceReportData } from '@/lib/types/extraction';
import { toast } from 'sonner';
import { UnifiedComparisonResults } from '@/components/results/UnifiedComparisonResults';
import { type ComparisonResult } from '@/lib/types/comparison';
import {
  evaluatePriceListVsInsuranceDate,
  type PriceListDateStatus,
} from '@/lib/utils/compare-pricelist-date';
import { cn } from '@/lib/utils';
import { saveComparisonResults } from '@/lib/server/actions/saveComparisonResults';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedComparison, setEditedComparison] =
    useState<ComparisonResult>(comparison);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveComparison = async () => {
    try {
      setIsSaving(true);
      toast.info('Saving comparison results...');

      const result = await saveComparisonResults(taskId, editedComparison);

      if (result.success) {
        toast.success('Comparison results saved successfully!');
        setIsEditMode(false);
        // Refresh the page to get updated data
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save comparison results');
      }
    } catch (error) {
      console.error('Error saving comparison results:', error);
      toast.error('Failed to save comparison results');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedComparison(comparison);
    setIsEditMode(false);
    toast.info('Edit cancelled');
  };

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
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-emerald-900">
                Analysis Complete
              </h1>
              <p className="text-emerald-700 text-sm mt-1">
                Your roof vs insurance report comparison has been successfully
                completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <Button
                  onClick={handleSaveComparison}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit Results
                </button>
                {(roofPdfFile || insurancePdfFile) && (
                  <button
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    {showPdfPreview ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Reports
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Reports
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Basic Information */}
      {insuranceData && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Insurance Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Key information extracted from the insurance estimate
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Claim ID
              </div>
              <div className="text-sm font-mono text-gray-900 break-all">
                {insuranceData.claim_id || '—'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Date
              </div>
              <div className="text-sm font-mono text-gray-900">
                {insuranceData.date || '—'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Price List
                  </div>
                  <div className="text-sm font-mono text-gray-900">
                    {insuranceData.price_list || '—'}
                  </div>
                </div>
                {priceListStatus && (
                  <div className="ml-4">
                    <div
                      className={cn(
                        'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border text-center',
                        {
                          'bg-emerald-50 text-emerald-700 border-emerald-200':
                            priceListStatus.status === 'pass',
                          'bg-red-50 text-red-700 border-red-200':
                            priceListStatus.status === 'failed',
                          'bg-amber-50 text-amber-700 border-amber-200':
                            priceListStatus.status === 'warning',
                        }
                      )}
                    >
                      {priceListStatus.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
          <UnifiedComparisonResults
            data={editedComparison}
            isEditable={isEditMode}
            onChange={isEditMode ? setEditedComparison : undefined}
          />
        </div>
        {showPdfPreview && (roofPdfFile || insurancePdfFile) && (
          <div className="xl:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-2 overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BsFilePdfFill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">PDF Preview</h3>
                    <p className="text-sm text-gray-600">
                      {activeTab === 'roof'
                        ? 'Original roof report document'
                        : 'Original insurance report document'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('roof')}
                    disabled={!roofPdfFile}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      activeTab === 'roof'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
                      !roofPdfFile && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Roof Report
                  </button>
                  <button
                    onClick={() => setActiveTab('insurance')}
                    disabled={!insurancePdfFile}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      activeTab === 'insurance'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
                      !insurancePdfFile && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    Insurance Report
                  </button>
                </div>
              </div>
              <div className="relative h-[calc(100vh-200px)] min-h-[600px]">
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
                  <div className="p-4 text-sm text-gray-500 text-center">
                    Selected report file not available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Export & Actions
            </h2>
            <p className="text-sm text-gray-600">
              Download your analysis report or explore additional options
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Analysis Report
              </h3>
              <p className="text-sm text-gray-600">
                Save the analysis in Markdown format for offline review and
                documentation
              </p>
            </div>
            <div className="flex gap-3 ml-4">
              <Button
                onClick={handleDownloadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
