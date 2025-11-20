'use server';

import { getAuthSession } from '@/lib/server/auth';
import { revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';
import { type ComparisonResult } from '../../types/comparison';

// Save user-modified comparison results
export async function saveComparisonResults(
  taskId: string,
  comparisonData: ComparisonResult
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    await upsertTaskData(session.user.id, taskId, {
      comparison: comparisonData,
    });
    revalidateTaskData(taskId);

    return {
      success: true,
      taskId,
      message: 'Comparison results saved successfully',
    };
  } catch (error) {
    console.error('Error saving comparison results:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
