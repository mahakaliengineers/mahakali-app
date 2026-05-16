import { Router } from "express";
import { db } from "@workspace/db";
import {
  photosTable, documentsTable, updatesTable, paymentsTable, milestonesTable, usersTable
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  AddPhotoBody, AddDocumentBody, AddUpdateBody,
  AddMilestoneBody, UpdateMilestoneBody,
  AddPaymentBody, UpdatePaymentBody
} from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  }).catch(next);
}

router.post("/admin/projects/:id/photos", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddPhotoBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [photo] = await db.insert(photosTable).values({
    projectId: id, url: parsed.data.url, caption: parsed.data.caption ?? null,
  }).returning();
  res.status(201).json(photo);
});

router.delete("/admin/photos/:id", requireAdmin, async (req, res) => {
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
  const [doc] = await db.insert(documentsTable).values({
    projectId: id, name: parsed.data.name, url: parsed.data.url, type: parsed.data.type ?? "other",
  }).returning();
  res.status(201).json(doc);
});

router.post("/admin/projects/:id/updates", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddUpdateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [update] = await db.insert(updatesTable).values({
    projectId: id, message: parsed.data.message,
  }).returning();
  res.status(201).json(update);
});

router.post("/admin/projects/:id/milestones", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddMilestoneBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [milestone] = await db.insert(milestonesTable).values({
    projectId: id, title: parsed.data.title, description: parsed.data.description ?? null, order: parsed.data.order ?? 0,
  }).returning();
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
  const [milestone] = await db.update(milestonesTable).set(updates).where(eq(milestonesTable.id, id)).returning();
  if (!milestone) { res.status(404).json({ error: "Not found" }); return; }
  res.json(milestone);
});

router.post("/admin/projects/:id/payments", requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = AddPaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const [payment] = await db.insert(paymentsTable).values({
    projectId: id,
    label: parsed.data.label,
    amount: parsed.data.amount,
    status: (parsed.data.status as any) ?? "pending",
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
  }).returning();
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
  const [payment] = await db.update(paymentsTable).set(updates).where(eq(paymentsTable.id, id)).returning();
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(payment);
});

export default router;
