import { mysqlTable, int, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const updatesTable = mysqlTable("updates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const insertUpdateSchema = createInsertSchema(updatesTable).omit({ id: true, postedAt: true });
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updatesTable.$inferSelect;
