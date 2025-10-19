import { getTaskData } from "../db/services/tasksService";
import { unstable_cache as cache , revalidateTag} from "next/cache";

export const getCachedTaskData = (userId: string, taskId: string) => {
  const cachedFn = cache(
    async () => {
      return await getTaskData(userId, taskId);
    },
    [`user-${userId}`, `task-${taskId}`],
    { tags: [`user-${userId}-task`, `task-${taskId}`] }
  );
  return cachedFn();
}

export function revalidateTaskData(taskId: string) {
  return revalidateTag(`task-${taskId}`);
}
