'use client';

import { useState } from 'react';
import { PdfUploader } from '@/components/roofr/pdf-uploader';
import { RoofrReportViewer } from '@/components/roofr/report-viewer';
import { ErrorDisplay } from '@/components/roofr/error-display';
import type { RoofrReportJson } from '@/lib/roofr/types';

export default function RoofrAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<{
    documentHash: string;
    data: RoofrReportJson;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = (result: {
    documentHash: string;
    data: RoofrReportJson;
  }) => {
    setAnalysisResult(result);
    setError(null);
  };

  const handleError = (error: string) => {
    setError(error);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Roofr PDF Analyzer</h1>

      {!analysisResult ? (
        <>
          <p className="mb-6 text-gray-600">
            Upload a Roofr PDF report to extract measurements, waste
            recommendations, and material calculations.
          </p>
          <PdfUploader onSuccess={handleSuccess} onError={handleError} />

          {error && (
            <div className="mt-6">
              <ErrorDisplay error={error} onReset={handleReset} />
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={handleReset}
            className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded flex items-center text-sm"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Upload Another PDF
          </button>

          <RoofrReportViewer
            data={analysisResult.data}
            documentHash={analysisResult.documentHash}
          />
        </>
      )}
    </div>
  );
}
