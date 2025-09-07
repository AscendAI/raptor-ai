"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyseFiles } from "@/lib/server/actions";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

function downloadFile(file: string, fileName: string) {
  const aElement = document.createElement("a");
  aElement.href = file;
  aElement.download = fileName;
  aElement.click();
  aElement.remove();
}

function useAnalyseFiles() {
  return useMutation({
    mutationFn: analyseFiles,
    mutationKey: ["analyseFiles"],
  });
}

export function UploadFile() {
  const [roofReport, setRoofReport] = useState<File | null>(null);
  const [insuranceReport, setInsuranceReport] = useState<File | null>(null);
  const { mutateAsync: analyseFiles, isPending } = useAnalyseFiles();
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

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
    if (!roofReport) return;
    if (!insuranceReport) return;

    const roofrimages = await convertPdfToImages(roofReport);
    const insuranceImages = await convertPdfToImages(insuranceReport);

    // // download them (they are base 64 image strings)
    // downloadFile(roofrimages[5], "roofreport.png");
    // downloadFile(insuranceImages[5], "insurancereport.png");

    const analysis = await analyseFiles({
      roofReport: [roofrimages[5]],
      insuranceReport: [insuranceImages[5]],
    });
    setAnalysisResult(analysis);
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
        disabled={!roofReport || !insuranceReport || isPending}
      >
        {isPending && <Loader2 className="mr-2 animate-spin" />}
        Process
      </Button>

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Results of the analysis</CardDescription>
            <CardAction>Download Report</CardAction>
          </CardHeader>
          <CardContent>
            <p>{analysisResult}</p>
          </CardContent>
          <CardFooter>
            <p>Analysis Result</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
