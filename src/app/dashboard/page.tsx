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

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/auth');
  }

  // Mock recent tasks data - replace with actual data fetching later
  const recentTasks = [
    {
      id: 1,
      title: 'Property Damage Analysis - 123 Main St',
      type: 'Analysis',
      date: '2024-01-15',
      status: 'Completed',
    },
    {
      id: 2,
      title: 'Water Damage Supplement - Oak Avenue',
      type: 'Supplement',
      date: '2024-01-14',
      status: 'In Progress',
    },
    {
      id: 3,
      title: 'Fire Damage Assessment - Pine Street',
      type: 'Analysis',
      date: '2024-01-12',
      status: 'Completed',
    },
  ];

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
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {task.type}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(task.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {task.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
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
