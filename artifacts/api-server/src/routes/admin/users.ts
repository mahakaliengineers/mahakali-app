import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "super_admin") {
      res.status(403).json({ error: "Forbidden — Super Admin only" }); return;
    }
    next();
  }).catch(next);
}

router.patch("/admin/users/:id/role", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { role } = req.body;
  if (!["client", "admin", "super_admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }

  const [user] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    phone: user.phone, siteLocation: user.siteLocation, fiscalYear: user.fiscalYear,
    clientNumber: user.clientNumber, clientCode: user.clientCode, createdAt: user.createdAt,
  });
});

export default router;
