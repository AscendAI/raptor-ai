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
import { listUserTasks } from '@/lib/server/db/services/tasksService';

export default async function DashboardPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const tasks = await listUserTasks(session.user.id);

  const getStatusLabel = (t: typeof tasks[number]) => {
    if (t.comparison) return 'Completed';
    if (t.roofData && t.insuranceData) return 'Ready to Compare';
    if (t.roofData || t.insuranceData) return 'Extracted';
    return 'New';
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Review and resume your previous tasks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tasks yet.</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((t) => {
                const status = getStatusLabel(t);
                const actionHref = t.comparison
                  ? `/dashboard/${t.id}/results`
                  : t.roofData && t.insuranceData
                  ? `/dashboard/${t.id}/analysis`
                  : t.roofData
                  ? `/dashboard/${t.id}/roof-report-review`
                  : `/dashboard/${t.id}/roof-report-upload`;
                const actionLabel = t.comparison ? 'View' : 'Resume';
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between border rounded-md p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {t.name || `Task ${t.id.slice(0, 8)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: {status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={actionHref} className="inline-flex items-center">
                          {t.comparison ? (
                            <TrendingUp className="mr-2 h-4 w-4" />
                          ) : (
                            <ClipboardList className="mr-2 h-4 w-4" />
                          )}
                          <span>{actionLabel}</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
