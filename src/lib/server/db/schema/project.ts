import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});