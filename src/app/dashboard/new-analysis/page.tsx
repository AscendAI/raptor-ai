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
import { FileText, Shield, BarChart3, Eye, Upload } from 'lucide-react';
import { StepCard } from '@/components/new-analysis/StepCard';

// Generate a unique task ID
function generateTaskId(): string {
  return `${Math.random().toString(36).substr(2, 6)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function NewAnalysisPage() {
  const router = useRouter();

  const startRoofAnalysis = () => {
    const taskId = generateTaskId();
    router.push(`/dashboard/roof-report-upload/${taskId}`);
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
              <StepCard
                icon={Upload}
                stepNumber={1}
                title="Upload Roof Report"
                description="Upload your roofing inspection document"
                colorTheme="blue"
              />
              
              <StepCard
                icon={Eye}
                stepNumber={2}
                title="Review Roof Data"
                description="Verify and edit extracted roof data"
                colorTheme="green"
              />
              
              <StepCard
                icon={Shield}
                stepNumber={3}
                title="Upload Insurance Report"
                description="Upload your insurance claim document"
                colorTheme="orange"
              />
              
              <StepCard
                icon={FileText}
                stepNumber={4}
                title="Review Insurance Data"
                description="Verify and edit extracted insurance data"
                colorTheme="purple"
              />
              
              <StepCard
                icon={BarChart3}
                stepNumber={5}
                title="View Analysis"
                description="Review comprehensive comparison results"
                colorTheme="indigo"
              />
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
