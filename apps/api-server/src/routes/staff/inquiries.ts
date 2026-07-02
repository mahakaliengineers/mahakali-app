import { Router } from "express";
import { db } from "@workspace/db";
import { inquiriesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;

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

// GET /api/staff/inquiries — list all inquiries, newest first
router.get("/staff/inquiries", requireStaff, async (req, res) => {
  const rows = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
  res.json(rows);
});

// PATCH /api/staff/inquiries/:id/status — mark as read/archived
router.patch("/staff/inquiries/:id/status", requireStaff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body as { status?: string };
  if (!status || !["new", "read", "archived"].includes(status)) {
    res.status(400).json({ error: "status must be 'new', 'read', or 'archived'" });
    return;
  }
  const [updated] = await db.update(inquiriesTable).set({ status }).where(eq(inquiriesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

// DELETE /api/staff/inquiries/:id
router.delete("/staff/inquiries/:id", requireStaff, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
  res.json({ success: true });
});

export default router;
