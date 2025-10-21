'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      accentColor: 'bg-gray-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'relative overflow-hidden rounded-lg border p-4',
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className={cn('text-2xl font-bold', stat.color)}>
                  {stat.value}
                </p>
              </div>
              <Icon className={cn('h-8 w-8', stat.color)} />
            </div>
            <div
              className={cn(
                'absolute bottom-0 left-0 h-1 w-full',
                stat.accentColor
              )}
            />
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
      className={cn(
        'rounded-lg border',
        config.bgColor,
        config.borderColor
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full mr-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                config.bgColor,
                config.borderColor,
                'border'
              )}
            >
              <IconComponent className={cn('h-4 w-4', config.color)} />
            </div>
            <div className="text-left">
              <h4 className="font-medium">{comparison.checkpoint}</h4>
            </div>
          </div>
          <StatusBadge status={comparison.status} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">
                Roof Report Value
              </h5>
              <p className="text-sm bg-muted p-2 rounded">
                {comparison.roof_report_value || 'Not specified'}
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">
                Insurance Report Value
              </h5>
              <p className="text-sm bg-muted p-2 rounded">
                {comparison.insurance_report_value || 'Not specified'}
              </p>
            </div>
          </div>
          {comparison.notes && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">
                Analysis Notes
              </h5>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {comparison.notes}
              </p>
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
  return (
    <div className="space-y-6">
      {/* Structure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Structure {structure.structureNumber} Summary</span>
            <Badge variant="outline">
              {structure.comparisons.length} checkpoints
            </Badge>
          </CardTitle>
          <CardDescription>
            Analysis results for structure {structure.structureNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SummaryStats summary={structure.summary} />
        </CardContent>
      </Card>

      {/* Structure Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>
            Expand each item to view detailed comparison information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {structure.comparisons.map((comparison, index) => (
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

export function MultiStructureComparisonResults({
  data,
  className,
}: MultiStructureComparisonResultsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Show error only if there are no comparisons at all
  if (!data.success && (!data.comparisons || data.comparisons.length === 0) && (!data.structures || data.structures.length === 0)) {
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

  // Handle single structure case (backward compatibility)
  if (data.structureCount === 1 && data.comparisons && !data.structures) {
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

  // Handle multi-structure case
  if (data.structures && data.structures.length > 0) {
    return (
      <div className={cn('w-full space-y-6', className)}>
        {/* Overall Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall Analysis Summary</span>
              <Badge variant="outline">
                {data.structureCount} structures
              </Badge>
            </CardTitle>
            <CardDescription>
              Combined overview of comparison analysis across all structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryStats summary={data.summary} />
          </CardContent>
        </Card>

        {/* Tabbed Structure Results */}
        <Card>
          <CardHeader>
            <CardTitle>Structure-by-Structure Analysis</CardTitle>
            <CardDescription>
              View detailed comparison results for each structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {data.structures.map((structure) => (
                  <TabsTrigger
                    key={structure.structureNumber}
                    value={`structure-${structure.structureNumber}`}
                  >
                    Structure {structure.structureNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.structures.map((structure) => (
                    <Card
                      key={structure.structureNumber}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        setActiveTab(`structure-${structure.structureNumber}`)
                      }
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Structure {structure.structureNumber}
                        </CardTitle>
                        <CardDescription>
                          {structure.summary.total} checkpoints analyzed
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{structure.summary.pass} passed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <X className="h-4 w-4 text-red-600" />
                            <span>{structure.summary.failed} failed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span>{structure.summary.missing} missing</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback case
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        <div className="text-center text-muted-foreground">
          <p>No comparison data available.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MultiStructureComparisonResults;