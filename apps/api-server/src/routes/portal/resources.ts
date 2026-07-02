import { Router } from "express";
import { db } from "@workspace/db";
import {
  photosTable, documentsTable, updatesTable, paymentsTable,
  milestonesTable, projectsTable, usersTable, commentsTable, testimonialsTable
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

async function getUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ?? null;
}

async function canAccessProject(userId: number, projectId: number): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;
  if (user.role === "admin" || user.role === "super_admin") return true;
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

  const user = await getUser(req.session!.userId as number);
  const isStaff = user?.role === "admin" || user?.role === "super_admin";

  const photos = isStaff
    ? await db.select().from(photosTable).where(eq(photosTable.projectId, id)).orderBy(photosTable.uploadedAt)
    : await db.select().from(photosTable).where(and(eq(photosTable.projectId, id), eq(photosTable.status, "approved"))).orderBy(photosTable.uploadedAt);

  res.json(photos);
});

router.get("/portal/projects/:id/documents", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }

  const user = await getUser(req.session!.userId as number);
  const isStaff = user?.role === "admin" || user?.role === "super_admin";

  const docs = isStaff
    ? await db.select().from(documentsTable).where(eq(documentsTable.projectId, id)).orderBy(documentsTable.uploadedAt)
    : await db.select().from(documentsTable).where(and(eq(documentsTable.projectId, id), eq(documentsTable.status, "approved"))).orderBy(documentsTable.uploadedAt);

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

router.get("/portal/projects/:id/comments", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }

  const rows = await db
    .select({
      id: commentsTable.id,
      projectId: commentsTable.projectId,
      userId: commentsTable.userId,
      authorName: usersTable.name,
      message: commentsTable.message,
      createdAt: commentsTable.createdAt,
    })
    .from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .where(eq(commentsTable.projectId, id))
    .orderBy(commentsTable.createdAt);

  res.json(rows);
});

router.post("/portal/projects/:id/comments", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }

  const { message } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "Message is required" }); return;
  }

  const userId = req.session!.userId as number;
  const [comment] = await db.insert(commentsTable).values({
    projectId: id,
    userId,
    message: message.trim(),
  }).returning();

  const user = await getUser(userId);
  res.status(201).json({ ...comment, authorName: user?.name ?? "Unknown" });
});

// ─── Testimonials ────────────────────────────────────────────────────────────

router.get("/portal/projects/:id/testimonials", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }

  const rows = await db
    .select()
    .from(testimonialsTable)
    .where(eq(testimonialsTable.projectId, id))
    .orderBy(testimonialsTable.createdAt);

  res.json(rows);
});

router.post("/portal/projects/:id/testimonials", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const ok = await canAccessProject(req.session!.userId as number, id);
  if (!ok) { res.status(403).json({ error: "Forbidden" }); return; }

  const { text, rating, authorRole } = req.body;
  if (!text || typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Review text is required" }); return;
  }
  const ratingNum = Math.min(5, Math.max(1, parseInt(rating ?? "5", 10) || 5));

  const userId = req.session!.userId as number;
  const user = await getUser(userId);

  const [testimonial] = await db.insert(testimonialsTable).values({
    projectId: id,
    clientId: userId,
    authorName: user?.name ?? "Client",
    authorRole: authorRole?.trim() || null,
    text: text.trim(),
    rating: ratingNum,
    status: "pending",
  }).returning();

  res.status(201).json(testimonial);
});

export default router;
