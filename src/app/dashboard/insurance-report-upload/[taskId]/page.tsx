import { WorkflowLayout } from '@/components/common/workflow-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getAuthSession } from '@/lib/server/auth';
import { getCachedTaskData } from '@/lib/server/cache';
import { InsuranceReportUploader } from '@/components/upload/insurance-report-uploader';
import { redirect } from 'next/navigation';

export default async function InsuranceReportUploadPage({
  params,
}: {
  params: { taskId: string };
}) {
  const taskId = params.taskId;
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return redirect('/auth');
  }

  const task = await getCachedTaskData(userId, taskId);

  if (!task) {
    return (
      <WorkflowLayout>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Task Not Found</CardTitle>
            <CardDescription>
              The specified task could not be found or does not have roof data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard" className="underline">
              Return to Dashboard
            </Link>
          </CardContent>
        </Card>
      </WorkflowLayout>
    );
  }

  return (
    <WorkflowLayout
      title="Upload Insurance Report"
      description="Upload your insurance document to continue the analysis process"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Insurance Report Document
          </CardTitle>
          <CardDescription>
            Please upload your insurance claim report (PDF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <InsuranceReportUploader taskId={taskId} taskFiles={task.files || []} />
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}
