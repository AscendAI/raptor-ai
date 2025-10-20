import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { RoofReportUpload } from '@/components/upload-reports/roof-report-upload';
import { getStepRoutesForTask, getStepsForIndicator } from '@/lib/constants/workflow';

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
    notFound();
  }

  const currentStep = 1;
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
        step.id === 'roof-review'
          ? 'Upload roof report to review data.'
          : step.id === 'insurance-upload'
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
  } else {
    delete hrefMap['analysis-results'];
    tooltipMap['analysis-results'] = 'Results not generated yet. Complete uploads and reviews first.';
  }

  return (
    <WorkflowLayout
      title="Upload Roof Report"
      description="Provide your roof inspection report to begin analysis"
      taskId={taskId}
      taskName={task?.name ?? undefined}
      currentStep={1}
      hrefMap={hrefMap}
      tooltipMap={tooltipMap}
    >
      <RoofReportUpload taskId={taskId} />
    </WorkflowLayout>
  );
}
