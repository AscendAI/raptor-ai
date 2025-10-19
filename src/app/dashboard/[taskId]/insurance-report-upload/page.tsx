import React from 'react';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { InsuranceReportUpload } from '@/components/upload-reports/insurance-report-upload';

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
    // Ensure roof step is completed before insurance upload
    redirect(`/dashboard/${taskId}/roof-report-review`);
  }

  return (
    <WorkflowLayout
      title="Upload Insurance Report"
      description="Upload your insurance document to continue the analysis process"
    >
      <InsuranceReportUpload taskId={taskId} />
    </WorkflowLayout>
  );
}
