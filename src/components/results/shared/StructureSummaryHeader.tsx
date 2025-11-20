import React from 'react';
import { type StructureComparison } from '@/lib/types/comparison';

interface StructureSummaryHeaderProps {
  structure?: StructureComparison;
  summary: {
    pass: number;
    failed: number;
    missing: number;
    total: number;
  };
  title?: string;
  description?: string;
  isEditMode?: boolean;
}

export function StructureSummaryHeader({
  structure,
  summary,
  title,
  description,
  isEditMode = false,
}: StructureSummaryHeaderProps) {
  const displayTitle =
    title ||
    (structure ? `Structure ${structure.structureNumber}` : 'Analysis Results');
  const displayDescription =
    description ||
    (isEditMode
      ? 'Edit comparison data below'
      : 'Detailed comparison analysis results');

  return (
    <div className="border rounded-xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {displayTitle}
            {isEditMode && ' (Edit Mode)'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{displayDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="text-center">
              <div className="text-xs text-emerald-600 font-medium">Pass</div>
              <div className="text-sm font-semibold text-emerald-700">
                {summary.pass}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-red-600 font-medium">Failed</div>
              <div className="text-sm font-semibold text-red-700">
                {summary.failed}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-amber-600 font-medium">Missing</div>
              <div className="text-sm font-semibold text-amber-700">
                {summary.missing}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
