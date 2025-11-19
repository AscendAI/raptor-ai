'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion } from '@/components/ui/accordion';
import { type ComparisonResult } from '@/lib/types/comparison';
import { cn } from '@/lib/utils';
import { SummaryStats, ComparisonAccordionItem } from './shared';

interface ComparisonResultsProps {
  data: ComparisonResult;
  className?: string;
}

export function ComparisonResults({ data, className }: ComparisonResultsProps) {
  const warningsCount = (data.comparisons || []).reduce(
    (acc, c) => acc + (c.warning ? 1 : 0),
    0
  );

  // Show error only if there are no comparisons at all
  if (!data.success && (!data.comparisons || data.comparisons.length === 0)) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Comparison analysis failed. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Summary Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Summary</span>
            <Badge variant="outline">
              {data.comparisons?.length || 0} checkpoints
            </Badge>
          </CardTitle>
          <CardDescription>
            Overview of the comparison analysis between roof and insurance
            reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryStats summary={data.summary} warningsCount={warningsCount} />
        </CardContent>
      </Card>

      {/* Detailed Comparison Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Expand each item to view detailed comparison information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {data.comparisons?.map((comparison, index) => (
              <ComparisonAccordionItem
                key={index}
                comparison={comparison}
                index={index}
                variant="default"
              />
            )) || []}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComparisonResults;
