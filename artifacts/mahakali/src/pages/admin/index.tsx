import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
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
  const [, navigate] = useLocation();

  useEffect(() => {
    adminApi.auth.me()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await adminApi.auth.logout();
    setUser(null);
    navigate("/admin/login");
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

  return (
    <AdminLayout user={user} onLogout={logout}>
      <Switch>
        <Route path="/admin" component={() => <AdminDashboard user={user} />} />
        <Route path="/admin/clients" component={() => <AdminClients />} />
        <Route path="/admin/users" component={() => <AdminUsers currentUser={user} />} />
        <Route path="/admin/projects" component={() => <AdminProjects user={user} />} />
        <Route path="/admin/projects/:id" component={({ params }) => (
          <AdminProjectDetail projectId={parseInt(params.id, 10)} user={user} />
        )} />
        <Route component={() => <AdminDashboard user={user} />} />
      </Switch>
    </AdminLayout>
  );
}
