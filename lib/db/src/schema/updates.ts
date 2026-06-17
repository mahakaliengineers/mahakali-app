import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const updatesTable = pgTable("updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUpdateSchema = createInsertSchema(updatesTable).omit({ id: true, postedAt: true });
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updatesTable.$inferSelect;
