import { getAuthSession } from '@/lib/server/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, ClipboardList, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { listUserTasks } from '@/lib/server/db/model/task';

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/auth');
  }

  const tasks = await listUserTasks(session.user.id);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Welcome back, {session.user.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Ready to streamline your insurance claim supplements?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 mb-8">
        <Link href="/dashboard/new-analysis">
          <Button
            size="lg"
            className="px-8 py-4 text-lg h-14"
            variant="gradient"
          >
            <FileText className="h-5 w-5 mr-3" />
            New Analysis
          </Button>
        </Link>
        <Link href="/dashboard/tasks">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-4 text-lg h-14"
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            View Tasks
          </Button>
        </Link>
      </div>

      {/* Recent Tasks */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span>Recent Tasks & Analysis</span>
          </CardTitle>
          <CardDescription>
            Your latest work and analysis reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((t) => {
                const isCompleted = !!t.comparison;
                const statusLabel = isCompleted ? 'Completed' : 'In Progress';
                const statusClass = isCompleted
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
                const primaryHref = isCompleted
                  ? `/dashboard/${t.id}/results`
                  : !t.roofData
                  ? `/dashboard/${t.id}/roof-report-upload`
                  : !t.insuranceData
                  ? `/dashboard/${t.id}/insurance-report-upload`
                  : `/dashboard/${t.id}/analysis`;
                const actionLabel = isCompleted ? 'View' : 'Resume';
                const displayTitle = t.name || `Task ${t.id.slice(-8)}`;
                const updatedDate =
                  t.updatedAt instanceof Date
                    ? t.updatedAt
                    : new Date(t.updatedAt as unknown as string);

                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {displayTitle}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Updated {updatedDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
                        {statusLabel}
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={primaryHref}>{actionLabel}</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <p>No recent tasks yet</p>
              <p className="text-sm mt-2">
                Start your first analysis to see tasks here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
