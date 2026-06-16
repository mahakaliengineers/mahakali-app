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
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    req.adminUser = user;
    next();
  }).catch(next);
}

function formatClientCode(num: string | number, fiscalYear: string | null | undefined): string {
  const paddedNum = String(num).padStart(5, "0");
  const fy = (fiscalYear ?? "").replace("/", "");
  return fy ? `${paddedNum}-${fy}` : paddedNum;
}

router.get("/admin/clients", requireAdmin, async (req, res) => {
  const clients = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    phone: usersTable.phone,
    siteLocation: usersTable.siteLocation,
    fiscalYear: usersTable.fiscalYear,
    clientNumber: usersTable.clientNumber,
    clientCode: usersTable.clientCode,
    role: usersTable.role,
    createdAt: usersTable.createdAt,
  }).from(usersTable).where(eq(usersTable.role, "client")).orderBy(usersTable.createdAt);
  res.json(clients);
});

router.post("/admin/clients", requireAdmin, async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  const { name, email, password, phone, siteLocation, fiscalYear, clientNumber } = parsed.data as any;
  const passwordHash = await bcrypt.hash(password, 10);
  const [{ id: newId }] = await db.insert(usersTable).values({
    name, email, passwordHash, role: "client",
    phone: phone ?? null,
    siteLocation: siteLocation ?? null,
    fiscalYear: fiscalYear ?? null,
    clientNumber: clientNumber ?? null,
  }).$returningId();
  const numForCode = clientNumber ?? newId;
  const clientCode = formatClientCode(numForCode, fiscalYear);
  await db.update(usersTable).set({ clientCode }).where(eq(usersTable.id, newId));
  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, newId));
  res.status(201).json({
    id: updated!.id, name: updated!.name, email: updated!.email,
    phone: updated!.phone, siteLocation: updated!.siteLocation,
    fiscalYear: updated!.fiscalYear, clientNumber: updated!.clientNumber,
    clientCode: updated!.clientCode, role: updated!.role, createdAt: updated!.createdAt,
  });
});

export default router;
