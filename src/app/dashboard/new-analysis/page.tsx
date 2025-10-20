import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StepCard } from '@/components/new-analysis/step-card';
import { FileText, Shield, BarChart3, Eye, Upload } from 'lucide-react';
import { NewAnalysisForm } from '@/components/new-analysis/new-analysis-form';

export default async function NewAnalysisPage() {
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
        <Card className="mb-6">
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
        <NewAnalysisForm />
      </div>
    </div>
  );
}
