'use server';

import { getAuthSession } from '@/lib/server/auth';
import { revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';
import { type RoofReportData, type InsuranceReportData } from '../../types/extraction';

// Save user-modified extracted data
export async function saveUserReviewData(
  taskId: string,
  roofData: RoofReportData,
  insuranceData: InsuranceReportData
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    await upsertTaskData(session.user.id, taskId, { roofData, insuranceData });
    revalidateTaskData(taskId);

    return {
      success: true,
      taskId,
      message: 'User review data saved successfully',
    };
  } catch (error) {
    console.error('Error saving user review data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}