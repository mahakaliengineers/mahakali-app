import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, inArray, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;
// Roles that can be ASSIGNED to new or existing users (super_admin is excluded — only one can exist)
const ASSIGNABLE_ROLES = ["admin", "engineer", "site_engineer", "project_manager"] as const;

function validatePhone(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10) return "Phone number must not exceed 10 digits";
  return null;
}

async function getStaffUser(userId: number) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  return user ?? null;
}

function requireStaff(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
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

function formatUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone, createdAt: u.createdAt };
}

// List all staff — any staff can view colleagues
router.get("/staff/users", requireStaff, async (_req, res) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(inArray(usersTable.role, [...STAFF_ROLES]))
    .orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

// Create staff — super_admin only; super_admin role cannot be assigned
router.post("/staff/users", requireSuperAdmin, async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "name, email, password and role are required" }); return;
  }
  if (!(ASSIGNABLE_ROLES as readonly string[]).includes(role)) {
    res.status(400).json({ error: "Invalid role. Super Admin role cannot be assigned to others." }); return;
  }
  const phoneError = validatePhone(phone);
  if (phoneError) { res.status(400).json({ error: phoneError }); return; }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Email already in use" }); return; }
  const passwordHash = await bcrypt.hash(password, 10);
  const [created] = await db.insert(usersTable).values({
    name, email, passwordHash, role, phone: phone ?? null,
  }).returning();
  res.status(201).json(formatUser(created!));
});

// Update staff info — super_admin only
router.put("/staff/users/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, email, phone, password } = req.body;
  const phoneError = validatePhone(phone);
  if (phoneError) { res.status(400).json({ error: phoneError }); return; }
  const updates: Record<string, unknown> = {};
  if (name) updates["name"] = name;
  if (email) updates["email"] = email;
  if (phone !== undefined) updates["phone"] = phone || null;
  if (password) updates["passwordHash"] = await bcrypt.hash(password, 10);
  if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(updated));
});

// Change role — super_admin only; super_admin role cannot be assigned
router.patch("/staff/users/:id/role", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { role } = req.body;
  if (!(ASSIGNABLE_ROLES as readonly string[]).includes(role)) {
    res.status(400).json({ error: "Invalid role. Super Admin role cannot be assigned." }); return;
  }
  const [updated] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(updated));
});

// Delete staff — super_admin only; cannot delete yourself
router.delete("/staff/users/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const sessionUserId = req.session!.userId;
  if (id === sessionUserId) { res.status(400).json({ error: "Cannot delete yourself" }); return; }
  const [target] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (target?.role === "super_admin") {
    res.status(403).json({ error: "Cannot delete the Super Admin account" }); return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
