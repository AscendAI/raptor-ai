import { z } from 'zod';

// Status enum for comparison checkpoints
export const ComparisonStatus = z.enum(['pass', 'failed', 'missing']);
export type ComparisonStatus = z.infer<typeof ComparisonStatus>;

// Individual comparison checkpoint schema
export const ComparisonCheckpoint = z.object({
  checkpoint: z.string(),
  status: ComparisonStatus,
  roof_report_value: z.string().nullable(),
  insurance_report_value: z.string().nullable(),
  notes: z.string(),
  // Optional warning message for edge cases (e.g., ridge cut from 3-tab)
  warning: z.string().optional().nullable().default(null),
});
export type ComparisonCheckpoint = z.infer<typeof ComparisonCheckpoint>;

// Structure-specific comparison result
export const StructureComparison = z.object({
  structureNumber: z.number(),
  summary: z.object({
    pass: z.number(),
    failed: z.number(),
    missing: z.number(),
    total: z.number(),
  }),
  comparisons: z.array(ComparisonCheckpoint),
});
export type StructureComparison = z.infer<typeof StructureComparison>;

// Summary statistics schema
export const ComparisonSummary = z.object({
  pass: z.number(),
  failed: z.number(),
  missing: z.number(),
  total: z.number(),
});
export type ComparisonSummary = z.infer<typeof ComparisonSummary>;

// Main comparison result schema - supports both single and multi-structure
export const ComparisonResult = z.object({
  success: z.boolean(),
  structureCount: z.number().default(1),
  summary: ComparisonSummary,
  comparisons: z.array(ComparisonCheckpoint).optional(), // For backward compatibility (single structure)
  structures: z.array(StructureComparison).optional(), // For multi-structure comparisons
});
export type ComparisonResult = z.infer<typeof ComparisonResult>;

// Helper function to calculate summary from comparisons
export function calculateSummary(
  comparisons: ComparisonCheckpoint[]
): ComparisonSummary {
  const summary = {
    pass: 0,
    failed: 0,
    missing: 0,
    total: comparisons.length,
  };

  comparisons.forEach((comparison) => {
    summary[comparison.status]++;
  });

  return summary;
}

// Helper function to calculate overall summary from structure comparisons
export function calculateOverallSummary(
  structures: StructureComparison[]
): ComparisonSummary {
  const overallSummary = {
    pass: 0,
    failed: 0,
    missing: 0,
    total: 0,
  };

  structures.forEach((structure) => {
    overallSummary.pass += structure.summary.pass;
    overallSummary.failed += structure.summary.failed;
    overallSummary.missing += structure.summary.missing;
    overallSummary.total += structure.summary.total;
  });

  return overallSummary;
}

// Status display helpers
export const statusConfig = {
  pass: {
    label: 'Pass',
    icon: 'Check',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  failed: {
    label: 'Failed',
    icon: 'X',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  missing: {
    label: 'Missing',
    icon: 'AlertTriangle',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
} as const;
