import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { CreateClientBody } from "@workspace/api-zod";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    req.adminUser = user;
    next();
  }).catch(next);
}

router.get("/admin/clients", requireAdmin, async (req, res) => {
  const clients = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.role, "client")).orderBy(usersTable.createdAt);
  res.json(clients);
});

router.post("/admin/clients", requireAdmin, async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const { name, email, password, phone } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, role: "client", phone: phone ?? null,
  }).returning();
  res.status(201).json({ id: user!.id, name: user!.name, email: user!.email, phone: user!.phone, role: user!.role, createdAt: user!.createdAt });
});

export default router;
