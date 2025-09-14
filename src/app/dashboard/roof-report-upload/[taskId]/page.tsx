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
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { extractAndSaveRoofData, getUserReviewData } from '@/lib/server/actions';
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

  const handleRoofFileChange = (file: File | null) => {
    setRoofFile(file);
  };

  const processRoofDocument = async () => {
    if (!roofFile) return;

    setIsProcessing(true);
    try {
      toast.info('Processing roof document...');

      // Convert PDF to images
      const roofImages = await convertPdfToImages(roofFile);

      // Extract roof data
      toast.info('Extracting roof data...');
      const extractionResult = await extractAndSaveRoofData(
        roofImages,
        taskId,
        roofFile
      );

      console.log('Roof extraction result:', extractionResult);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract roof data'
        );
      }

      toast.success('Roof document processed successfully!');
      
      // Verify data exists before navigation with retry mechanism
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult;
      
      while (retryCount < maxRetries) {
         console.log(`Verifying roof data${retryCount > 0 ? ` (attempt ${retryCount + 1}/${maxRetries})` : ''}...`);
         verificationResult = await getUserReviewData(taskId);
         
         if (verificationResult.success && verificationResult.data?.roofData) {
           break;
         }
         
         retryCount++;
         if (retryCount < maxRetries) {
           // Wait before retry with exponential backoff
           console.log(`Retrying in ${retryCount} second(s)...`);
           await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
         }
       }
       
       if (!verificationResult?.success || !verificationResult.data?.roofData) {
         throw new Error('Data verification failed after multiple attempts - roof data not found in database');
       }
       
       console.log('Roof data verified successfully!');
      // Navigate to roof review page with the same taskId
      router.push(`/dashboard/roof-report-review/${taskId}`);
    } catch (error) {
      console.error('Error processing roof document:', error);
      toast.error('Failed to process roof document');
    }
    setIsProcessing(false);
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
          <FileUpload
            id="roof-file"
            accept=".pdf"
            selectedFile={roofFile}
            onFileSelect={handleRoofFileChange}
            disabled={isProcessing}
          />

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
