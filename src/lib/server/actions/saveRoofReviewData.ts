'use server';

import { getAuthSession } from '@/lib/server/auth';
import { revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';
import { type RoofReportData } from '../../types/extraction';

// Save only roof data edits without touching insurance data
export async function saveRoofReviewData(
  taskId: string,
  roofData: RoofReportData
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' } as const;
    }

    await upsertTaskData(session.user.id, taskId, { roofData });
    revalidateTaskData(taskId);

    return {
      success: true,
      taskId,
      message: 'Roof data saved successfully',
    } as const;
  } catch (error) {
    console.error('Error saving roof review data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    } as const;
  }
}