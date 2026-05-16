import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { CreateProjectBody, UpdateProjectBody } from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  }).catch(next);
}

router.post("/admin/projects", requireAdmin, async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const { clientId, title, location, type, status, progress, description, startDate, endDate } = parsed.data;
  const [project] = await db.insert(projectsTable).values({
    clientId,
    title,
    location: location ?? null,
    type: type ?? null,
    status: (status as any) ?? "planning",
    progress: progress ?? 0,
    description: description ?? null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }).returning();
  res.status(201).json(project);
});

router.patch("/admin/projects/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const { title, location, type, status, progress, description, startDate, endDate } = parsed.data;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates["title"] = title;
  if (location !== undefined) updates["location"] = location;
  if (type !== undefined) updates["type"] = type;
  if (status !== undefined) updates["status"] = status;
  if (progress !== undefined) updates["progress"] = progress;
  if (description !== undefined) updates["description"] = description;
  if (startDate !== undefined) updates["startDate"] = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) updates["endDate"] = endDate ? new Date(endDate) : null;
  const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!project) { res.status(404).json({ error: "Not found" }); return; }
  res.json(project);
});

export default router;
