"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startAnalysisWorkflow } from "@/lib/server/actions";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function readFileData(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

//param: file -> the input file (e.g. event.target.files[0])
//return: images -> an array of images encoded in base64
async function convertPdfToImages(file: File) {
  // Import PDF.js...
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  const images: string[] = [];
  const data = await readFileData(file);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = await pdfjs.getDocument(data as any).promise;
  const canvas = document.createElement("canvas");
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const viewport = page.getViewport({ scale: 1 });
    const context = canvas.getContext("2d");
    if (!context) continue;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport, canvas })
      .promise;
    images.push(canvas.toDataURL());
  }
  canvas.remove();
  return images;
}





export function UploadFile() {
  const [roofReport, setRoofReport] = useState<File | null>(null);
  const [insuranceReport, setInsuranceReport] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleRoofReportChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    setRoofReport(selectedFile);
  };
  const handleInsuranceReportChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;
    setInsuranceReport(selectedFile);
  };

  const handleUpload = async () => {
    if (!roofReport || !insuranceReport) return;

    try {
      setIsProcessing(true);
      toast.info('Processing files and extracting data...');

      // Convert PDFs to images
      const roofImages = await convertPdfToImages(roofReport);
      const insuranceImages = await convertPdfToImages(insuranceReport);

      // Start the analysis workflow (extract data and create session)
      const result = await startAnalysisWorkflow(
        [roofImages[5]], // Use one representative page
        [insuranceImages[4], insuranceImages[5]] // Use relevant pages
      );

      if (result.success && result.taskId) {
        toast.success('Data extracted successfully! Please review and modify as needed.');
        // Redirect to review page
        router.push(`/dashboard/review/${result.taskId}`);
      } else {
        toast.error(result.error || 'Failed to extract data from reports');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred while processing the files');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div>
        <Label>Upload Roof Report</Label>
        <Input
          type="file"
          onChange={handleRoofReportChange}
          accept="application/pdf"
        />
      </div>
      <div>
        <Label>Upload Insurance Report</Label>
        <Input
          type="file"
          onChange={handleInsuranceReportChange}
          accept="application/pdf"
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!roofReport || !insuranceReport || isProcessing}
      >
        {isProcessing && <Loader2 className="mr-2 animate-spin" />}
        {isProcessing ? 'Processing...' : 'Extract Data & Review'}
      </Button>

      {isProcessing && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Processing your files and extracting data. This may take a moment...
          </p>
        </div>
      )}
    </div>
  );
}
