---
name: Role system design
description: Three-role access control for Mahakali portal — super_admin/admin/client permissions
---

# Three-Role Access Control

## Roles
- **super_admin** — full control: approve/delete photos & documents, manage user roles, all admin actions
- **admin** — can upload/add data (photos, docs, updates, milestones, payments, clients, projects) but NOT approve or delete; uploads sit pending until super_admin approves
- **client** — view-only: sees only approved photos/docs; can comment on projects

## Key rules
- Photos & documents default to `status: 'pending'` on insert
- Clients only see `status = 'approved'` entries; staff see all
- `requireSuperAdmin` middleware guards approve/delete/role-change routes
- `requireAdmin` middleware allows both `admin` AND `super_admin` roles

## DB
- `user_role` enum: `client | admin | super_admin`
- `file_status` enum: `pending | approved` (on `photos` and `documents` tables)
- `comments` table: projectId, userId, message, createdAt (joined with users for authorName)

**Why:** Client requested explicit approval gate — admin staff upload content, super admin reviews before clients see it.
