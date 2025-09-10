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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  type ComparisonResult,
  type ComparisonCheckpoint,
  statusConfig,
} from '@/lib/schemas/comparison';
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
  const stats = [
    {
      label: 'Passed',
      value: summary.pass,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      label: 'Failed',
      value: summary.failed,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
    },
    {
      label: 'Missing',
      value: summary.missing,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
    },
    {
      label: 'Total',
      value: summary.total,
      color: 'bg-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-700 dark:text-gray-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`p-4 rounded-lg border ${stat.bgColor}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            <div>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ComparisonAccordionItemProps {
  comparison: ComparisonCheckpoint;
  index: number;
}

function ComparisonAccordionItem({
  comparison,
  index,
}: ComparisonAccordionItemProps) {
  const config = statusConfig[comparison.status];

  return (
    <AccordionItem value={`item-${index}`} className="border rounded-lg mb-2">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">{config.icon}</span>
            <div className="text-left">
              <p className="font-medium text-sm">{comparison.checkpoint}</p>
              <p className="text-xs text-muted-foreground">
                {comparison.status === 'pass'
                  ? 'Values match'
                  : comparison.status === 'failed'
                    ? 'Discrepancy found'
                    : 'Data missing'}
              </p>
            </div>
          </div>
          <StatusBadge status={comparison.status} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Roof Report Value
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border">
                <p className="text-sm">
                  {comparison.roof_report_value || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Insurance Report Value
              </p>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border">
                <p className="text-sm">
                  {comparison.insurance_report_value || 'Not included'}
                </p>
              </div>
            </div>
          </div>

          {comparison.notes && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Analysis Notes
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-md border">
                <p className="text-sm leading-relaxed">{comparison.notes}</p>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
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
    <div className={cn('w-full space-y-6', className)}>
      {/* Summary Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analysis Summary</span>
            <Badge variant="outline">
              {data.comparisons.length} checkpoints
            </Badge>
          </CardTitle>
          <CardDescription>
            Overview of the comparison analysis between roof and insurance
            reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryStats summary={data.summary} />
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
            {data.comparisons.map((comparison, index) => (
              <ComparisonAccordionItem
                key={index}
                comparison={comparison}
                index={index}
              />
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComparisonResults;
