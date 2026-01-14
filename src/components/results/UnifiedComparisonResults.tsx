'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import { X, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type ComparisonResult,
  type ComparisonCheckpoint,
} from '@/lib/types/comparison';
import { cn } from '@/lib/utils';
import { ComparisonAccordionItem } from './shared/ComparisonAccordionItem';
import { StructureSummaryHeader } from './shared/StructureSummaryHeader';

interface UnifiedComparisonResultsProps {
  data: ComparisonResult;
  isEditable?: boolean;
  onChange?: (data: ComparisonResult) => void;
  className?: string;
}

export function UnifiedComparisonResults({
  data,
  isEditable = false,
  onChange,
  className,
}: UnifiedComparisonResultsProps) {
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
    if (!isEditable || !onChange || !data.comparisons) return;

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
  };

  const handleAddSingleComparison = () => {
    if (!isEditable || !onChange || !data.comparisons) return;

    const newCheckpoint: ComparisonCheckpoint = {
      checkpoint: 'New Checkpoint',
      status: 'missing',
      roof_report_value: null,
      insurance_report_value: null,
      notes: '',
      warning: null,
    };

    const newComparisons = [...data.comparisons, newCheckpoint];

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
  };

  const handleDeleteSingleComparison = (index: number) => {
    if (!isEditable || !onChange || !data.comparisons) return;

    const newComparisons = data.comparisons.filter((_, i) => i !== index);

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
  };

  const handleStructureChange = (
    structureNumber: number,
    comparisonIndex: number,
    updated: ComparisonCheckpoint
  ) => {
    if (!isEditable || !onChange || !data.structures) return;

    const newStructures = data.structures.map((s) => {
      if (s.structureNumber === structureNumber) {
        const newComparisons = [...s.comparisons];
        newComparisons[comparisonIndex] = updated;

        // Recalculate structure summary
        const newSummary = {
          pass: newComparisons.filter((c) => c.status === 'pass').length,
          failed: newComparisons.filter((c) => c.status === 'failed').length,
          missing: newComparisons.filter((c) => c.status === 'missing').length,
          total: newComparisons.length,
        };

        return {
          ...s,
          comparisons: newComparisons,
          summary: newSummary,
        };
      }
      return s;
    });

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
  };

  const handleAddStructureComparison = (structureNumber: number) => {
    if (!isEditable || !onChange || !data.structures) return;

    const newCheckpoint: ComparisonCheckpoint = {
      checkpoint: 'New Checkpoint',
      status: 'missing',
      roof_report_value: null,
      insurance_report_value: null,
      notes: '',
      warning: null,
    };

    const newStructures = data.structures.map((s) => {
      if (s.structureNumber === structureNumber) {
        const newComparisons = [...s.comparisons, newCheckpoint];

        // Recalculate structure summary
        const newSummary = {
          pass: newComparisons.filter((c) => c.status === 'pass').length,
          failed: newComparisons.filter((c) => c.status === 'failed').length,
          missing: newComparisons.filter((c) => c.status === 'missing').length,
          total: newComparisons.length,
        };

        return {
          ...s,
          comparisons: newComparisons,
          summary: newSummary,
        };
      }
      return s;
    });

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
  };

  const handleDeleteStructureComparison = (
    structureNumber: number,
    comparisonIndex: number
  ) => {
    if (!isEditable || !onChange || !data.structures) return;

    const newStructures = data.structures.map((s) => {
      if (s.structureNumber === structureNumber) {
        const newComparisons = s.comparisons.filter(
          (_, i) => i !== comparisonIndex
        );

        // Recalculate structure summary
        const newSummary = {
          pass: newComparisons.filter((c) => c.status === 'pass').length,
          failed: newComparisons.filter((c) => c.status === 'failed').length,
          missing: newComparisons.filter((c) => c.status === 'missing').length,
          total: newComparisons.length,
        };

        return {
          ...s,
          comparisons: newComparisons,
          summary: newSummary,
        };
      }
      return s;
    });

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
        <StructureSummaryHeader
          summary={data.summary}
          isEditMode={isEditable}
        />

        <Accordion type="multiple" className="space-y-3">
          {data.comparisons.map((comparison, index) => (
            <ComparisonAccordionItem
              key={index}
              comparison={comparison}
              index={index}
              isEditable={isEditable}
              onChange={
                isEditable
                  ? (updated) => handleSingleComparisonChange(index, updated)
                  : undefined
              }
              onDelete={
                isEditable
                  ? () => handleDeleteSingleComparison(index)
                  : undefined
              }
              variant="compact"
            />
          ))}
        </Accordion>

        {isEditable && (
          <Button
            onClick={handleAddSingleComparison}
            variant="outline"
            className="w-full border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Checkpoint
          </Button>
        )}
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
              <div className="space-y-6">
                <StructureSummaryHeader
                  structure={structure}
                  summary={structure.summary}
                  isEditMode={isEditable}
                />

                <Accordion type="multiple" className="space-y-3">
                  {structure.comparisons.map((comparison, index) => (
                    <ComparisonAccordionItem
                      key={index}
                      comparison={comparison}
                      index={index}
                      isEditable={isEditable}
                      onChange={
                        isEditable
                          ? (updated) =>
                              handleStructureChange(
                                structure.structureNumber,
                                index,
                                updated
                              )
                          : undefined
                      }
                      onDelete={
                        isEditable
                          ? () =>
                              handleDeleteStructureComparison(
                                structure.structureNumber,
                                index
                              )
                          : undefined
                      }
                      variant="compact"
                    />
                  ))}
                </Accordion>

                {isEditable && (
                  <Button
                    onClick={() =>
                      handleAddStructureComparison(structure.structureNumber)
                    }
                    variant="outline"
                    className="w-full border-dashed border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Result Point
                  </Button>
                )}
              </div>
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
