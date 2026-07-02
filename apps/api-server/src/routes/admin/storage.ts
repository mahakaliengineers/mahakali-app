import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { RequestUploadUrlBody } from "@workspace/api-zod";
import { ObjectStorageService } from "../../lib/objectStorage";

const router = Router();
const storage = new ObjectStorageService();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1).then(([user]) => {
    if (!user || user.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
    next();
  }).catch(next);
}

router.post("/admin/storage/upload-url", requireAdmin, async (req, res) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }
  try {
    const uploadURL = await storage.getObjectEntityUploadURL();
    const objectPath = `/objects/uploads/${Date.now()}-${parsed.data.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    res.json({ uploadURL, objectPath });
  } catch {
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

export default router;
