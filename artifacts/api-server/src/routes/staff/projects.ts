import { Router } from "express";
import { db } from "@workspace/db";
import {
  projectsTable, usersTable, projectAssignmentsTable,
  milestonesTable, paymentsTable, updatesTable,
} from "@workspace/db/schema";
import { eq, and, inArray } from "drizzle-orm";

const router = Router();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;
// Full access: create/delete projects
const FULL_ACCESS_ROLES = ["super_admin", "admin"] as const;
// Broad access: see ALL projects, manage team assignments
const BROAD_ROLES = ["super_admin", "admin", "project_manager"] as const;
// Update roles: can update project details (engineer/site_engineer only on assigned projects)
const UPDATE_ROLES = ["super_admin", "admin", "project_manager", "engineer", "site_engineer"] as const;

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

function requireFullAccess(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(FULL_ACCESS_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Admin or Super Admin only" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

function requireBroadAccess(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  getStaffUser(req.session.userId).then((user) => {
    if (!user || !(BROAD_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Not authorized to manage team assignments" }); return;
    }
    req.staffUser = user;
    next();
  }).catch(next);
}

async function getProjectAssignments(projectId: number) {
  const rows = await db
    .select({
      id: projectAssignmentsTable.id,
      userId: projectAssignmentsTable.userId,
      userName: usersTable.name,
      userEmail: usersTable.email,
      userRole: usersTable.role,
      roleLabel: projectAssignmentsTable.roleLabel,
      assignedAt: projectAssignmentsTable.assignedAt,
    })
    .from(projectAssignmentsTable)
    .leftJoin(usersTable, eq(projectAssignmentsTable.userId, usersTable.id))
    .where(eq(projectAssignmentsTable.projectId, projectId));
  return rows;
}

// List projects — broad roles see ALL; engineer/site_engineer see only assigned
router.get("/staff/projects", requireStaff, async (req: any, res) => {
  const user = req.staffUser;
  const projectFields = {
    id: projectsTable.id,
    clientId: projectsTable.clientId,
    clientName: usersTable.name,
    title: projectsTable.title,
    location: projectsTable.location,
    type: projectsTable.type,
    status: projectsTable.status,
    progress: projectsTable.progress,
    description: projectsTable.description,
    startDate: projectsTable.startDate,
    endDate: projectsTable.endDate,
    createdAt: projectsTable.createdAt,
  };

  if ((BROAD_ROLES as readonly string[]).includes(user.role)) {
    const rows = await db
      .select(projectFields)
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
      .orderBy(projectsTable.createdAt);
    res.json(rows);
  } else {
    const assignments = await db
      .select({ projectId: projectAssignmentsTable.projectId })
      .from(projectAssignmentsTable)
      .where(eq(projectAssignmentsTable.userId, user.id));
    const projectIds = assignments.map((a: any) => a.projectId);
    if (projectIds.length === 0) { res.json([]); return; }
    const rows = await db
      .select(projectFields)
      .from(projectsTable)
      .leftJoin(usersTable, eq(projectsTable.clientId, usersTable.id))
      .where(inArray(projectsTable.id, projectIds))
      .orderBy(projectsTable.createdAt);
    res.json(rows);
  }
});

// Get single project — broad roles see any; engineer/site_engineer must be assigned
router.get("/staff/projects/:id", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const user = req.staffUser;

  if (!(BROAD_ROLES as readonly string[]).includes(user.role)) {
    const [assignment] = await db
      .select()
      .from(projectAssignmentsTable)
      .where(and(eq(projectAssignmentsTable.projectId, id), eq(projectAssignmentsTable.userId, user.id)))
      .limit(1);
    if (!assignment) { res.status(403).json({ error: "Forbidden" }); return; }
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
  if (!project) { res.status(404).json({ error: "Not found" }); return; }
  const [client] = await db.select().from(usersTable).where(eq(usersTable.id, project.clientId)).limit(1);
  const assignments = await getProjectAssignments(id);
  const milestones = await db.select().from(milestonesTable).where(eq(milestonesTable.projectId, id)).orderBy(milestonesTable.order);
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.projectId, id)).orderBy(paymentsTable.createdAt);
  const updates = await db.select().from(updatesTable).where(eq(updatesTable.projectId, id)).orderBy(updatesTable.postedAt);

  res.json({
    ...project,
    client: client ? { id: client.id, name: client.name, email: client.email, phone: client.phone } : null,
    assignments, milestones, payments, updates,
  });
});

// Create project — full access only (super_admin, admin)
router.post("/staff/projects", requireFullAccess, async (req, res) => {
  const { clientId, title, location, type, status, progress, description, startDate, endDate } = req.body;
  if (!clientId || !title) { res.status(400).json({ error: "clientId and title are required" }); return; }
  const [project] = await db.insert(projectsTable).values({
    clientId: parseInt(clientId, 10),
    title,
    location: location ?? null,
    type: type ?? null,
    status: status ?? "planning",
    progress: progress ?? 0,
    description: description ?? null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }).returning();
  res.status(201).json(project);
});

// Update project — all roles can update, but engineer/site_engineer must be assigned
router.patch("/staff/projects/:id", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const user = req.staffUser;

  if (!(UPDATE_ROLES as readonly string[]).includes(user.role)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  // engineer and site_engineer must be assigned to the project
  if (!(BROAD_ROLES as readonly string[]).includes(user.role)) {
    const [assignment] = await db
      .select()
      .from(projectAssignmentsTable)
      .where(and(eq(projectAssignmentsTable.projectId, id), eq(projectAssignmentsTable.userId, user.id)))
      .limit(1);
    if (!assignment) { res.status(403).json({ error: "Not assigned to this project" }); return; }
  }

  const { title, location, type, status, progress, description, startDate, endDate } = req.body;
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates["title"] = title;
  if (location !== undefined) updates["location"] = location;
  if (type !== undefined) updates["type"] = type;
  if (status !== undefined) updates["status"] = status;
  if (progress !== undefined) updates["progress"] = progress;
  if (description !== undefined) updates["description"] = description;
  if (startDate !== undefined) updates["startDate"] = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) updates["endDate"] = endDate ? new Date(endDate) : null;

  const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
  if (!project) { res.status(404).json({ error: "Not found" }); return; }
  res.json(project);
});

