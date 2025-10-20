import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { InsuranceReportUpload } from '@/components/upload-reports/insurance-report-upload';
import { getStepRoutesForTask, getStepsForIndicator } from '@/lib/constants/workflow';
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
        to={`/dashboard/${taskId}/roof-report-review`}
        message="Please review roof data before uploading insurance report."
        title="Prerequisite Not Met"
      />
    );
  }

  const currentStep = 3;
  const steps = getStepsForIndicator();
  const baseHrefs = getStepRoutesForTask(taskId);
  const hrefMap = { ...baseHrefs };
  const tooltipMap: Record<string, string> = {};

  const isRoofDone = !!task.roofData;
  const isInsuranceDone = !!task.insuranceData;
  const isAnalysisDone = !!task.comparison;

  steps.forEach((step, idx) => {
    const num = idx + 1;
    const isFuture = num > currentStep;
    let done = false;
    switch (step.id) {
      case 'roof-upload':
      case 'roof-review':
        done = isRoofDone;
        break;
      case 'insurance-upload':
      case 'insurance-review':
        done = isInsuranceDone;
        break;
      case 'analysis-results':
        done = isAnalysisDone;
        break;
      default:
        done = false;
    }
    if (isFuture && !done) {
      delete hrefMap[step.id];
      tooltipMap[step.id] =
        step.id === 'insurance-review'
          ? 'Upload insurance report to review its data.'
          : step.id === 'analysis-results'
          ? 'Results not generated yet. Complete uploads and reviews first.'
          : 'Complete previous steps first.';
    }
  });

  if (isAnalysisDone) {
    hrefMap['analysis-results'] = `/dashboard/${taskId}/results`;
    delete tooltipMap['analysis-results'];
  } else {
    // Ensure last step is disabled until analysis is complete
    delete hrefMap['analysis-results'];
    tooltipMap['analysis-results'] = 'Results not generated yet. Complete uploads and reviews first.';
  }

  return (
    <WorkflowLayout
      title="Upload Insurance Report"
      description="Upload your insurance document to continue the analysis process"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={currentStep}
      hrefMap={hrefMap}
      tooltipMap={Object.keys(tooltipMap).length ? tooltipMap : undefined}
    >
      <InsuranceReportUpload taskId={taskId} />
    </WorkflowLayout>
  );
}
