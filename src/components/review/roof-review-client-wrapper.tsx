'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SteppedRoofReview } from './stepped-roof-review';
import { type RoofReportData } from '@/lib/types/extraction';
import { type FileData } from '@/lib/types/files';

interface RoofReviewClientWrapperProps {
  taskId: string;
  roofData: RoofReportData;
  files: FileData[];
}

export function RoofReviewClientWrapper({ taskId, roofData, files }: RoofReviewClientWrapperProps) {
  const router = useRouter();

  const handleNext = () => router.push(`/dashboard/${taskId}/insurance-report-upload`);
  const handleBack = () => router.push(`/dashboard/${taskId}/roof-report-upload`);

  return (
    <SteppedRoofReview
      taskId={taskId}
      roofData={roofData}
      files={files}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}