import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { AnalysisClientWrapper } from '@/components/analysis/analysis-client-wrapper';
import { getStepRoutesForTask } from '@/lib/constants/workflow';
import { RedirectWithNotice } from '@/components/common/redirect-with-notice';

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
  if (!task) {
    redirect('/dashboard');
  }

  if (!task.roofData) {
    return (
      <RedirectWithNotice
        to={`/dashboard/${taskId}/roof-report-upload`}
        message="Roof data is required before starting analysis."
        title="Prerequisite Not Met"
      />
    );
  }

  if (!task.insuranceData) {
    return (
      <RedirectWithNotice
        to={`/dashboard/${taskId}/insurance-report-upload`}
        message="Insurance data is required before starting analysis."
        title="Prerequisite Not Met"
      />
    );
  }

  // If analysis already completed, go to results
  if (task.comparison) {
    redirect(`/dashboard/${taskId}/results`);
  }

  // Build href map for the step indicator: keep last step clickable to analysis
  const hrefMap = getStepRoutesForTask(taskId);

  return (
    <WorkflowLayout
      title="Generating Analysis"
      description="Please wait while we analyze your documents and generate the comparison report"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={5}
      hrefMap={hrefMap}
    >
      <AnalysisClientWrapper taskId={taskId} />
    </WorkflowLayout>
  );
}