// Manage team assignments — broad access (super_admin, admin, project_manager)
router.post("/staff/projects/:id/assignments", requireBroadAccess, async (req, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { userId, roleLabel } = req.body;
  if (!userId || !roleLabel) { res.status(400).json({ error: "userId and roleLabel are required" }); return; }
  try {
    await db.insert(projectAssignmentsTable).values({
      projectId: id,
      userId: parseInt(userId, 10),
      roleLabel,
    }).returning();
    const assignments = await getProjectAssignments(id);
    res.status(201).json(assignments);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "User already assigned to this project" }); return;
    }
    throw e;
  }
});

router.delete("/staff/projects/:id/assignments/:userId", requireBroadAccess, async (req, res) => {
  const projectId = parseInt(req.params["id"]!, 10);
  const userId = parseInt(req.params["userId"]!, 10);
  if (isNaN(projectId) || isNaN(userId)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(projectAssignmentsTable).where(
    and(eq(projectAssignmentsTable.projectId, projectId), eq(projectAssignmentsTable.userId, userId))
  );
  const assignments = await getProjectAssignments(projectId);
  res.json(assignments);
});

// Post a project update — all staff who can update the project
router.post("/staff/projects/:id/updates", requireStaff, async (req: any, res) => {
  const id = parseInt(req.params["id"]!, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const user = req.staffUser;

  // Must be assigned if not a broad-access role
  if (!(BROAD_ROLES as readonly string[]).includes(user.role)) {
    const [assignment] = await db
      .select()
      .from(projectAssignmentsTable)
      .where(and(eq(projectAssignmentsTable.projectId, id), eq(projectAssignmentsTable.userId, user.id)))
      .limit(1);
    if (!assignment) { res.status(403).json({ error: "Not assigned to this project" }); return; }
  }

  const { content, message } = req.body;
  const text = (content ?? message ?? "").trim();
  if (!text) { res.status(400).json({ error: "Update message is required" }); return; }

  const [update] = await db.insert(updatesTable).values({ projectId: id, message: text }).returning();
  res.status(201).json(update);
});

export default router;
