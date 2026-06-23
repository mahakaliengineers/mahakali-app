import { Router } from "express";
import { db } from "@workspace/db";
import {
  photosTable, documentsTable, updatesTable, paymentsTable, milestonesTable, usersTable, projectsTable, projectAssignmentsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;
const BROAD_ROLES = ["super_admin", "admin", "project_manager"] as const;
const FULL_ACCESS_ROLES = ["super_admin", "admin"] as const;

async function getStaffUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) return null;
  return user;
}

function requireStaff(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user) { res.status(403).json({ error: "Forbidden" }); return; }
    req.staffUser = user;
    next();
  }).catch(next);
}

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || user.role !== "super_admin") {
      res.status(403).json({ error: "Super Admin only" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

function requireFullAccess(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(FULL_ACCESS_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Admin or Super Admin only" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

// Check if a staff user can act on a specific project (broad roles: all; others: must be assigned)
async function canActOnProject(user: any, projectId: number): Promise<boolean> {
  if ((BROAD_ROLES as readonly string[]).includes(user.role)) return true;
  const [assignment] = await db
    .select()
    .from(projectAssignmentsTable)
    .where(and(eq(projectAssignmentsTable.projectId, projectId), eq(projectAssignmentsTable.userId, user.id)))
    .limit(1);
  return !!assignment;
}

// ─── MILESTONES ────────────────────────────────────────────────────────────────

router.get("/staff/projects/:id/milestones", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(await canActOnProject(req.staffUser, id))) { res.status(403).json({ error: "Forbidden" }); return; }
  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.projectId, id)).orderBy(milestonesTable.order);
  res.json(milestones);
});

router.post("/staff/projects/:id/milestones", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(await canActOnProject(req.staffUser, id))) { res.status(403).json({ error: "Forbidden" }); return; }
  const { title, description, dueDate, order } = req.body;
  if (!title) { res.status(400).json({ error: "title is required" }); return; }
  const [milestone] = await db.insert(milestonesTable).values({
    projectId: id,
    title,
    description: description ?? null,
    dueDate: dueDate ? new Date(dueDate) : null,
    order: order ?? 0,
  }).returning();
  res.status(201).json(milestone);
});

router.patch("/staff/milestones/:id", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(milestonesTable).where(eq(milestonesTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (!(await canActOnProject(req.staffUser, existing.projectId))) { res.status(403).json({ error: "Forbidden" }); return; }

  const updates: Record<string, unknown> = {};
  const { title, description, dueDate, completedAt, order } = req.body;
  if (title !== undefined) updates["title"] = title;
  if (description !== undefined) updates["description"] = description || null;
  if (dueDate !== undefined) updates["dueDate"] = dueDate ? new Date(dueDate) : null;
  if (order !== undefined) updates["order"] = order;
  if (completedAt !== undefined) {
    updates["completedAt"] = completedAt ? new Date(completedAt) : null;
    // Unverify when re-opening a milestone
    if (!completedAt) { updates["verifiedAt"] = null; updates["verifiedById"] = null; }
  }

  const [milestone] = await db.update(milestonesTable).set(updates).where(eq(milestonesTable.id, id)).returning();
  res.json(milestone);
});

// Super admin verifies a completed milestone
router.patch("/staff/milestones/:id/verify", requireSuperAdmin, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(milestonesTable).where(eq(milestonesTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (!existing.completedAt) { res.status(400).json({ error: "Milestone must be marked complete before verifying" }); return; }
  const [milestone] = await db.update(milestonesTable)
    .set({ verifiedAt: new Date(), verifiedById: req.staffUser.id })
    .where(eq(milestonesTable.id, id))
    .returning();
  res.json(milestone);
});

// Super admin rejects / un-verifies
router.patch("/staff/milestones/:id/reject", requireSuperAdmin, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [milestone] = await db.update(milestonesTable)
    .set({ verifiedAt: null, verifiedById: null, completedAt: null })
    .where(eq(milestonesTable.id, id))
    .returning();
  if (!milestone) { res.status(404).json({ error: "Not found" }); return; }
  res.json(milestone);
});

router.delete("/staff/milestones/:id", requireFullAccess, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(milestonesTable).where(eq(milestonesTable.id, id));
  res.status(204).send();
});

