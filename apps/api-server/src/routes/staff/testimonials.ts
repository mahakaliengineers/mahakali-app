import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

const SUPER_ADMIN_ROLES = ["super_admin"] as const;
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

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(SUPER_ADMIN_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Super Admin only" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

// List all testimonials (staff can view, super_admin can manage)
router.get("/staff/testimonials", requireStaff, async (_req, res) => {
  const rows = await db
    .select({
      id: testimonialsTable.id,
      projectId: testimonialsTable.projectId,
      clientId: testimonialsTable.clientId,
      authorName: testimonialsTable.authorName,
      authorRole: testimonialsTable.authorRole,
      text: testimonialsTable.text,
      rating: testimonialsTable.rating,
      status: testimonialsTable.status,
      createdAt: testimonialsTable.createdAt,
    })
    .from(testimonialsTable)
    .orderBy(desc(testimonialsTable.createdAt));
  res.json(rows);
});

// Approve a testimonial (super_admin only)
router.patch("/staff/testimonials/:id/approve", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [updated] = await db
    .update(testimonialsTable)
    .set({ status: "approved" })
    .where(eq(testimonialsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

// Reject (but keep) a testimonial (super_admin only)
router.patch("/staff/testimonials/:id/reject", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [updated] = await db
    .update(testimonialsTable)
    .set({ status: "rejected" })
    .where(eq(testimonialsTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

// Delete a testimonial permanently (super_admin only)
router.delete("/staff/testimonials/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
  res.json({ ok: true });
});

export default router;
