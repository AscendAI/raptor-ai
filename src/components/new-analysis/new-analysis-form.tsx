'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { startNewTask } from '@/lib/server/actions/startNewTask';
import { FileText } from 'lucide-react';

export function NewAnalysisForm() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startRoofAnalysis = async () => {
    try {
      if (!taskName.trim()) {
        toast.error('Please enter a task name');
        return;
      }
      setIsSubmitting(true);
      const res = await startNewTask(taskName.trim());
      if (!res.success || !res.taskId) {
        throw new Error(res.error || 'Failed to start a new task');
      }
      router.push(`/dashboard/${res.taskId}/roof-report-upload`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to start new analysis');
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ready to Begin?</CardTitle>
        <CardDescription>
          Click the button below to start a new analysis workflow.
          You&apos;ll be guided through each step of the process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <Label htmlFor="task-name">Task Name</Label>
          <Input
            id="task-name"
            placeholder="e.g. Johnson House - Claim #12345"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            Provide a descriptive name to help find this task later.
          </p>
        </div>
        <Button
          onClick={startRoofAnalysis}
          size="lg"
          className="w-full md:w-auto"
          variant="gradient"
          disabled={isSubmitting || !taskName.trim()}
        >
          <FileText className="h-4 w-4 mr-2" />
          Start New Analysis
        </Button>
      </CardContent>
    </Card>
  );
}