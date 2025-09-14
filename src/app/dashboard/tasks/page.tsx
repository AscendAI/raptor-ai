import { getAuthSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default async function TasksPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/auth');
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Tasks & Analysis
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your insurance claim supplements and analysis reports
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>All Tasks</span>
          </CardTitle>
          <CardDescription>Your complete task and analysis history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400 py-12">
            <ClipboardList className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-sm">
              Your tasks and analysis reports will appear here once you start creating them.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}