import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData } from '@/lib/server/cache';
import { InsuranceReviewClient } from '@/components/review/insurance-review-client';
import { redirect } from 'next/navigation';

export default async function InsuranceReportReviewPage({
  params,
}: {
  params: { taskId: string };
}) {
  const taskId = params.taskId;
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) return redirect('/auth');

  const task = await getCachedTaskData(userId, taskId);

  if (!task?.roofData || !task?.insuranceData) {
    return (
      <WorkflowLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Task Not Ready</CardTitle>
            <CardDescription>
              {task?.roofData
                ? 'Insurance data not found. Please upload insurance report first.'
                : 'Roof data not found. Please upload roof report first.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={
                task?.roofData
                  ? `/dashboard/insurance-report-upload/${taskId}`
                  : `/dashboard/roof-report-upload/${taskId}`
              }
              className="underline"
            >
              Go to Upload
            </Link>
          </CardContent>
        </Card>
      </WorkflowLayout>
    );
  }

  return (
    <WorkflowLayout
      title="Review Insurance Data"
      description="Review and edit the extracted insurance report data before generating analysis"
    >
      <div className="max-w-4xl mx-auto">
        <InsuranceReviewClient
          taskId={taskId}
          roofData={task.roofData}
          insuranceData={task.insuranceData}
        />
      </div>
    </WorkflowLayout>
  );
}
