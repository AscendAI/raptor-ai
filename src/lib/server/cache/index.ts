import { getTaskData } from "../db/model/task";
import { unstable_cacheTag as cacheTag } from 'next/cache'


export async function getCachedTaskData(
  userId: string,
  taskId: string
) {
  "use cache";
  cacheTag(`task-${taskId}`, `user-${userId}-tags`);

  return getTaskData(userId, taskId);
}
