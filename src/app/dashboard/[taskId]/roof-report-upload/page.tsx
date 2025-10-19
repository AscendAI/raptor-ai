import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { RoofReportUpload } from '@/components/upload-reports/roof-report-upload';

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default async function Page({ params }: PageProps) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const { taskId } = await params;
  const task = await getTaskData(session.user.id, taskId);

  if (!task) {
    notFound();
  }

  return (
    <WorkflowLayout
      title="Upload Roof Report"
      description="Upload your roof report and we will extract key details for review."
    >
      <RoofReportUpload taskId={taskId} />
    </WorkflowLayout>
  );
}
