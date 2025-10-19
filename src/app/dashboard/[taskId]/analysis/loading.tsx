import React from 'react';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <WorkflowLayout
      title="Generating Analysis…"
      description="Setting up progress steps and checks."
      currentStep={5}
      hrefMap={{}}
    >
      <Card className="max-w-2xl mx-auto animate-pulse">
        <CardHeader>
          <CardTitle>
            <div className="h-5 w-48 bg-gray-200 rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-72 bg-gray-200 rounded mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress list skeleton */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="h-5 w-5 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-64 bg-gray-200 rounded mt-2" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded" />
            </div>
          ))}

          {/* Completion note placeholder */}
          <div className="h-12 w-full bg-gray-200 rounded" />
        </CardContent>
      </Card>
    </WorkflowLayout>
  );
}