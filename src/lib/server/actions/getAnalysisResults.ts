'use server';

import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { type RoofReportData, type InsuranceReportData } from '../../types/extraction';
import { type ComparisonResult } from '../../types/comparison';

// Retrieve analysis results
export async function getAnalysisResults(taskId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const t = await getTaskData(session.user.id, taskId);

    if (!t || !t.comparison) {
      return {
        success: false,
        error: 'Analysis results not found for this task',
      };
    }

    return {
      success: true,
      data: {
        roofData: t.roofData as RoofReportData,
        insuranceData: t.insuranceData as InsuranceReportData,
        comparison: t.comparison as ComparisonResult,
        completedAt: t.updatedAt!,
      },
    };
  } catch (error) {
    console.error('Error retrieving analysis results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}