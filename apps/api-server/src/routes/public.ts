import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, usersTable, testimonialsTable, photosTable, milestonesTable } from "@workspace/db/schema";
import { eq, sql, and } from "drizzle-orm";

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

// Single public project detail
router.get("/public/projects/:id", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [project] = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        description: projectsTable.description,
        location: projectsTable.location,
        type: projectsTable.type,
        status: projectsTable.status,
        progress: projectsTable.progress,
        startDate: projectsTable.startDate,
        endDate: projectsTable.endDate,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);

    if (!project) { res.status(404).json({ error: "Project not found" }); return; }

    // Approved photos only
    const photos = await db
      .select({ id: photosTable.id, url: photosTable.url, caption: photosTable.caption })
      .from(photosTable)
      .where(and(eq(photosTable.projectId, id), eq(photosTable.status, "approved")))
      .limit(20);

    // Milestones (titles + completion only)
    const milestones = await db
      .select({
        id: milestonesTable.id,
        title: milestonesTable.title,
        completed: sql<boolean>`completed_at is not null`,
        order: milestonesTable.order,
      })
      .from(milestonesTable)
      .where(eq(milestonesTable.projectId, id))
      .orderBy(milestonesTable.order);

    // Approved testimonials for this project
    const testimonials = await db
      .select({
        id: testimonialsTable.id,
        authorName: testimonialsTable.authorName,
        authorRole: testimonialsTable.authorRole,
        text: testimonialsTable.text,
        rating: testimonialsTable.rating,
      })
      .from(testimonialsTable)
      .where(and(eq(testimonialsTable.projectId, id), eq(testimonialsTable.status, "approved")));

    res.json({ ...project, photos, milestones, testimonials });
  } catch {
    res.status(500).json({ error: "Failed to load project" });
  }
});

// Public approved testimonials
router.get("/public/testimonials", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: testimonialsTable.id,
        authorName: testimonialsTable.authorName,
        authorRole: testimonialsTable.authorRole,
        text: testimonialsTable.text,
        rating: testimonialsTable.rating,
        createdAt: testimonialsTable.createdAt,
      })
      .from(testimonialsTable)
      .where(eq(testimonialsTable.status, "approved"))
      .orderBy(sql`created_at desc`)
      .limit(20);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to load testimonials" });
  }
});

// Admin: approve/reject testimonials
router.patch("/public/testimonials/:id/approve", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(testimonialsTable).set({ status: "approved" }).where(eq(testimonialsTable.id, id));
  res.json({ ok: true });
});

router.patch("/public/testimonials/:id/reject", async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(testimonialsTable).set({ status: "rejected" }).where(eq(testimonialsTable.id, id));
  res.json({ ok: true });
});

export default router;
