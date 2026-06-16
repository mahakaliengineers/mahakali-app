import { mysqlTable, int, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { usersTable } from "./users";

export const fileStatusValues = ["pending", "approved"] as const;

export const photosTable = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  uploadedById: int("uploaded_by_id").references(() => usersTable.id),
  url: text("url").notNull(),
  caption: text("caption"),
  status: mysqlEnum("status", fileStatusValues).notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertPhotoSchema = createInsertSchema(photosTable).omit({ id: true, uploadedAt: true });
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photosTable.$inferSelect;
