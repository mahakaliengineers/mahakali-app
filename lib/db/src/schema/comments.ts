import { mysqlTable, int, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";
import { usersTable } from "./users";

export const commentsTable = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => usersTable.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
