'use client';

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, File, CheckLine } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  id: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  accept = '.pdf',
  id,
  label,
  description,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      onFileSelect(file);
      // Don't clear the input here as it's handled naturally by the file selection
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        // Check if file type matches accept attribute
        if (accept && !file.type.includes('pdf') && accept.includes('.pdf')) {
          return; // Don't accept non-PDF files if PDF is required
        }
        onFileSelect(file);
      }
    },
    [accept, disabled, onFileSelect]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
    },
    []
  );

  const handleRemoveFile = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      // Clear the input value so the same file can be selected again
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) {
        input.value = '';
      }
      onFileSelect(null);
    },
    [onFileSelect, id]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Card
        className={cn(
          'relative cursor-pointer transition-all duration-200 border-2 border-dashed overflow-hidden',
          {
            'border-primary bg-primary/5 shadow-sm scale-[1.02]':
              isDragOver && !disabled,
            'border-muted-foreground/25 hover:border-muted-foreground/50 hover:shadow-sm':
              !isDragOver && !disabled,
            'border-muted-foreground/10 cursor-not-allowed opacity-50':
              disabled,
          }
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById(id)?.click()}
      >
        <div className="p-8 text-center">
          <Input
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="sr-only"
          />

          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckLine className="h-12 w-12 text-green-500" />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-200/50 border-slate-200 rounded-lg p-4 border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <File className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate text-left">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <p className="text-xs text-green-600 font-medium">
                            Ready to upload
                          </p>
                        </div>
                      </div>
                      {!disabled && (
                        <button
                          onClick={handleRemoveFile}
                          className="text-muted-foreground hover:text-destructive transition-all duration-200 p-2 hover:bg-destructive/10 rounded-lg flex-shrink-0 group"
                          type="button"
                          title="Remove file"
                        >
                          <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!disabled && (
                <p className="text-xs text-muted-foreground font-medium">
                  Click or drag to replace file
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Upload
                    className={cn(
                      'h-12 w-12 transition-all duration-200',
                      isDragOver
                        ? 'text-primary scale-110'
                        : 'text-muted-foreground'
                    )}
                  />
                  {isDragOver && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    isDragOver ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {isDragOver ? 'Drop your file here' : 'Upload a file'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop your file here, or{' '}
                  <span className="text-primary font-medium">
                    click to browse
                  </span>
                </p>
                {accept && (
                  <div className="inline-flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Supported:{' '}
                      <span className="font-medium">
                        {accept.replace(/\./g, '').toUpperCase()}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
