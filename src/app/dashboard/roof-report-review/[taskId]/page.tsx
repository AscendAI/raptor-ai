import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData } from '@/lib/server/cache';
import { RoofReviewClient } from '@/components/review/roof-review-client';
import { redirect } from 'next/navigation';

export default async function RoofReportReviewPage({
  params,
}: {
  params: { taskId: string };
}) {
  const taskId = params.taskId;
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) return redirect('/auth');

  const task = await getCachedTaskData(userId, taskId);

  if (!task?.roofData) {
    return (
      <WorkflowLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Task Not Ready</CardTitle>
            <CardDescription>
              Roof data not found. Please upload the roof report first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/roof-report-upload/${taskId}`} className="underline">
              Go to Roof Upload
            </Link>
          </CardContent>
        </Card>
      </WorkflowLayout>
    );
  }

  return (
    <WorkflowLayout
      title="Review Roof Data"
      description="Review and edit the extracted roof report data before proceeding"
    >
      <div className="max-w-4xl mx-auto">
        <RoofReviewClient taskId={taskId} roofData={task.roofData} />
      </div>
    </WorkflowLayout>
  );
}
