'use server';

import { randomUUID } from 'crypto';
import { getAuthSession } from '@/lib/server/auth';
import { revalidateTaskData } from '../cache';
import { upsertTaskData } from '@/lib/server/db/services/tasksService';

// Create a new task with a name and return a server-generated taskId
export async function startNewTask(name: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return { success: false, error: 'Not authenticated' } as const;
    }

    const trimmedName = (name ?? '').trim();
    if (!trimmedName) {
      return { success: false, error: 'Task name is required' } as const;
    }

    const taskId = randomUUID();
    await upsertTaskData(session.user.id, taskId, { name: trimmedName });
    revalidateTaskData(taskId);

    return { success: true, taskId } as const;
  } catch (error) {
    console.error('Error starting new task:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    } as const;
  }
}