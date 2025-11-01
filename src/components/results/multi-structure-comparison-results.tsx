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

interface MultiStructureComparisonResultsProps {
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
        <div className="space-y-5 mt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <h5 className="font-medium text-sm text-gray-700">
                  Roof Report Value
                </h5>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-900 font-mono">
                  {comparison.roof_report_value || 'Not specified'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <h5 className="font-medium text-sm text-gray-700">
                  Insurance Report Value
                </h5>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-900 font-mono">
                  {comparison.insurance_report_value || 'Not specified'}
                </p>
              </div>
            </div>
          </div>

          {comparison.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <h5 className="font-medium text-sm text-gray-700">
                  Analysis Notes
                </h5>
              </div>
              <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-3 shadow-sm">
                <p className="text-sm text-blue-900 leading-relaxed">
                  {comparison.notes}
                </p>
              </div>
            </div>
          )}

          {comparison.warning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h5 className="font-medium text-sm text-amber-700">Warning</h5>
              </div>
              <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-lg p-3 shadow-sm">
                <p className="text-sm text-amber-800 leading-relaxed">
                  {comparison.warning}
                </p>
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface StructureComparisonProps {
  structure: StructureComparison;
}

function StructureComparisonView({ structure }: StructureComparisonProps) {
  // Calculate the overall status for the structure
  const hasFailures = structure.summary.failed > 0;
  const hasMissing = structure.summary.missing > 0;
  const overallStatus = hasFailures
    ? 'failed'
    : hasMissing
      ? 'missing'
      : 'pass';

  return (
    <div className="space-y-6">
      <div
        className={cn('border rounded-xl p-6 transition-colors', {
          'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200':
            overallStatus === 'pass',
          'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200':
            overallStatus === 'failed',
          'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200':
            overallStatus === 'missing',
        })}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Structure {structure.structureNumber}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Detailed comparison analysis results
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
          <ComparisonAccordionItem
            key={index}
            comparison={comparison}
            index={index}
          />
        ))}
      </Accordion>
    </div>
  );
}

export function MultiStructureComparisonResults({
  data,
  className,
}: MultiStructureComparisonResultsProps) {
  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab to first structure if available
    if (data.structures && data.structures.length > 0) {
      return `structure-${data.structures[0].structureNumber}`;
    }
    return 'single';
  });

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
    // Calculate the overall status for the structure
    const hasFailures = data.summary.failed > 0;
    const hasMissing = data.summary.missing > 0;
    const overallStatus = hasFailures
      ? 'failed'
      : hasMissing
        ? 'missing'
        : 'pass';

    return (
      <div className={cn('w-full space-y-6', className)}>
        <div
          className={cn('border rounded-xl p-6 transition-colors', {
            'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200':
              overallStatus === 'pass',
            'bg-gradient-to-r from-red-50 to-red-100/50 border-red-200':
              overallStatus === 'failed',
            'bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200':
              overallStatus === 'missing',
          })}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analysis Results
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Detailed comparison analysis results
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
            <ComparisonAccordionItem
              key={index}
              comparison={comparison}
              index={index}
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
              <StructureComparisonView structure={structure} />
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

export default MultiStructureComparisonResults;
