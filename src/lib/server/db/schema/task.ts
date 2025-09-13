import { pgTable, text, timestamp, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import type { InsuranceReportData, RoofReportData } from "@/lib/schemas/extraction";
import type { ComparisonResult } from "@/components/results";

export const task = pgTable("task", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  name: text("name"),
  image: text("image"),
  description: text("description"),
  roofData: json("roof_data").$type<RoofReportData>(),
  insuranceData: json("insurance_data").$type<InsuranceReportData>(),
  comparison: json("comparison").$type<ComparisonResult>(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});
