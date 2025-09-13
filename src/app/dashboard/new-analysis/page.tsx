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
      {/* Enhanced Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            AI-Powered Analysis
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4">
          Start New Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Transform your document analysis workflow with AI. Begin a new
          document analysis workflow by uploading your roof and insurance
          reports.
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

        {/* Enhanced CTA Section */}
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Ready to Begin?
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              {`Click the button below to start a new analysis workflow. You'll be guided through each step of the process.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-4">
            <div className="space-y-3">
              <Button
                onClick={startRoofAnalysis}
                variant="gradient"
                size="default"
                className="px-6 py-2"
              >
                <FileText className="h-4 w-4 mr-2" />
                Start New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
