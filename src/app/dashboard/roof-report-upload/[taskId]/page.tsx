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
import { RoofReportUploader } from '@/components/upload/roof-report-uploader';
import { redirect } from 'next/navigation';

export default async function RoofReportUploadPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
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
              The specified task could not be found.
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
      title="Upload Roof Report"
      description="Upload your roofing document to begin the analysis process"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Roof Report Document
          </CardTitle>
          <CardDescription>
            Please upload your roof inspection report (PDF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RoofReportUploader taskId={taskId} taskFiles={task.files || []} />
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}
