import { mysqlTable, int, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const projectsTable = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("client_id").notNull().references(() => usersTable.id),
  title: text("title").notNull(),
  location: text("location"),
  type: text("type"),
  status: mysqlEnum("status", ["planning", "active", "on_hold", "completed"]).notNull().default("planning"),
  progress: int("progress").notNull().default(0),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
