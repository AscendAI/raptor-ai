'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ComparisonResult, type ComparisonCheckpoint, statusConfig } from '@/lib/schemas/comparison';
import { cn } from '@/lib/utils';

interface ComparisonResultsProps {
  data: ComparisonResult;
  className?: string;
}

interface StatusBadgeProps {
  status: ComparisonCheckpoint['status'];
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

interface SummaryStatsProps {
  summary: ComparisonResult['summary'];
}

function SummaryStats({ summary }: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium">{summary.pass} Pass</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <span className="text-sm font-medium">{summary.failed} Failed</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="text-sm font-medium">{summary.missing} Missing</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
        <span className="text-sm font-medium">{summary.total} Total</span>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  comparison: ComparisonCheckpoint;
}

function ComparisonRow({ comparison }: ComparisonRowProps) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{comparison.checkpoint}</h4>
        </div>
        <StatusBadge status={comparison.status} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground font-medium mb-1">Roof Report Value</p>
          <p className="text-foreground">
            {comparison.roof_report_value || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground font-medium mb-1">Insurance Report Value</p>
          <p className="text-foreground">
            {comparison.insurance_report_value || 'Not included'}
          </p>
        </div>
      </div>
      
      {comparison.notes && (
        <div className="pt-2 border-t">
          <p className="text-muted-foreground font-medium mb-1">Notes</p>
          <p className="text-sm text-foreground leading-relaxed">
            {comparison.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export function ComparisonResults({ data, className }: ComparisonResultsProps) {
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
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comparison Results</span>
          <Badge variant="outline" className="ml-2">
            {data.comparisons.length} checkpoints
          </Badge>
        </CardTitle>
        <CardDescription>
          Analysis comparing roof report requirements with insurance estimate coverage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div>
          <h3 className="font-medium mb-3">Summary</h3>
          <SummaryStats summary={data.summary} />
        </div>
        
        {/* Comparison Details */}
        <div>
          <h3 className="font-medium mb-3">Detailed Analysis</h3>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {data.comparisons.map((comparison, index) => (
                <ComparisonRow key={index} comparison={comparison} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComparisonResults;