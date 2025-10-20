import { pgTable, text, timestamp, json } from 'drizzle-orm/pg-core';
import { user } from './auth';
import type {
  InsuranceReportData,
  RoofReportData,
} from '@/lib/types/extraction';
import type { ComparisonResult } from '@/lib/types/comparison';
import { FileData } from '@/lib/types/files';

export const task = pgTable('task', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text('name'),
  image: text('image'),
  description: text('description'),
  roofData: json('roof_data').$type<RoofReportData>(),
  insuranceData: json('insurance_data').$type<InsuranceReportData>(),
  comparison: json('comparison').$type<ComparisonResult>(),
  files: json('files').$type<FileData[]>(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type TaskInsert = typeof task.$inferInsert;
export type TaskSelect = typeof task.$inferSelect;
