'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SteppedInsuranceReview } from './stepped-insurance-review';
import { type RoofReportData, type InsuranceReportData } from '@/lib/types/extraction';
import { type FileData } from '@/lib/types/files';

interface InsuranceReviewClientWrapperProps {
  taskId: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
  files: FileData[];
}

export function InsuranceReviewClientWrapper({
  taskId,
  roofData,
  insuranceData,
  files,
}: InsuranceReviewClientWrapperProps) {
  const router = useRouter();

  const handleNext = () => router.push(`/dashboard/${taskId}/analysis`);
  const handleBack = () => router.push(`/dashboard/${taskId}/insurance-report-upload`);

  return (
    <SteppedInsuranceReview
      taskId={taskId}
      roofData={roofData}
      insuranceData={insuranceData}
      files={files}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}