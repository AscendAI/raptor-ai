"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const readFileData = (file: File) => {
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
};

//param: file -> the input file (e.g. event.target.files[0])
//return: images -> an array of images encoded in base64
const convertPdfToImages = async (file: File) => {
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
};

export function UploadFile() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    const images = await convertPdfToImages(file);
    console.log(images); // Array of base64 encoded images

    // Implement your upload logic here
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!file}>
        Process
      </Button>
    </div>
  );
}
