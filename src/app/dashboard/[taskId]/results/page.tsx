import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { ResultsClientWrapper } from '@/components/results/results-client-wrapper';
import { getAnalysisResults } from '@/lib/server/actions/getAnalysisResults';
import { type ComparisonResult } from '@/lib/types/comparison';
import { getStepRoutesForTask } from '@/lib/constants/workflow';
import { RedirectWithNotice } from '@/components/common/redirect-with-notice';
import { getTaskData } from '@/lib/server/db/services/tasksService';

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { taskId } = await params;
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const task = await getTaskData(session.user.id, taskId);
  const result = await getAnalysisResults(taskId);
  if (!result.success || !result.data) {
    return (
      <RedirectWithNotice
        to={`/dashboard/${taskId}/analysis`}
        message="Analysis has not started or is incomplete. Redirecting to analysis..."
        title="Results Not Available"
      />
    );
  }

  const comparison: ComparisonResult =
    typeof result.data.comparison === 'string'
      ? JSON.parse(result.data.comparison)
      : (result.data.comparison as ComparisonResult);

  // Ensure the step indicator keeps the last step pointing to results (not analysis)
  const hrefMap = getStepRoutesForTask(taskId);
  hrefMap['analysis-results'] = `/dashboard/${taskId}/results`;

  return (
    <WorkflowLayout
      title="Analysis Results"
      description="Review the generated comparison between roof and insurance reports"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={5}
      hrefMap={hrefMap}
    >
      <ResultsClientWrapper taskId={taskId} comparison={comparison} />
    </WorkflowLayout>
  );
}
