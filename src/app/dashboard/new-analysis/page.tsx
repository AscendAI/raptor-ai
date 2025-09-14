'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, BarChart3 } from 'lucide-react';
import { startNewTask } from '@/lib/server/actions';

export default function NewAnalysisPage() {
  const router = useRouter();

  const startRoofAnalysis = async () => {
    try {
      const res = await startNewTask();
      if (!res.success || !res.taskId) {
        throw new Error(res.error || 'Failed to start a new task');
      }
      router.push(`/dashboard/roof-report-upload/${res.taskId}`);
    } catch (e) {
      console.error(e);
      // Fallback: send to dashboard on failure
      router.push('/dashboard');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Start New Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Begin a new document analysis workflow by uploading your roof and
          insurance reports
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Workflow Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Analysis Workflow</CardTitle>
            <CardDescription>
              Our analysis process consists of the following steps:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold text-sm">1. Upload Roof Report</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your roofing inspection document
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <FileText className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold text-sm">2. Review Roof Data</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify and edit extracted roof data
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <Shield className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold text-sm">
                  3. Upload Insurance Report
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your insurance claim document
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <Shield className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold text-sm">
                  4. Review Insurance Data
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify and edit extracted insurance data
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
                <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold text-sm">5. View Analysis</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Review comprehensive comparison results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Begin?</CardTitle>
            <CardDescription>
              Click the button below to start a new analysis workflow.
              You&apos;ll be guided through each step of the process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={startRoofAnalysis}
              size="lg"
              className="w-full md:w-auto"
              variant="gradient"
            >
              <FileText className="h-4 w-4 mr-2" />
              Start New Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
