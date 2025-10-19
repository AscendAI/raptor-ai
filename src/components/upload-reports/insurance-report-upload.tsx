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
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2, Upload, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { extractAndSaveInsuranceData } from '@/lib/server/actions/extractAndSaveInsuranceData';
import { getUserReviewData } from '@/lib/server/actions/getUserReviewData';
import { convertPdfToImages } from '@/lib/utils/pdf';

interface InsuranceReportUploadProps {
  taskId: string;
}

export function InsuranceReportUpload({ taskId }: InsuranceReportUploadProps) {
  const router = useRouter();
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInsuranceFileChange = (file: File | null) => {
    setInsuranceFile(file);
  };

  const processInsuranceDocument = async () => {
    if (!insuranceFile) return;

    setIsProcessing(true);
    try {
      toast.info('Processing insurance document...');

      // Convert PDF to images
      const insuranceImages = await convertPdfToImages(insuranceFile);

      // Extract insurance data
      toast.info('Extracting insurance data...');
      const extractionResult = await extractAndSaveInsuranceData(
        insuranceImages,
        taskId,
        insuranceFile
      );

      console.log('Insurance extraction result:', extractionResult);

      if (!extractionResult.success || !extractionResult.data) {
        throw new Error(
          extractionResult.error || 'Failed to extract insurance data'
        );
      }

      toast.success('Insurance document processed successfully!');

      // Verify data exists before navigation with retry mechanism
      const maxRetries = 3;
      let retryCount = 0;
      let verificationResult: Awaited<ReturnType<typeof getUserReviewData>> | undefined;

      while (retryCount < maxRetries) {
        console.log(
          `Verifying insurance data${retryCount > 0 ? ` (attempt ${retryCount + 1}/${maxRetries})` : ''}...`
        );
        verificationResult = await getUserReviewData(taskId);

        if (
          verificationResult.success &&
          verificationResult.data?.insuranceData
        ) {
          break;
        }

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryCount} second(s)...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (
        !verificationResult?.success ||
        !verificationResult.data?.insuranceData
      ) {
        throw new Error(
          'Data verification failed after multiple attempts - insurance data not found in database'
        );
      }

      console.log('Insurance data verified successfully!');
      router.push(`/dashboard/${taskId}/insurance-report-review`);
    } catch (error) {
      console.error('Error processing insurance document:', error);
      toast.error('Failed to process insurance document');
    }
    setIsProcessing(false);
  };

  const handleBack = () => {
    router.push(`/dashboard/${taskId}/roof-report-review`);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Insurance Report Document
        </CardTitle>
        <CardDescription>
          Please upload your insurance claim report (PDF format)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUpload
          id="insurance-file"
          accept=".pdf"
          selectedFile={insuranceFile}
          onFileSelect={handleInsuranceFileChange}
          disabled={isProcessing}
        />

        <div className="flex gap-4">
          <Button onClick={handleBack} variant="outline" className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roof Review
          </Button>

          <Button
            onClick={processInsuranceDocument}
            disabled={!insuranceFile || isProcessing}
            className="flex-1"
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
        </div>
      </CardContent>
    </Card>
  );
}