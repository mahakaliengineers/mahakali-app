import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { adminApi, type StaffUser } from "@/lib/admin-api";
import AdminLogin from "./login";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./dashboard";
import AdminUsers from "./users";
import AdminClients from "./clients";
import AdminProjects from "./projects";
import AdminProjectDetail from "./project-detail";

export default function AdminApp() {
  const [user, setUser] = useState<StaffUser | null | undefined>(undefined);
  const [location, navigate] = useLocation();

  useEffect(() => {
    adminApi.auth.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await adminApi.auth.logout();
    setUser(null);
    navigate("/admin");
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user === null) {
    return <AdminLogin onLogin={setUser} />;
  }

  // Manual routing — avoids all wouter nested-Switch / params quirks
  const projectDetailMatch = location.match(/^\/admin\/projects\/(\d+)/);

  let content: React.ReactNode;
  if (projectDetailMatch) {
    content = (
      <AdminProjectDetail
        projectId={parseInt(projectDetailMatch[1], 10)}
        user={user}
      />
    );
  } else if (location.startsWith("/admin/projects")) {
    content = <AdminProjects user={user} />;
  } else if (location.startsWith("/admin/clients")) {
    content = <AdminClients />;
  } else if (location.startsWith("/admin/users")) {
    content = <AdminUsers currentUser={user} />;
  } else {
    content = <AdminDashboard user={user} />;
  }

  return (
    <AdminLayout user={user} onLogout={logout}>
      {content}
    </AdminLayout>
  );
}
