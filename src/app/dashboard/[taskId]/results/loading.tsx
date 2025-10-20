import React from 'react';
import { WorkflowLayout } from '@/components/common/workflow-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <WorkflowLayout
      title="Loading Results…"
      description="Preparing metrics, charts, and summary."
      currentStep={6}
      hrefMap={{}}
    >
      {/* Summary header skeleton */}
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>
            <div className="h-5 w-56 bg-gray-200 rounded" />
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-72 bg-gray-200 rounded mt-2" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and table skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="animate-pulse">
          <CardHeader>
            <CardTitle>
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </CardTitle>
            <CardDescription>
              <div className="h-4 w-56 bg-gray-200 rounded mt-2" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>

        <Card className="animate-pulse">
          <CardHeader>
            <CardTitle>
              <div className="h-5 w-36 bg-gray-200 rounded" />
            </CardTitle>
            <CardDescription>
              <div className="h-4 w-52 bg-gray-200 rounded mt-2" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>

      {/* Footer actions */}
      <Card className="mt-4 animate-pulse">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-9 w-28 bg-gray-200 rounded" />
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