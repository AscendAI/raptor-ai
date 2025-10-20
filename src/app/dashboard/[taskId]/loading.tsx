import React from 'react';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Route-level Suspense fallback: shows immediately on navigation
// while the target page fetches server data.
export default function Loading() {
  return (
    <WorkflowLayout
      title="Loading…"
      description="Preparing content, please wait."
      currentStep={1}
      hrefMap={{}} // disable step links during loading
    >
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>
            <div className="h-5 w-40 bg-gray-200 rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
          <div className="h-48 w-full bg-gray-200 rounded" />
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}