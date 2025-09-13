import { WorkflowLayout } from "@/components/common/workflow-layout";
import { SteppedRoofReview } from '@/components/review/stepped-roof-review';
import { getAuthSession } from "@/lib/server/auth";
import { getCachedTaskData } from "@/lib/server/cache";
import { redirect } from "next/navigation";

export default async function TaskPage({
  params,
}: {
  params: { taskId: string };
}) {
  const taskId = params.taskId;
  const session = await getAuthSession();
  if (!session?.user.id) {
    return redirect("/login");
  }

  const task = await getCachedTaskData(session.user.id, taskId);

  return (
    <WorkflowLayout
      title="Review Roof Data"
      description="Review and edit the extracted roof report data before proceeding"
    >
      Testo
    </WorkflowLayout>
  );
}
