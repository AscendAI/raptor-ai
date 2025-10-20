import React from 'react';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <WorkflowLayout
      title="Reviewing Roof Data…"
      description="Loading editor and preview."
      currentStep={2}
      hrefMap={{}}
    >
      {/* Status Banner Skeleton */}
      <Card className="relative overflow-hidden rounded-2xl bg-muted/20 border-muted-foreground/20 mb-4 animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
              </div>
            </div>
            <div className="h-9 w-36 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Editor Column */}
        <div>
          <Card className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </CardTitle>
              <CardDescription>
                <div className="h-4 w-72 bg-gray-200 rounded mt-2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Form-like skeleton fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-9 w-full bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-9 w-full bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-32 w-full bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>

        {/* PDF Preview Column */}
        <div className="xl:col-span-1">
          <Card className="animate-pulse">
            <CardHeader>
              <CardTitle>
                <div className="h-5 w-32 bg-gray-200 rounded" />
              </CardTitle>
              <CardDescription>
                <div className="h-4 w-48 bg-gray-200 rounded mt-2" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[calc(60vh)] min-h-[300px] bg-gray-200 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <Card className="mt-4 animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-9 w-32 bg-gray-200 rounded" />
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="h-9 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}