import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, usersTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

// Public stats — no auth required
router.get("/public/stats", async (_req, res) => {
  try {
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(projectsTable);

    const [{ completed }] = await db
      .select({ completed: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(eq(projectsTable.status, "completed"));

    const [{ active }] = await db
      .select({ active: sql<number>`count(*)::int` })
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"));

    const [{ clients }] = await db
      .select({ clients: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(eq(usersTable.role, "client"));

    res.json({ total, completed, active, clients });
  } catch {
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// Public featured projects — latest 3 active or completed
router.get("/public/projects", async (_req, res) => {
  try {
    const projects = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        location: projectsTable.location,
        type: projectsTable.type,
        status: projectsTable.status,
        progress: projectsTable.progress,
        description: projectsTable.description,
      })
      .from(projectsTable)
      .orderBy(sql`case when status = 'completed' then 1 when status = 'active' then 2 else 3 end, created_at desc`)
      .limit(3);

    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to load projects" });
  }
});

export default router;
