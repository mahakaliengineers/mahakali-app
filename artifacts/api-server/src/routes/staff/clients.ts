import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;
const MANAGE_ROLES = ["super_admin", "admin"] as const;

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

function requireManage(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(MANAGE_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Admin or Super Admin only" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

function formatClientCode(num: string | number, fiscalYear: string | null | undefined): string {
  const paddedNum = String(num).padStart(5, "0");
  const fy = (fiscalYear ?? "").replace("/", "");
  return fy ? `${paddedNum}-${fy}` : paddedNum;
}

function formatClient(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    siteLocation: u.siteLocation, fiscalYear: u.fiscalYear,
    clientNumber: u.clientNumber, clientCode: u.clientCode,
    role: u.role, createdAt: u.createdAt,
  };
}

router.get("/staff/clients", requireStaff, async (_req, res) => {
  const clients = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "client"))
    .orderBy(usersTable.createdAt);
  res.json(clients.map(formatClient));
});

router.post("/staff/clients", requireManage, async (req, res) => {
  const { name, email, password, phone, siteLocation, fiscalYear, clientNumber } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email, and password are required" }); return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" }); return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, role: "client",
    phone: phone ?? null,
    siteLocation: siteLocation ?? null,
    fiscalYear: fiscalYear ?? null,
    clientNumber: clientNumber ?? null,
  }).returning();
  const numForCode = clientNumber ?? user!.id;
  const clientCode = formatClientCode(numForCode, fiscalYear);
  const [updated] = await db.update(usersTable).set({ clientCode }).where(eq(usersTable.id, user!.id)).returning();
  res.status(201).json(formatClient(updated!));
});

router.put("/staff/clients/:id", requireManage, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, email, phone, siteLocation, fiscalYear, clientNumber, password } = req.body;
  const updates: Record<string, unknown> = {};
  if (name) updates["name"] = name;
  if (email) updates["email"] = email;
  if (phone !== undefined) updates["phone"] = phone || null;
  if (siteLocation !== undefined) updates["siteLocation"] = siteLocation || null;
  if (fiscalYear !== undefined) updates["fiscalYear"] = fiscalYear || null;
  if (clientNumber !== undefined) updates["clientNumber"] = clientNumber || null;
  if (password) updates["passwordHash"] = await bcrypt.hash(password, 10);
  if (fiscalYear !== undefined || clientNumber !== undefined) {
    const [current] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (current) {
      const fy = fiscalYear !== undefined ? fiscalYear : current.fiscalYear;
      const cn = clientNumber !== undefined ? clientNumber : current.clientNumber;
      updates["clientCode"] = formatClientCode(cn ?? id, fy);
    }
  }
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Nothing to update" }); return;
  }
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatClient(updated));
});

router.delete("/staff/clients/:id", requireManage, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).send();
});

export default router;
