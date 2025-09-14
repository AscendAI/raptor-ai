import { db } from "@/lib/server/db";
import { task } from "@/lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import type { TaskInsert, TaskSelect } from "@/lib/server/db/schema/task";

type TaskUpsertData = Partial<
  Omit<TaskInsert, "id" | "userId" | "createdAt" | "updatedAt">
>;

export async function upsertTaskData(
  userId: string,
  taskId: string,
  data: TaskUpsertData
) {
  const now = new Date();
  await db
    .insert(task)
    .values({
      id: taskId,
      userId,
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: task.id,
      set: { ...data, updatedAt: now },
    });
}

export async function getTaskData(
  userId: string,
  taskId: string
) {
  return db.query.task.findFirst({
    where: (tbl, { and, eq }) =>
      and(eq(tbl.id, taskId), eq(tbl.userId, userId)),
  });
}

// Optional: delete a task (currently a no-op to preserve history)
export async function deleteTask(userId: string, taskId: string) {
  const rows = await db
    .delete(task)
    .where(and(eq(task.id, taskId), eq(task.userId, userId)))
    .returning({ id: task.id });
  return { success: rows.length > 0 } as const;
}
