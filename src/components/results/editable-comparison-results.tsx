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
} from '@/lib/types/comparison';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditableComparisonResultsProps {
  data: ComparisonResult;
  onChange: (data: ComparisonResult) => void;
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
  warningsCount?: number;
}

function SummaryStats({ summary, warningsCount = 0 }: SummaryStatsProps) {
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
      label: 'Warnings',
      value: warningsCount,
      icon: AlertTriangle,
      color: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      accentColor: 'bg-amber-500',
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

interface EditableComparisonAccordionItemProps {
  comparison: ComparisonCheckpoint;
  index: number;
  onChange: (updated: ComparisonCheckpoint) => void;
}

function EditableComparisonAccordionItem({
  comparison,
  index,
  onChange,
}: EditableComparisonAccordionItemProps) {
  const config = statusConfig[comparison.status];
  const IconComponent = statusIcons[config.icon as keyof typeof statusIcons];

  const handleFieldChange = (
    field: keyof ComparisonCheckpoint,
    value: string | null
  ) => {
    onChange({
      ...comparison,
      [field]: value,
    });
  };

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
          <div className="flex items-center gap-2">
            {comparison.status === 'pass' && comparison.warning && (
              <Badge
                variant="outline"
                className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                title={comparison.warning}
              >
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Warning
                </span>
              </Badge>
            )}
            <StatusBadge status={comparison.status} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 bg-muted/20">
        <div className="space-y-4 pt-2">
          {/* Checkpoint Name */}
          <div className="space-y-2">
            <Label
              htmlFor={`checkpoint-${index}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Checkpoint Name
            </Label>
            <Input
              id={`checkpoint-${index}`}
              value={comparison.checkpoint}
              onChange={(e) => handleFieldChange('checkpoint', e.target.value)}
              className="bg-white"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label
              htmlFor={`status-${index}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Status
            </Label>
            <Select
              value={comparison.status}
              onValueChange={(value: ComparisonCheckpoint['status']) =>
                handleFieldChange('status', value)
              }
            >
              <SelectTrigger id={`status-${index}`} className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor={`roof-${index}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Roof Report Value
              </Label>
              <Input
                id={`roof-${index}`}
                value={comparison.roof_report_value || ''}
                onChange={(e) =>
                  handleFieldChange('roof_report_value', e.target.value || null)
                }
                placeholder="Not specified"
                className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`insurance-${index}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Insurance Report Value
              </Label>
              <Input
                id={`insurance-${index}`}
                value={comparison.insurance_report_value || ''}
                onChange={(e) =>
                  handleFieldChange(
                    'insurance_report_value',
                    e.target.value || null
                  )
                }
                placeholder="Not included"
                className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor={`notes-${index}`}
              className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
            >
              Analysis Notes
            </Label>
            <Textarea
              id={`notes-${index}`}
              value={comparison.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Add analysis notes..."
              className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 min-h-[80px]"
            />
          </div>

          {/* Warning */}
          <div className="space-y-2">
            <Label
              htmlFor={`warning-${index}`}
              className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" /> Warning (Optional)
            </Label>
            <Textarea
              id={`warning-${index}`}
              value={comparison.warning || ''}
              onChange={(e) =>
                handleFieldChange('warning', e.target.value || null)
              }
              placeholder="Add warning message (optional)..."
              className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 min-h-[60px]"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function EditableComparisonResults({
  data,
  onChange,
  className,
}: EditableComparisonResultsProps) {
  const handleComparisonChange = (
    index: number,
    updated: ComparisonCheckpoint
  ) => {
    if (data.comparisons) {
      const newComparisons = [...data.comparisons];
      newComparisons[index] = updated;

      // Recalculate summary
      const newSummary = {
        pass: newComparisons.filter((c) => c.status === 'pass').length,
        failed: newComparisons.filter((c) => c.status === 'failed').length,
        missing: newComparisons.filter((c) => c.status === 'missing').length,
        total: newComparisons.length,
      };

      onChange({
        ...data,
        comparisons: newComparisons,
        summary: newSummary,
      });
    }
  };

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
          <CardTitle>Detailed Analysis (Edit Mode)</CardTitle>
          <CardDescription>
            Edit comparison data below. Changes are highlighted and will be
            saved when you click Save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {data.comparisons?.map((comparison, index) => (
              <EditableComparisonAccordionItem
                key={index}
                comparison={comparison}
                index={index}
                onChange={(updated) => handleComparisonChange(index, updated)}
              />
            )) || []}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditableComparisonResults;
