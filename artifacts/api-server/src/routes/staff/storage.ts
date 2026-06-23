import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "../../lib/objectStorage";
import { Readable } from "stream";

const router = Router();
const storage = new ObjectStorageService();

const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;

function requireStaff(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    next();
  }).catch(next);
}

// Get a presigned upload URL — available to all staff roles
router.post("/staff/storage/upload-url", requireStaff, async (req, res) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: "name is required" }); return; }
  try {
    const uploadURL = await storage.getObjectEntityUploadURL();
    const objectPath = `/objects/uploads/${Date.now()}-${String(name).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    res.json({ uploadURL, objectPath });
  } catch {
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

// Serve stored objects — requires staff auth
router.get("/staff/storage/serve", requireStaff, async (req, res) => {
  const rawPath = req.query["path"] as string;
  if (!rawPath) { res.status(400).json({ error: "path is required" }); return; }
  const objectPath = rawPath.startsWith("/objects/") ? rawPath : `/objects/${rawPath}`;
  try {
    const file = await storage.getObjectEntityFile(objectPath);
    const response = await storage.downloadObject(file);
    if (!response.ok || !response.body) { res.status(404).send("Not found"); return; }
    const ct = response.headers.get("content-type") || "application/octet-stream";
    const cd = response.headers.get("content-disposition");
    res.setHeader("Content-Type", ct);
    if (cd) res.setHeader("Content-Disposition", cd);
    const nodeReadable = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]);
    nodeReadable.pipe(res);
  } catch (err) {
    if (err instanceof ObjectNotFoundError) { res.status(404).json({ error: "File not found" }); return; }
    res.status(500).json({ error: "Failed to serve file" });
  }
});

export default router;
