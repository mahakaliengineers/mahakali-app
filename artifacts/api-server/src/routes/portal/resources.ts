import { Router } from "express";
import { db } from "@workspace/db";
import { photosTable, documentsTable, updatesTable, paymentsTable, milestonesTable, projectsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

async function canAccessProject(userId: number, projectId: number): Promise<boolean> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return false;
  if (user.role === "admin") return true;
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
  return project?.clientId === userId;
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/portal/projects/:id/photos", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }
  const photos = await db.select().from(photosTable).where(eq(photosTable.projectId, id)).orderBy(photosTable.uploadedAt);
  res.json(photos);
});

router.get("/portal/projects/:id/documents", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }
  const docs = await db.select().from(documentsTable).where(eq(documentsTable.projectId, id)).orderBy(documentsTable.uploadedAt);
  res.json(docs);
});

router.get("/portal/projects/:id/updates", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }
  const updates = await db.select().from(updatesTable).where(eq(updatesTable.projectId, id)).orderBy(updatesTable.postedAt);
  res.json(updates);
});

router.get("/portal/projects/:id/payments", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.projectId, id)).orderBy(paymentsTable.createdAt);
  res.json(payments);
});

router.get("/portal/projects/:id/milestones", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }
  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.projectId, id)).orderBy(milestonesTable.order);
  res.json(milestones);
});

export default router;
