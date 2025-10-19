import React from 'react';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <WorkflowLayout
      title="Uploading Insurance Report…"
      description="Preparing upload interface and validations."
      currentStep={3}
      hrefMap={{}}
    >
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>
            <div className="h-5 w-56 bg-gray-200 rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-72 bg-gray-200 rounded mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropzone placeholder */}
          <div className="h-40 w-full bg-gray-200 rounded border-2 border-dashed" />

          {/* Dual buttons placeholder */}
          <div className="flex gap-4">
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>

          {/* Steps/progress placeholder */}
          <div className="space-y-3">
            <div className="h-4 w-3/5 bg-gray-200 rounded" />
            <div className="h-4 w-2/5 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}