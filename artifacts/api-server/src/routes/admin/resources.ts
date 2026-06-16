import { Router } from "express";
import { db } from "@workspace/db";
import {
  photosTable, documentsTable, updatesTable, paymentsTable, milestonesTable, usersTable, projectsTable
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  AddPhotoBody, AddDocumentBody, AddUpdateBody,
  AddMilestoneBody, UpdateMilestoneBody,
  AddPaymentBody, UpdatePaymentBody
} from "@workspace/api-zod";

const router = Router();

async function getSessionUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ?? null;
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getSessionUser(req.session.userId).then((user) => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    req.sessionUser = user;
    next();
  }).catch(next);
}

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getSessionUser(req.session.userId).then((user) => {
    if (!user || user.role !== "super_admin") {
      res.status(403).json({ error: "Forbidden — Super Admin only" }); return;
    }
    req.sessionUser = user;
    next();
  }).catch(next);
}

router.post("/admin/projects/:id/photos", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddPhotoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [{ id: newId }] = await db.insert(photosTable).values({
    projectId: id,
    url: parsed.data.url,
    caption: parsed.data.caption ?? null,
    uploadedById: req.session!.userId as number,
    status: "pending",
  }).$returningId();
  const [photo] = await db.select().from(photosTable).where(eq(photosTable.id, newId));
  res.status(201).json(photo);
});

router.patch("/admin/photos/:id/approve", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(photosTable).set({ status: "approved" }).where(eq(photosTable.id, id));
  const [photo] = await db.select().from(photosTable).where(eq(photosTable.id, id));
  if (!photo) { res.status(404).json({ error: "Not found" }); return; }
  res.json(photo);
});

router.delete("/admin/photos/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(photosTable).where(eq(photosTable.id, id));
  res.status(204).send();
});

router.post("/admin/projects/:id/documents", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddDocumentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [{ id: newId }] = await db.insert(documentsTable).values({
    projectId: id,
    name: parsed.data.name,
    url: parsed.data.url,
    type: parsed.data.type ?? "other",
    uploadedById: req.session!.userId as number,
    status: "pending",
  }).$returningId();
  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, newId));
  res.status(201).json(doc);
});

router.patch("/admin/documents/:id/approve", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.update(documentsTable).set({ status: "approved" }).where(eq(documentsTable.id, id));
  const [doc] = await db.select().from(documentsTable).where(eq(documentsTable.id, id));
  if (!doc) { res.status(404).json({ error: "Not found" }); return; }
  res.json(doc);
});

router.delete("/admin/documents/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(documentsTable).where(eq(documentsTable.id, id));
  res.status(204).send();
});

router.post("/admin/projects/:id/updates", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddUpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [{ id: newId }] = await db.insert(updatesTable).values({
    projectId: id, message: parsed.data.message,
  }).$returningId();
  const [update] = await db.select().from(updatesTable).where(eq(updatesTable.id, newId));
  res.status(201).json(update);
});

router.post("/admin/projects/:id/milestones", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddMilestoneBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [{ id: newId }] = await db.insert(milestonesTable).values({
    projectId: id, title: parsed.data.title, description: parsed.data.description ?? null, order: parsed.data.order ?? 0,
  }).$returningId();
  const [milestone] = await db.select().from(milestonesTable).where(eq(milestonesTable.id, newId));
  res.status(201).json(milestone);
});

router.patch("/admin/milestones/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateMilestoneBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates["title"] = parsed.data.title;
  if (parsed.data.completedAt !== undefined) updates["completedAt"] = parsed.data.completedAt ? new Date(parsed.data.completedAt) : null;
  await db.update(milestonesTable).set(updates).where(eq(milestonesTable.id, id));
  const [milestone] = await db.select().from(milestonesTable).where(eq(milestonesTable.id, id));
  if (!milestone) { res.status(404).json({ error: "Not found" }); return; }
  res.json(milestone);
});

router.post("/admin/projects/:id/payments", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [{ id: newId }] = await db.insert(paymentsTable).values({
    projectId: id,
    label: parsed.data.label,
    amount: parsed.data.amount,
    status: (parsed.data.status as any) ?? "pending",
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
  }).$returningId();
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, newId));
  res.status(201).json(payment);
});

router.patch("/admin/payments/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdatePaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates["status"] = parsed.data.status;
  if (parsed.data.paidAt !== undefined) updates["paidAt"] = parsed.data.paidAt ? new Date(parsed.data.paidAt) : null;
  await db.update(paymentsTable).set(updates).where(eq(paymentsTable.id, id));
  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(payment);
});

router.get("/admin/pending", requireSuperAdmin, async (_req, res) => {
  const pendingPhotos = await db
    .select({
      id: photosTable.id,
      projectId: photosTable.projectId,
      projectTitle: projectsTable.title,
      uploadedById: photosTable.uploadedById,
      uploaderName: usersTable.name,
      url: photosTable.url,
      caption: photosTable.caption,
      status: photosTable.status,
      uploadedAt: photosTable.uploadedAt,
    })
    .from(photosTable)
    .innerJoin(projectsTable, eq(photosTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(photosTable.uploadedById, usersTable.id))
    .where(eq(photosTable.status, "pending"));

  const pendingDocs = await db
    .select({
      id: documentsTable.id,
      projectId: documentsTable.projectId,
      projectTitle: projectsTable.title,
      uploadedById: documentsTable.uploadedById,
      uploaderName: usersTable.name,
      name: documentsTable.name,
      url: documentsTable.url,
      type: documentsTable.type,
      status: documentsTable.status,
      uploadedAt: documentsTable.uploadedAt,
    })
    .from(documentsTable)
    .innerJoin(projectsTable, eq(documentsTable.projectId, projectsTable.id))
    .leftJoin(usersTable, eq(documentsTable.uploadedById, usersTable.id))
    .where(eq(documentsTable.status, "pending"));

  res.json({ photos: pendingPhotos, documents: pendingDocs });
});

export default router;
