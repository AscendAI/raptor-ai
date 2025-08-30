'use client';

import { useState, useRef } from 'react';
import { parseRoofReportAction } from '@/app/actions/parseRoofReport';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RoofrReportJson } from '@/lib/roofr/types';

export interface PdfUploaderProps {
  onSuccess?: (result: { documentHash: string; data: RoofrReportJson }) => void;
  onError?: (error: string) => void;
}

export function PdfUploader({ onSuccess, onError }: PdfUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await parseRoofReportAction(formData);

      if (result.ok) {
        onSuccess?.({ documentHash: result.documentHash, data: result.data });
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    // Validate file type
    if (!/\.pdf$/i.test(file.name)) {
      setError('Please upload a PDF file');
      onError?.('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      onError?.('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    await handleSubmit(formData);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.dataTransfer.files?.length) return;

    const file = e.dataTransfer.files[0];
    const formData = new FormData();
    formData.append('file', file);

    await handleSubmit(formData);
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="p-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onDrop={handleDrop}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        onDragLeave={preventDefault}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="w-12 h-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="text-lg font-medium">
            {isUploading ? 'Analyzing PDF...' : 'Upload Roofr PDF'}
          </div>
          <p className="text-sm text-gray-500">
            Drag and drop or click to select a PDF file
          </p>
          {error && <p className="text-sm text-red-500 mt-2">Error: {error}</p>}

          <Button
            type="button"
            variant="outline"
            className="mt-3"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? 'Processing...' : 'Select PDF'}
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <div className="mt-4 text-sm text-gray-500">
        <p>Supported file types: PDF</p>
        <p>Maximum file size: 10MB</p>
      </div>
    </Card>
  );
}
