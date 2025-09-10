'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  extractRoofData,
  createRoofReviewTaskWithId,
} from '@/lib/server/actions';
import { convertPdfToImages } from '@/lib/utils/pdf';
import { WorkflowLayout } from '@/components/common/workflow-layout';

export default function RoofReportUploadPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [roofFile, setRoofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Validate that we have a task ID
    if (!taskId) {
      toast.error('Invalid task ID');
      router.push('/dashboard');
      return;
    }
  }, [taskId, router]);

  const handleRoofFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setRoofFile(selectedFile);
  };

  const processRoofDocument = async () => {
    if (!roofFile) return;

    try {
      setIsProcessing(true);
      toast.info('Processing roof document...');

      // Convert PDF to images
      const roofImages = await convertPdfToImages(roofFile);

      // Extract roof data
      toast.info('Extracting roof data...');
      const extractionResult = await extractRoofData(roofImages);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract roof data'
        );
      }

      // Create a task with the roof data using the current taskId
      const taskResult = await createRoofReviewTaskWithId(
        taskId,
        extractionResult.data
      );

      if (taskResult.success) {
        toast.success('Roof document processed successfully!');
        // Navigate to roof review page with the same taskId
        router.push(`/dashboard/roof-report-review/${taskId}`);
      } else {
        throw new Error(taskResult.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error processing roof document:', error);
      toast.error('Failed to process roof document');
      setIsProcessing(false);
    }
  };

  return (
    <WorkflowLayout
      title="Upload Roof Report"
      description="Upload your roofing document to begin the analysis process"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Roof Report Document
          </CardTitle>
          <CardDescription>
            Please upload your roof inspection report (PDF format)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roof-file">Select Roof Report PDF</Label>
            <Input
              id="roof-file"
              type="file"
              accept=".pdf"
              onChange={handleRoofFileChange}
              disabled={isProcessing}
            />
          </div>

          {roofFile && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="text-sm text-muted-foreground">{roofFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Size: {(roofFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          <Button
            onClick={processRoofDocument}
            disabled={!roofFile || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Document...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload and Process
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}
