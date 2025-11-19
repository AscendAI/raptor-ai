'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, X, AlertTriangle } from 'lucide-react';
import {
  type ComparisonResult,
  type ComparisonCheckpoint,
  type StructureComparison,
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

interface EditableMultiStructureComparisonResultsProps {
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
  const IconComponent = statusIcons[config.icon as keyof typeof statusIcons];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
        {
          'bg-emerald-100 text-emerald-800 border border-emerald-300':
            status === 'pass',
          'bg-red-100 text-red-800 border border-red-300': status === 'failed',
          'bg-amber-100 text-amber-800 border border-amber-300':
            status === 'missing',
        },
        className
      )}
    >
      <IconComponent className="h-3.5 w-3.5" />
      <span>{config.label}</span>
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
      className={cn(
        'border rounded-lg shadow-sm hover:shadow-md transition-all duration-200',
        {
          'bg-emerald-100/30 border-emerald-200 hover:bg-emerald-50/50':
            comparison.status === 'pass',
          'bg-red-100/30 border-red-200 hover:bg-red-50/50':
            comparison.status === 'failed',
          'bg-amber-100/30 border-amber-200 hover:bg-amber-50/50':
            comparison.status === 'missing',
        }
      )}
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline group">
        <div className="flex items-center justify-between w-full mr-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                {
                  'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 group-hover:scale-105':
                    comparison.status === 'pass',
                  'bg-red-100 text-red-600 group-hover:bg-red-200 group-hover:scale-105':
                    comparison.status === 'failed',
                  'bg-amber-100 text-amber-600 group-hover:bg-amber-200 group-hover:scale-105':
                    comparison.status === 'missing',
                }
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                {comparison.checkpoint}
              </h4>
              {comparison.warning && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Warning present
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={comparison.status} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 pb-6">
        <div className="space-y-4 mt-2">
          {/* Checkpoint Name */}
          <div className="space-y-2">
            <Label
              htmlFor={`checkpoint-${index}`}
              className="text-xs font-medium text-gray-700"
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
              className="text-xs font-medium text-gray-700"
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor={`roof-${index}`}
                className="text-xs font-medium text-gray-700 flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                Roof Report Value
              </Label>
              <Input
                id={`roof-${index}`}
                value={comparison.roof_report_value || ''}
                onChange={(e) =>
                  handleFieldChange('roof_report_value', e.target.value || null)
                }
                placeholder="Not specified"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`insurance-${index}`}
                className="text-xs font-medium text-gray-700 flex items-center gap-2"
              >
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
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
                placeholder="Not specified"
                className="bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor={`notes-${index}`}
              className="text-xs font-medium text-gray-700 flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              Analysis Notes
            </Label>
            <Textarea
              id={`notes-${index}`}
              value={comparison.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Add analysis notes..."
              className="bg-blue-50 border-blue-200 min-h-[80px]"
            />
          </div>

          {/* Warning */}
          <div className="space-y-2">
            <Label
              htmlFor={`warning-${index}`}
              className="text-xs font-medium text-amber-700 flex items-center gap-2"
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
              className="bg-amber-50 border-amber-200 min-h-[60px]"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface EditableStructureComparisonProps {
  structure: StructureComparison;
  onChange: (updated: StructureComparison) => void;
}

function EditableStructureComparison({
  structure,
  onChange,
}: EditableStructureComparisonProps) {
  const handleComparisonChange = (
    index: number,
    updated: ComparisonCheckpoint
  ) => {
    const newComparisons = [...structure.comparisons];
    newComparisons[index] = updated;

    // Recalculate summary
    const newSummary = {
      pass: newComparisons.filter((c) => c.status === 'pass').length,
      failed: newComparisons.filter((c) => c.status === 'failed').length,
      missing: newComparisons.filter((c) => c.status === 'missing').length,
      total: newComparisons.length,
    };

    onChange({
      ...structure,
      comparisons: newComparisons,
      summary: newSummary,
    });
  };

  return (
    <div className="space-y-6">
      <div className={cn('border rounded-xl p-6 transition-colors')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Structure {structure.structureNumber} (Edit Mode)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Edit comparison data below
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="text-center">
                <div className="text-xs text-emerald-600 font-medium">Pass</div>
                <div className="text-sm font-semibold text-emerald-700">
                  {structure.summary.pass}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-red-600 font-medium">Failed</div>
                <div className="text-sm font-semibold text-red-700">
                  {structure.summary.failed}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-amber-600 font-medium">
                  Missing
                </div>
                <div className="text-sm font-semibold text-amber-700">
                  {structure.summary.missing}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {structure.comparisons.map((comparison, index) => (
          <EditableComparisonAccordionItem
            key={index}
            comparison={comparison}
            index={index}
            onChange={(updated) => handleComparisonChange(index, updated)}
          />
        ))}
      </Accordion>
    </div>
  );
}

export function EditableMultiStructureComparisonResults({
  data,
  onChange,
  className,
}: EditableMultiStructureComparisonResultsProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab to first structure if available
    if (data.structures && data.structures.length > 0) {
      return `structure-${data.structures[0].structureNumber}`;
    }
    return 'single';
  });

  const handleSingleComparisonChange = (
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

  const handleStructureChange = (
    structureNumber: number,
    updated: StructureComparison
  ) => {
    if (data.structures) {
      const newStructures = data.structures.map((s) =>
        s.structureNumber === structureNumber ? updated : s
      );

      // Recalculate overall summary
      const overallSummary = {
        pass: newStructures.reduce((sum, s) => sum + s.summary.pass, 0),
        failed: newStructures.reduce((sum, s) => sum + s.summary.failed, 0),
        missing: newStructures.reduce((sum, s) => sum + s.summary.missing, 0),
        total: newStructures.reduce((sum, s) => sum + s.summary.total, 0),
      };

      onChange({
        ...data,
        structures: newStructures,
        summary: overallSummary,
      });
    }
  };

  // Show error only if there are no comparisons at all
  if (
    !data.success &&
    (!data.comparisons || data.comparisons.length === 0) &&
    (!data.structures || data.structures.length === 0)
  ) {
    return (
      <div className={cn('w-full', className)}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Analysis Failed
          </h3>
          <p className="text-red-700">
            Comparison analysis failed. Please try again or contact support if
            the issue persists.
          </p>
        </div>
      </div>
    );
  }

  // Handle single structure case (backward compatibility)
  if (data.structureCount === 1 && data.comparisons && !data.structures) {
    return (
      <div className={cn('w-full space-y-6', className)}>
        <div className={cn('border rounded-xl p-6 transition-colors')}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analysis Results (Edit Mode)
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Edit comparison data below
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="text-center">
                  <div className="text-xs text-emerald-600 font-medium">
                    Pass
                  </div>
                  <div className="text-sm font-semibold text-emerald-700">
                    {data.summary.pass}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-red-600 font-medium">Failed</div>
                  <div className="text-sm font-semibold text-red-700">
                    {data.summary.failed}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-amber-600 font-medium">
                    Missing
                  </div>
                  <div className="text-sm font-semibold text-amber-700">
                    {data.summary.missing}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-3">
          {data.comparisons.map((comparison, index) => (
            <EditableComparisonAccordionItem
              key={index}
              comparison={comparison}
              index={index}
              onChange={(updated) =>
                handleSingleComparisonChange(index, updated)
              }
            />
          ))}
        </Accordion>
      </div>
    );
  }

  // Handle multi-structure case
  if (data.structures && data.structures.length > 0) {
    return (
      <div className={cn('w-full space-y-6', className)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${data.structures.length}, 1fr)`,
            }}
          >
            {data.structures.map((structure) => (
              <TabsTrigger
                key={structure.structureNumber}
                value={`structure-${structure.structureNumber}`}
              >
                Structure {structure.structureNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {data.structures.map((structure) => (
            <TabsContent
              key={structure.structureNumber}
              value={`structure-${structure.structureNumber}`}
              className="mt-6"
            >
              <EditableStructureComparison
                structure={structure}
                onChange={(updated) =>
                  handleStructureChange(structure.structureNumber, updated)
                }
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  // Fallback case
  return (
    <div className={cn('w-full', className)}>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
          <AlertTriangle className="h-6 w-6 text-gray-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600">
          No comparison data is available for this analysis.
        </p>
      </div>
    </div>
  );
}

export default EditableMultiStructureComparisonResults;
