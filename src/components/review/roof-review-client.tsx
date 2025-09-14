'use client';

import { useRouter } from 'next/navigation';
import { SteppedRoofReview } from '@/components/review/stepped-roof-review';
import { RoofReportData } from '@/lib/schemas/extraction';

interface RoofReviewClientProps {
  taskId: string;
  roofData: RoofReportData;
}

export function RoofReviewClient({ taskId, roofData }: RoofReviewClientProps) {
  const router = useRouter();

  const handleNext = () => router.push(`/dashboard/insurance-report-upload/${taskId}`);
  const handleBack = () => router.push(`/dashboard/roof-report-upload/${taskId}`);

  return (
    <SteppedRoofReview
      taskId={taskId}
      roofData={roofData}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}

