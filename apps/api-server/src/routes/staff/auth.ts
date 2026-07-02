import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

const STAFF_ROLES = [
  "super_admin",
  "admin",
  "engineer",
  "site_engineer",
  "project_manager",
] as const;

router.post("/staff/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (!(STAFF_ROLES as readonly string[]).includes(user.role)) {
    res.status(403).json({ error: "Access denied — staff only" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  req.session!.userId = user.id;
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
});

router.post("/staff/auth/logout", (req, res) => {
  req.session!.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/staff/auth/me", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  });
});

// Change own password — available to ALL staff roles
router.patch("/staff/auth/password", async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res
      .status(400)
      .json({ error: "currentPassword and newPassword are required" });
    return;
  }
  if (newPassword.length < 6) {
    res
      .status(400)
      .json({ error: "New password must be at least 6 characters" });
    return;
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db
    .update(usersTable)
    .set({ passwordHash })
    .where(eq(usersTable.id, userId));
  res.json({ ok: true });
});

export default router;

// import { Router } from "express";
// import { db } from "@workspace/db";
// import { usersTable } from "@workspace/db/schema";
// import { eq } from "drizzle-orm";
// import bcrypt from "bcryptjs";

// const router = Router();

// const STAFF_ROLES = ["super_admin", "admin", "engineer", "site_engineer", "project_manager"] as const;

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     res.status(400).json({ error: "Email and password are required" });
//     return;
//   }
//   const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
//   if (!user) {
//     res.status(401).json({ error: "Invalid credentials" });
//     return;
//   }
//   if (!(STAFF_ROLES as readonly string[]).includes(user.role)) {
//     res.status(403).json({ error: "Access denied — staff only" });
//     return;
//   }
//   const valid = await bcrypt.compare(password, user.passwordHash);
//   if (!valid) {
//     res.status(401).json({ error: "Invalid credentials" });
//     return;
//   }
//   req.session!.userId = user.id;
//   res.json({
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     phone: user.phone
//   });
// });

// router.post("/logout", (req, res) => {
//   req.session!.destroy(() => {
//     res.json({ ok: true });
//   });
// });

// router.get("/me", async (req, res) => {
//   const userId = req.session?.userId;
//   if (!userId) {
//     res.status(401).json({ error: "Not authenticated" });
//     return;
//   }
//   const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
//   if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
//     res.status(401).json({ error: "Not authenticated" });
//     return;
//   }
//   res.json({
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     phone: user.phone
//   });
// });

// router.patch("/password", async (req, res) => {
//   const userId = req.session?.userId;
//   if (!userId) {
//     res.status(401).json({ error: "Not authenticated" });
//     return;
//   }
//   const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
//   if (!user || !(STAFF_ROLES as readonly string[]).includes(user.role)) {
//     res.status(401).json({ error: "Not authenticated" });
//     return;
//   }
//   const { currentPassword, newPassword } = req.body;
//   if (!currentPassword || !newPassword) {
//     res.status(400).json({ error: "currentPassword and newPassword are required" });
//     return;
//   }
//   if (newPassword.length < 6) {
//     res.status(400).json({ error: "New password must be at least 6 characters" });
//     return;
//   }
//   const valid = await bcrypt.compare(currentPassword, user.passwordHash);
//   if (!valid) {
//     res.status(401).json({ error: "Current password is incorrect" });
//     return;
//   }
//   const passwordHash = await bcrypt.hash(newPassword, 10);
//   await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));
//   res.json({ ok: true });
// });

// export default router;
