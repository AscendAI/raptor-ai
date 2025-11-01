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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { startNewTask } from '@/lib/server/actions/startNewTask';
import { FileText, Building } from 'lucide-react';

export function NewAnalysisForm() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [structureCount, setStructureCount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startRoofAnalysis = async () => {
    try {
      if (!taskName.trim()) {
        toast.error('Please enter a task name');
        return;
      }
      if (!structureCount || parseInt(structureCount) < 1 || parseInt(structureCount) > 4) {
        toast.error('Please select a valid number of roof structures (1-4)');
        return;
      }
      setIsSubmitting(true);
      const res = await startNewTask(taskName.trim(), parseInt(structureCount));
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
          Configure your analysis settings and start the workflow.
          You&apos;ll be guided through each step of the process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <Label htmlFor="structure-count">Number of Roof Structures</Label>
            <Select value={structureCount} onValueChange={setStructureCount}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of structures" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Structure</SelectItem>
                <SelectItem value="2">2 Structures</SelectItem>
                <SelectItem value="3">3 Structures</SelectItem>
                <SelectItem value="4">4 Structures</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Select how many roof structures need to be analyzed in your reports.
            </p>
          </div>
        </div>
        
        <Button
          onClick={startRoofAnalysis}
          size="lg"
          className="w-full md:w-auto"
          variant="gradient"
          disabled={isSubmitting || !taskName.trim() || !structureCount}
        >
          <FileText className="h-4 w-4 mr-2" />
          Start New Analysis
        </Button>
      </CardContent>
    </Card>
  );
}