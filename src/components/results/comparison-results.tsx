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
import { Check, X, AlertTriangle, BarChart3 } from 'lucide-react';
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

// Icon mapping for status config icons used in accordion items
const statusIcons = {
  Check,
  X,
  AlertTriangle,
} as const;

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
      icon: Check,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      accentColor: 'bg-green-500',
    },
    {
      label: 'Failed',
      value: summary.failed,
      icon: X,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      accentColor: 'bg-red-500',
    },
    {
      label: 'Missing',
      value: summary.missing,
      icon: AlertTriangle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      accentColor: 'bg-yellow-500',
    },
    {
      label: 'Total',
      value: summary.total,
      icon: BarChart3,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      accentColor: 'bg-gray-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className={`p-4 rounded-lg border transition-all hover:shadow-sm ${stat.bgColor} ${stat.borderColor}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${stat.accentColor}/10 border ${stat.borderColor}`}
              >
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
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
  const IconComponent = statusIcons[config.icon as keyof typeof statusIcons];

  return (
    <AccordionItem
      value={`item-${index}`}
      className="border rounded-lg mb-2 overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}
            >
              <IconComponent className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">{comparison.checkpoint}</p>
              <p className="text-xs text-muted-foreground">
                {comparison.status === 'pass'
                  ? 'Values match perfectly'
                  : comparison.status === 'failed'
                    ? 'Discrepancy detected'
                    : 'Required data missing'}
              </p>
            </div>
          </div>
          <StatusBadge status={comparison.status} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 bg-muted/20">
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Roof Report Value
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium">
                  {comparison.roof_report_value || (
                    <span className="text-muted-foreground italic">
                      Not specified
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Insurance Report Value
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium">
                  {comparison.insurance_report_value || (
                    <span className="text-muted-foreground italic">
                      Not included
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {comparison.notes && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Analysis Notes
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-800">
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
