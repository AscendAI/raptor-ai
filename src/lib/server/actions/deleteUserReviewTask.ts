'use server';

import { getAuthSession } from '@/lib/server/auth';
import { deleteTask as modelDeleteTask } from '@/lib/server/db/services/tasksService';

// Delete a user review session
export async function deleteUserReviewTask(taskId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' };
    }

    const res = await modelDeleteTask(session.user.id, taskId);
    return {
      success: res.success,
      message: res.success ? 'Task deleted successfully' : 'Task not found',
    };
  } catch (error) {
    console.error('Error deleting user review session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}