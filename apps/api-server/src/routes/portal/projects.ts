import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/portal/projects", requireAuth, async (req, res) => {
  const userId = req.session!.userId as number;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const isStaff = user.role === "admin" || user.role === "super_admin";

  if (isStaff) {
    const rows = await db
      .select({
        id: projectsTable.id,
        clientId: projectsTable.clientId,
        clientName: usersTable.name,
        clientEmail: usersTable.email,
        title: projectsTable.title,
        location: projectsTable.location,
        type: projectsTable.type,
        status: projectsTable.status,
        progress: projectsTable.progress,
        description: projectsTable.description,
        startDate: projectsTable.startDate,
        endDate: projectsTable.endDate,
        createdAt: projectsTable.createdAt,
      })
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
      .orderBy(projectsTable.createdAt);
    res.json(rows);
  } else {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.clientId, userId))
      .orderBy(projectsTable.createdAt);
    res.json(projects);
  }
});

router.get("/portal/projects/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const userId = req.session!.userId as number;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) { res.status(401).json({ error: "Not authenticated" }); return; }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!project) { res.status(404).json({ error: "Not found" }); return; }

  if (user.role !== "admin" && project.clientId !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [client] = await db.select().from(usersTable).where(eq(usersTable.id, project.clientId)).limit(1);
  res.json({ ...project, client: client ? { id: client.id, name: client.name, email: client.email, role: client.role, phone: client.phone, createdAt: client.createdAt } : null });
});

export default router;
