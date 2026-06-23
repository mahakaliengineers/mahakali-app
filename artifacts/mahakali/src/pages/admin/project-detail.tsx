import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { adminApi, type StaffUser, type StaffProjectDetail, ROLE_LABELS, ROLE_COLORS } from "@/lib/admin-api";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

export default function AdminProjectDetail({ projectId, user }: { projectId: number; user: StaffUser }) {
  const [, navigate] = useLocation();
  const [project, setProject] = useState<StaffProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [editProgress, setEditProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);

  // super_admin + admin: full control (create project, delete, manage clients, see everything)
  const canFullAccess = user.role === "super_admin" || user.role === "admin";
  // super_admin + admin + project_manager: manage team assignments
  const canAssign = canFullAccess || user.role === "project_manager";
  // all roles: can update project details (engineers must be assigned — enforced server-side)
  const canUpdate = true;

  async function load() {
    setLoading(true);
    setError("");
    try {
      const p = await adminApi.projects.get(projectId);
      setProject(p);
      setProgress(p.progress);
      setStatus(p.status);
    } catch (err: any) {
      setError(err.message ?? "Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [projectId]);

  async function handleProgressSave() {
    if (!project) return;
    try {
      await adminApi.projects.update(projectId, { progress, status });
      setEditProgress(false);
      await load();
    } catch (err: any) {
      alert(err.message ?? "Failed to update");
    }
  }

  async function handleRemoveAssignment(userId: number) {
    if (!confirm("Remove this team member from the project?")) return;
    try {
      await adminApi.projects.removeAssignment(projectId, userId);
      await load();
    } catch (err: any) {
      alert(err.message ?? "Failed");
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-600">
      <p className="font-medium">{error}</p>
      <Link href="/admin/projects" className="text-sm text-gray-500 hover:underline mt-2 block">← Back to projects</Link>
    </div>
  );

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/projects" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
              {project.status.replace("_", " ")}
            </span>
            {project.type && <span className="text-sm text-gray-400">{project.type}</span>}
            {project.location && <span className="text-sm text-gray-400">· {project.location}</span>}
          </div>
        </div>
        {/* Role badge */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Project Progress</h2>
            {canUpdate && !editProgress && (
              <button onClick={() => setEditProgress(true)} className="text-xs text-red-600 hover:underline font-medium">
                Update
              </button>
            )}
          </div>
          {editProgress ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Progress: {progress}%</label>
                <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(parseInt(e.target.value))}
                  className="w-full accent-red-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleProgressSave} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Save</button>
                <button onClick={() => setEditProgress(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completion</span>
                <span className="font-semibold text-gray-900">{project.progress}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          )}

          {project.description && (
            <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{project.description}</p>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Details</h2>
          <InfoRow label="Client" value={project.client?.name ?? "—"} />
          <InfoRow label="Email" value={project.client?.email ?? "—"} />
          <InfoRow label="Phone" value={project.client?.phone ?? "—"} />
          <InfoRow label="Start" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} />
          <InfoRow label="End" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"} />
        </div>
      </div>

      {/* Team Assignments — visible to all, manageable only by canAssign roles */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Project Team</h2>
          {canAssign && (
            <button
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Assign Member
            </button>
          )}
        </div>
        {project.assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No team members assigned yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {project.assignments.map(a => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(a.userName ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{a.userName ?? "Unknown"}</p>
                    <p className="text-xs text-gray-400">{a.userEmail ?? ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.userRole && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[a.userRole]}`}>
                      {ROLE_LABELS[a.userRole]}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 hidden sm:block">{a.roleLabel}</span>
                  {canAssign && (
                    <button onClick={() => handleRemoveAssignment(a.userId)} className="text-xs text-red-500 hover:underline">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Milestones</h2>
        </div>
        {project.milestones.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No milestones defined yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {project.milestones.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-5 h-5 rounded-full flex-shrink-0 border-2 ${m.completed ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                  {m.completed && (
                    <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${m.completed ? "line-through text-gray-400" : "text-gray-900"}`}>{m.title}</p>
                  {m.dueDate && <p className="text-xs text-gray-400">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Updates */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Project Updates</h2>
          {canUpdate && (
            <button
              onClick={() => setShowAddUpdate(v => !v)}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              {showAddUpdate ? "Cancel" : "+ Add Update"}
            </button>
          )}
        </div>
        {showAddUpdate && (
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              rows={3}
              placeholder="Describe the latest progress, issues, or notes…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => { setShowAddUpdate(false); setUpdateText(""); }}
                className="px-3 py-1.5 text-xs text-gray-600">Cancel</button>
              <button
                disabled={!updateText.trim() || postingUpdate}
                onClick={async () => {
                  if (!updateText.trim()) return;
                  setPostingUpdate(true);
                  try {
                    await fetch(`/api/staff/projects/${projectId}/updates`, {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: updateText.trim() }),
                    });
                    setUpdateText("");
                    setShowAddUpdate(false);
                    await load();
                  } catch {
                    alert("Failed to post update");
                  } finally {
                    setPostingUpdate(false);
                  }
                }}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {postingUpdate ? "Posting…" : "Post Update"}
              </button>
            </div>
          </div>
        )}
        {project.updates.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No updates posted yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...project.updates].reverse().slice(0, 10).map((u: any) => (
              <div key={u.id} className="px-5 py-3">
                <p className="text-sm text-gray-700">{u.content ?? u.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(u.postedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <AssignModal
          projectId={projectId}
          existingIds={project.assignments.map(a => a.userId)}
          onClose={() => setShowAssign(false)}
          onSave={async () => { setShowAssign(false); await load(); }}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium text-right ml-2 truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function AssignModal({
  projectId, existingIds, onClose, onSave,
}: {
  projectId: number;
  existingIds: number[];
  onClose: () => void;
  onSave: () => Promise<void>;
}) {
  const [staff, setStaff] = useState<any[]>([]);
  const [userId, setUserId] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.users.list().then(u => setStaff(u.filter(s => !existingIds.includes(s.id)))).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await adminApi.projects.assign(projectId, parseInt(userId), roleLabel);
      await onSave();
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Assign Team Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Staff Member *</label>
            <select value={userId} onChange={e => setUserId(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select member…</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {ROLE_LABELS[s.role as keyof typeof ROLE_LABELS]}</option>
              ))}
            </select>
            {staff.length === 0 && <p className="text-xs text-gray-400 mt-1">All staff are already assigned.</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Role / Responsibility *</label>
            <input
              value={roleLabel}
              onChange={e => setRoleLabel(e.target.value)}
              required
              placeholder="e.g. Lead Engineer, Site Supervisor"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button type="submit" disabled={saving || staff.length === 0}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Assigning…" : "Assign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
