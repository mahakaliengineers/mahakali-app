import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

async function getSessionUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ?? null;
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

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id, name: u.name, email: u.email, role: u.role,
    phone: u.phone, siteLocation: u.siteLocation,
    fiscalYear: u.fiscalYear, clientNumber: u.clientNumber,
    clientCode: u.clientCode, createdAt: u.createdAt,
  };
}

router.get("/admin/users", requireSuperAdmin, async (req, res) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(ne(usersTable.role, "client"))
    .orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

router.post("/admin/users", requireSuperAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" }); return;
  }
  const assignedRole = role === "admin" || role === "super_admin" ? role : "admin";
  const passwordHash = await bcrypt.hash(password, 10);
  const [{ id: newId }] = await db.insert(usersTable).values({
    name, email, passwordHash, role: assignedRole,
  }).$returningId();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, newId));
  res.status(201).json(formatUser(user!));
});

router.patch("/admin/users/:id/role", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { role } = req.body;
  if (!["client", "admin", "super_admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }

  await db.update(usersTable).set({ role }).where(eq(usersTable.id, id));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  res.json(formatUser(user));
});

export default router;
