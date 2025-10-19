import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { RoofReviewClientWrapper } from '@/components/review/roof-review-client-wrapper';
import { type RoofReportData } from '@/lib/types/extraction';
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
        to={`/dashboard/${taskId}/roof-report-upload`}
        message="Please upload your roof report before reviewing data."
        title="Roof Data Missing"
      />
    );
  }

  const currentStep = 2;
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
        step.id === 'insurance-upload'
          ? 'Complete roof review first to upload insurance report.'
          : step.id === 'insurance-review'
          ? 'Upload insurance report to review its data.'
          : step.id === 'analysis-results'
          ? 'Results not generated yet. Finish reviews and start analysis.'
          : 'Complete previous steps first.';
    }
  });

  if (isAnalysisDone) {
    hrefMap['analysis-results'] = `/dashboard/${taskId}/results`;
    delete tooltipMap['analysis-results'];
  }

  return (
    <WorkflowLayout
      title="Review Roof Data"
      description="Review and edit the extracted roof report data before proceeding"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={currentStep}
      hrefMap={hrefMap}
      tooltipMap={Object.keys(tooltipMap).length ? tooltipMap : undefined}
    >
      <div className="w-full">
        <RoofReviewClientWrapper
          taskId={taskId}
          roofData={task.roofData as RoofReportData}
          files={task.files || []}
        />
      </div>
    </WorkflowLayout>
  );
}
