'use server';

import { getAuthSession } from '@/lib/server/auth';
import { getTaskData } from '@/lib/server/db/services/tasksService';
import { type RoofReportData, type InsuranceReportData } from '../../types/extraction';

// Retrieve user-modified extracted data
export async function getUserReviewData(taskId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const t = await getTaskData(session.user.id, taskId);

    if (!t || !t.roofData) {
      return {
        success: false,
        error: 'Task not found or roof data missing',
      };
    }

    return {
      success: true,
      data: {
        roofData: t.roofData as RoofReportData,
        insuranceData: t.insuranceData as InsuranceReportData | undefined,
        files: t.files || [],
        createdAt: t.createdAt!,
        updatedAt: t.updatedAt!,
      },
    };
  } catch (error) {
    console.error('Error retrieving user review data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}