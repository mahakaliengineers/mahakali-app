import { mysqlTable, int, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { usersTable } from "./users";
import { fileStatusValues } from "./photos";

export const documentsTable = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  uploadedById: int("uploaded_by_id").references(() => usersTable.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull().default("other"),
  status: mysqlEnum("status", fileStatusValues).notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, uploadedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