// ─── PHOTOS ────────────────────────────────────────────────────────────────────

router.post("/staff/projects/:id/photos", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(await canActOnProject(req.staffUser, id))) { res.status(403).json({ error: "Forbidden" }); return; }
  const { url, caption } = req.body;
  if (!url) { res.status(400).json({ error: "url is required" }); return; }
  const [photo] = await db.insert(photosTable).values({
    projectId: id,
    url,
    caption: caption ?? null,
    uploadedById: req.staffUser.id,
    status: "pending",
  }).returning();
  res.status(201).json(photo);
});

router.patch("/staff/photos/:id/approve", requireSuperAdmin, async (_req, res) => {
  const id = parseInt((_req.params as any)["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [photo] = await db.update(photosTable).set({ status: "approved" }).where(eq(photosTable.id, id)).returning();
  if (!photo) { res.status(404).json({ error: "Not found" }); return; }
  res.json(photo);
});

router.delete("/staff/photos/:id", requireFullAccess, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(photosTable).where(eq(photosTable.id, id));
  res.status(204).send();
});

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────────

router.post("/staff/projects/:id/documents", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(await canActOnProject(req.staffUser, id))) { res.status(403).json({ error: "Forbidden" }); return; }
  const { name, url, type } = req.body;
  if (!name || !url) { res.status(400).json({ error: "name and url are required" }); return; }
  const [doc] = await db.insert(documentsTable).values({
    projectId: id,
    name,
    url,
    type: type ?? "other",
    uploadedById: req.staffUser.id,
    status: "pending",
  }).returning();
  res.status(201).json(doc);
});

router.patch("/staff/documents/:id/approve", requireSuperAdmin, async (_req, res) => {
  const id = parseInt((_req.params as any)["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [doc] = await db.update(documentsTable).set({ status: "approved" }).where(eq(documentsTable.id, id)).returning();
  if (!doc) { res.status(404).json({ error: "Not found" }); return; }
  res.json(doc);
});

router.delete("/staff/documents/:id", requireFullAccess, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(documentsTable).where(eq(documentsTable.id, id));
  res.status(204).send();
});

// ─── PAYMENTS / BILLING ────────────────────────────────────────────────────────

router.get("/staff/projects/:id/payments", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(await canActOnProject(req.staffUser, id))) { res.status(403).json({ error: "Forbidden" }); return; }
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.projectId, id)).orderBy(paymentsTable.createdAt);
  res.json(payments);
});

router.post("/staff/projects/:id/payments", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (!(BROAD_ROLES as readonly string[]).includes(req.staffUser.role)) {
    res.status(403).json({ error: "Not authorized to add billing records" }); return;
  }
  const { label, amount, status, dueDate } = req.body;
  if (!label || !amount) { res.status(400).json({ error: "label and amount are required" }); return; }
  const [payment] = await db.insert(paymentsTable).values({
    projectId: id,
    label,
    amount: String(amount),
    status: status ?? "pending",
    dueDate: dueDate ? new Date(dueDate) : null,
  }).returning();
  res.status(201).json(payment);
});

router.patch("/staff/payments/:id", requireFullAccess, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, paidAt, label, amount, dueDate } = req.body;
  const updates: Record<string, unknown> = {};
  if (label !== undefined) updates["label"] = label;
  if (amount !== undefined) updates["amount"] = String(amount);
  if (status !== undefined) updates["status"] = status;
  if (paidAt !== undefined) updates["paidAt"] = paidAt ? new Date(paidAt) : null;
  if (dueDate !== undefined) updates["dueDate"] = dueDate ? new Date(dueDate) : null;
  const [payment] = await db.update(paymentsTable).set(updates).where(eq(paymentsTable.id, id)).returning();
  if (!payment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(payment);
});

router.delete("/staff/payments/:id", requireFullAccess, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(paymentsTable).where(eq(paymentsTable.id, id));
  res.status(204).send();
});

export default router;
