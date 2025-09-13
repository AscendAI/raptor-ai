import { db } from '@/lib/server/db';
import { task } from '@/lib/server/db/schema';
import type { InsuranceReportData, RoofReportData } from '@/lib/schemas/extraction';
import type { ComparisonResult } from '@/lib/schemas/comparison';
import type { FileData } from '@/lib/schemas/files';

type UpsertPayload = Partial<{
  name: string | null;
  image: string | null;
  description: string | null;
  files: FileData[] | null;
  roofData: RoofReportData | null;
  insuranceData: InsuranceReportData | null;
  comparison: ComparisonResult | null;
}>;

export async function upsertTaskData(
  userId: string,
  taskId: string,
  data: UpsertPayload
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

export async function getTaskData(userId: string, taskId: string) {
  return db.query.task.findFirst({
    where: (tbl, { and, eq }) => and(eq(tbl.id, taskId), eq(tbl.userId, userId)),
    columns: {
      roofData: true,
      insuranceData: true,
      comparison: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

// getAnalysis merged into getTaskData

// Optional: delete a task (not used currently)
export async function deleteTask(_userId: string, _taskId: string) {
  // Intentionally a no-op for now to preserve history
  return { success: true } as const;
}
