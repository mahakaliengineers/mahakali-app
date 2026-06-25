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

export interface ClientUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}

export interface ClientProject {
  id: number;
  clientId: number;
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

export interface Milestone {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  order: number;
}

export interface Photo {
  id: number;
  projectId: number;
  url: string;
  caption: string | null;
  status: string;
  uploadedAt: string;
}

export interface Document {
  id: number;
  projectId: number;
  name: string;
  url: string;
  fileType: string | null;
  status: string;
  uploadedAt: string;
}

export interface Update {
  id: number;
  projectId: number;
  content: string;
  postedAt: string;
}

export interface Payment {
  id: number;
  projectId: number;
  description: string;
  amount: string;
  dueDate: string | null;
  status: "pending" | "paid" | "overdue";
  paidAt: string | null;
  createdAt: string;
}

export interface Comment {
  id: number;
  projectId: number;
  userId: number;
  authorName: string | null;
  message: string;
  createdAt: string;
}

export interface Testimonial {
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

export const clientApi = {
  auth: {
    login: (email: string, password: string) =>
      req<ClientUser>("/portal/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
    logout: () => req<{ ok: boolean }>("/portal/auth/logout", { method: "POST" }),
    me: () => req<ClientUser>("/portal/auth/me"),
  },
  projects: {
    list: () => req<ClientProject[]>("/portal/projects"),
    get: (id: number) => req<ClientProject & { client: any }>(`/portal/projects/${id}`),
  },
  resources: {
    milestones: (id: number) => req<Milestone[]>(`/portal/projects/${id}/milestones`),
    photos: (id: number) => req<Photo[]>(`/portal/projects/${id}/photos`),
    documents: (id: number) => req<Document[]>(`/portal/projects/${id}/documents`),
    updates: (id: number) => req<Update[]>(`/portal/projects/${id}/updates`),
    payments: (id: number) => req<Payment[]>(`/portal/projects/${id}/payments`),
    comments: (id: number) => req<Comment[]>(`/portal/projects/${id}/comments`),
    addComment: (id: number, message: string) =>
      req<Comment>(`/portal/projects/${id}/comments`, { method: "POST", body: JSON.stringify({ message }) }),
    testimonials: (id: number) => req<Testimonial[]>(`/portal/projects/${id}/testimonials`),
    submitTestimonial: (id: number, data: { text: string; rating: number; authorRole?: string }) =>
      req<Testimonial>(`/portal/projects/${id}/testimonials`, { method: "POST", body: JSON.stringify(data) }),
  },
};
