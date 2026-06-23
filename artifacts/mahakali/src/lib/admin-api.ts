const BASE = "/api";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export type StaffRole = "super_admin" | "admin" | "engineer" | "site_engineer" | "project_manager";

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: StaffRole;
  phone: string | null;
  createdAt: string;
}

export interface ProjectAssignment {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  userRole: StaffRole | null;
  roleLabel: string;
  assignedAt: string;
}

export interface StaffProject {
  id: number;
  clientId: number;
  clientName: string | null;
  title: string;
  location: string | null;
  type: string | null;
  status: "planning" | "active" | "on_hold" | "completed";
  progress: number;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface StaffProjectDetail extends StaffProject {
  client: { id: number; name: string; email: string; phone: string | null } | null;
  assignments: ProjectAssignment[];
  milestones: any[];
  payments: any[];
  updates: any[];
}

export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      req<StaffUser>("/staff/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => req<{ ok: boolean }>("/staff/auth/logout", { method: "POST" }),
    me: () => req<StaffUser>("/staff/auth/me"),
  },
  users: {
    list: () => req<StaffUser[]>("/staff/users"),
    create: (data: { name: string; email: string; password: string; role: StaffRole; phone?: string }) =>
      req<StaffUser>("/staff/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; email?: string; phone?: string; password?: string }) =>
      req<StaffUser>(`/staff/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    changeRole: (id: number, role: StaffRole) =>
      req<StaffUser>(`/staff/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
    delete: (id: number) =>
      fetch(`${BASE}/staff/users/${id}`, { method: "DELETE", credentials: "include" }),
  },
  projects: {
    list: () => req<StaffProject[]>("/staff/projects"),
    get: (id: number) => req<StaffProjectDetail>(`/staff/projects/${id}`),
    create: (data: any) =>
      req<any>("/staff/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      req<any>(`/staff/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    assign: (projectId: number, userId: number, roleLabel: string) =>
      req<ProjectAssignment[]>(`/staff/projects/${projectId}/assignments`, {
        method: "POST", body: JSON.stringify({ userId, roleLabel }),
      }),
    removeAssignment: (projectId: number, userId: number) =>
      req<ProjectAssignment[]>(`/staff/projects/${projectId}/assignments/${userId}`, { method: "DELETE" }),
  },
  clients: {
    list: () => req<any[]>("/admin/clients"),
  },
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  engineer: "Engineer",
  site_engineer: "Site Engineer",
  project_manager: "Project Manager",
};

export const ROLE_COLORS: Record<StaffRole, string> = {
  super_admin: "bg-red-100 text-red-700",
  admin: "bg-blue-100 text-blue-700",
  project_manager: "bg-purple-100 text-purple-700",
  engineer: "bg-green-100 text-green-700",
  site_engineer: "bg-orange-100 text-orange-700",
};
