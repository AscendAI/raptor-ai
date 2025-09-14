'use client';

import { useRouter } from 'next/navigation';
import { SteppedInsuranceReview } from '@/components/review/stepped-insurance-review';
import { RoofReportData, InsuranceReportData } from '@/lib/schemas/extraction';

interface InsuranceReviewClientProps {
  taskId: string;
  roofData: RoofReportData;
  insuranceData: InsuranceReportData;
}

export function InsuranceReviewClient({
  taskId,
  roofData,
  insuranceData,
}: InsuranceReviewClientProps) {
  const router = useRouter();

  const handleNext = () => router.push(`/dashboard/analysis/${taskId}`);
  const handleBack = () => router.push(`/dashboard/insurance-report-upload/${taskId}`);

  return (
    <SteppedInsuranceReview
      taskId={taskId}
      roofData={roofData}
      insuranceData={insuranceData}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}

