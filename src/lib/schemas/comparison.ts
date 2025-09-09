import { z } from 'zod';

// Status enum for comparison checkpoints
export const ComparisonStatus = z.enum(['green', 'red', 'missing']);
export type ComparisonStatus = z.infer<typeof ComparisonStatus>;

// Individual comparison checkpoint schema
export const ComparisonCheckpoint = z.object({
  checkpoint: z.string(),
  status: ComparisonStatus,
  roof_report_value: z.string().nullable(),
  insurance_report_value: z.string().nullable(),
  notes: z.string()
});
export type ComparisonCheckpoint = z.infer<typeof ComparisonCheckpoint>;

// Summary statistics schema
export const ComparisonSummary = z.object({
  green: z.number(),
  red: z.number(),
  missing: z.number(),
  total: z.number()
});
export type ComparisonSummary = z.infer<typeof ComparisonSummary>;

// Main comparison result schema
export const ComparisonResult = z.object({
  success: z.boolean(),
  summary: ComparisonSummary,
  comparisons: z.array(ComparisonCheckpoint)
});
export type ComparisonResult = z.infer<typeof ComparisonResult>;

// Helper function to calculate summary from comparisons
export function calculateSummary(comparisons: ComparisonCheckpoint[]): ComparisonSummary {
  const summary = {
    green: 0,
    red: 0,
    missing: 0,
    total: comparisons.length
  };

  comparisons.forEach(comparison => {
    summary[comparison.status]++;
  });

  return summary;
}

// Status display helpers
export const statusConfig = {
  green: {
    label: 'Pass',
    icon: '✅',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  red: {
    label: 'Fail',
    icon: '❌',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  missing: {
    label: 'Missing',
    icon: '⚠️',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  }
} as const;