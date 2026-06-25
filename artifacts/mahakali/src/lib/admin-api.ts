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

async function rawReq(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${BASE}${path}`, { credentials: "include", ...options });
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

export interface ClientUser {
  id: number;
  name: string;
  email: string;
  role: "client";
  phone: string | null;
  siteLocation: string | null;
  fiscalYear: string | null;
  clientNumber: string | null;
  clientCode: string | null;
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

export interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  order: number;
  dueDate: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
  verifiedById: number | null;
  createdAt: string;
}

export interface ProjectPhoto {
  id: number;
  projectId: number;
  uploadedById: number | null;
  url: string;
  caption: string | null;
  status: "pending" | "approved";
  uploadedAt: string;
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  uploadedById: number | null;
  name: string;
  url: string;
  type: string;
  status: "pending" | "approved";
  uploadedAt: string;
}

export interface Payment {
  id: number;
  projectId: number;
  label: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface ProjectUpdate {
  id: number;
  projectId: number;
  message: string;
  postedAt: string;
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
  milestones: Milestone[];
  payments: Payment[];
  updates: ProjectUpdate[];
  photos: ProjectPhoto[];
  documents: ProjectDocument[];
}

export interface Inquiry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export interface AdminTestimonial {
  id: number;
  projectId: number | null;
  clientId: number | null;
  authorName: string;
  authorRole: string | null;
  text: string;
  rating: number;
  status: string;
  createdAt: string;
}

export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      req<StaffUser>("/staff/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => req<{ ok: boolean }>("/staff/auth/logout", { method: "POST" }),
    me: () => req<StaffUser>("/staff/auth/me"),
    updatePassword: (currentPassword: string, newPassword: string) =>
      req<{ ok: boolean }>("/staff/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
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
      rawReq(`/staff/users/${id}`, { method: "DELETE" }),
  },
  clients: {
    list: () => req<ClientUser[]>("/staff/clients"),
    create: (data: { name: string; email: string; password: string; phone?: string; siteLocation?: string; fiscalYear?: string; clientNumber?: string }) =>
      req<ClientUser>("/staff/clients", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ name: string; email: string; phone: string; siteLocation: string; fiscalYear: string; clientNumber: string; password: string }>) =>
      req<ClientUser>(`/staff/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      rawReq(`/staff/clients/${id}`, { method: "DELETE" }),
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
    addUpdate: (id: number, message: string) =>
      req<ProjectUpdate>(`/staff/projects/${id}/updates`, { method: "POST", body: JSON.stringify({ message }) }),
  },
  milestones: {
    list: (projectId: number) => req<Milestone[]>(`/staff/projects/${projectId}/milestones`),
    create: (projectId: number, data: { title: string; description?: string; dueDate?: string; order?: number }) =>
      req<Milestone>(`/staff/projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ title: string; description: string; dueDate: string | null; order: number; completedAt: string | null }>) =>
      req<Milestone>(`/staff/milestones/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    markComplete: (id: number) =>
      req<Milestone>(`/staff/milestones/${id}`, { method: "PATCH", body: JSON.stringify({ completedAt: new Date().toISOString() }) }),
    markIncomplete: (id: number) =>
      req<Milestone>(`/staff/milestones/${id}`, { method: "PATCH", body: JSON.stringify({ completedAt: null }) }),
    verify: (id: number) =>
      req<Milestone>(`/staff/milestones/${id}/verify`, { method: "PATCH" }),
    reject: (id: number) =>
      req<Milestone>(`/staff/milestones/${id}/reject`, { method: "PATCH" }),
    delete: (id: number) =>
      rawReq(`/staff/milestones/${id}`, { method: "DELETE" }),
  },
  photos: {
    upload: (projectId: number, data: { url: string; caption?: string }) =>
      req<ProjectPhoto>(`/staff/projects/${projectId}/photos`, { method: "POST", body: JSON.stringify(data) }),
    approve: (id: number) =>
      req<ProjectPhoto>(`/staff/photos/${id}/approve`, { method: "PATCH" }),
    delete: (id: number) =>
      rawReq(`/staff/photos/${id}`, { method: "DELETE" }),
  },
  documents: {
    upload: (projectId: number, data: { name: string; url: string; type?: string }) =>
      req<ProjectDocument>(`/staff/projects/${projectId}/documents`, { method: "POST", body: JSON.stringify(data) }),
    approve: (id: number) =>
      req<ProjectDocument>(`/staff/documents/${id}/approve`, { method: "PATCH" }),
    delete: (id: number) =>
      rawReq(`/staff/documents/${id}`, { method: "DELETE" }),
  },
  payments: {
    list: (projectId: number) => req<Payment[]>(`/staff/projects/${projectId}/payments`),
    create: (projectId: number, data: { label: string; amount: string | number; status?: string; dueDate?: string }) =>
      req<Payment>(`/staff/projects/${projectId}/payments`, { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<{ label: string; amount: string | number; status: string; paidAt: string | null; dueDate: string | null }>) =>
      req<Payment>(`/staff/payments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      rawReq(`/staff/payments/${id}`, { method: "DELETE" }),
  },
  storage: {
    requestUploadUrl: (name: string) =>
      req<{ uploadURL: string; objectPath: string }>("/staff/storage/upload-url", {
        method: "POST", body: JSON.stringify({ name }),
      }),
  },
  testimonials: {
    list: () => req<AdminTestimonial[]>("/staff/testimonials"),
    approve: (id: number) => req<AdminTestimonial>(`/staff/testimonials/${id}/approve`, { method: "PATCH" }),
    reject: (id: number) => req<AdminTestimonial>(`/staff/testimonials/${id}/reject`, { method: "PATCH" }),
    delete: (id: number) => rawReq(`/staff/testimonials/${id}`, { method: "DELETE" }),
  },
  inquiries: {
    list: () => req<Inquiry[]>("/staff/inquiries"),
    updateStatus: (id: number, status: "new" | "read" | "archived") =>
      req<Inquiry>(`/staff/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    delete: (id: number) => rawReq(`/staff/inquiries/${id}`, { method: "DELETE" }),
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
