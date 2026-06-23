import { useEffect, useState } from "react";
import { Link } from "wouter";
import { adminApi, type StaffUser, type StaffProject, ROLE_LABELS, ROLE_COLORS } from "@/lib/admin-api";

export default function AdminDashboard({ user }: { user: StaffUser }) {
  const [projects, setProjects] = useState<StaffProject[]>([]);
  const [staffCount, setStaffCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ps] = await Promise.all([adminApi.projects.list()]);
        setProjects(ps);
        if (user.role === "super_admin" || user.role === "admin") {
          const users = await adminApi.users.list();
          setStaffCount(users.length);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.role]);

  const active = projects.filter(p => p.status === "active").length;
  const completed = projects.filter(p => p.status === "completed").length;
  const planning = projects.filter(p => p.status === "planning").length;

  const statusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    planning: "bg-yellow-100 text-yellow-700",
    on_hold: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[user.role]}`}>
            {ROLE_LABELS[user.role]}
          </span>
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={projects.length} color="text-gray-900" />
          <StatCard label="Active" value={active} color="text-green-600" />
          <StatCard label="Completed" value={completed} color="text-blue-600" />
          {staffCount !== null && <StatCard label="Staff Members" value={staffCount} color="text-purple-600" />}
          {staffCount === null && <StatCard label="Planning" value={planning} color="text-yellow-600" />}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {user.role === "super_admin" || user.role === "admin" ? "Recent Projects" : "My Assigned Projects"}
          </h2>
          <Link href="/admin/projects">
            <a className="text-sm text-red-600 hover:underline font-medium">View all →</a>
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No projects assigned yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 5).map(p => (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <a className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 truncate">{p.clientName ?? "No client"} {p.location ? `· ${p.location}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <div className="hidden sm:block w-24 bg-gray-100 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:block">{p.progress}%</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
