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
      className={cn('rounded-lg border', config.bgColor, config.borderColor)}
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
          {comparison.warning && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Warning
              </h5>
              <p className="text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded border border-amber-200 dark:border-amber-800">
                {comparison.warning}
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Structure {structure.structureNumber} Analysis</CardTitle>
          <CardDescription>
            Detailed comparison results for structure{' '}
            {structure.structureNumber}
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
      <div className={cn('w-full', className)}>
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Detailed comparison between roof and insurance reports
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
      <div className={cn('w-full', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Badge variant="outline">
                {data.structureCount}{' '}
                {data.structureCount === 1 ? 'structure' : 'structures'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Detailed comparison results for each structure
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="text-sm"
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
