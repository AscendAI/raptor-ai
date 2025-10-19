import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { InsuranceReviewClientWrapper } from '@/components/review/insurance-review-client-wrapper';
import { type RoofReportData, type InsuranceReportData } from '@/lib/types/extraction';
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

  if (!task.insuranceData) {
    return (
      <RedirectWithNotice
        to={`/dashboard/${taskId}/insurance-report-upload`}
        message="Please upload your insurance report before reviewing data."
        title="Insurance Data Missing"
      />
    );
  }

  if (!task.roofData) {
    return (
      <RedirectWithNotice
        to={`/dashboard/${taskId}/roof-report-review`}
        message="Please review roof data before reviewing insurance data."
        title="Prerequisite Not Met"
      />
    );
  }

  const currentStep = 4;
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
        step.id === 'analysis-results'
          ? 'Results not generated yet. Finish reviews and start analysis.'
          : 'Complete previous steps first.';
    }
  });

  if (isAnalysisDone) {
    hrefMap['analysis-results'] = `/dashboard/${taskId}/results`;
    delete tooltipMap['analysis-results'];
  } else {
    delete hrefMap['analysis-results'];
    tooltipMap['analysis-results'] = 'Results not generated yet. Finish reviews and start analysis.';
  }

  return (
    <WorkflowLayout
      title="Review Insurance Data"
      description="Review and edit the extracted insurance report data before generating analysis"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={currentStep}
      hrefMap={hrefMap}
      tooltipMap={Object.keys(tooltipMap).length ? tooltipMap : undefined}
    >
      <div className="w-full">
        <InsuranceReviewClientWrapper
          taskId={taskId}
          roofData={task.roofData as RoofReportData}
          insuranceData={task.insuranceData as InsuranceReportData}
          files={task.files || []}
        />
      </div>
    </WorkflowLayout>
  );
}
