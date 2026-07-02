import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  adminApi, type StaffUser, type StaffProjectDetail, type Milestone,
  type ProjectDocument, type ProjectPhoto, type Payment, ROLE_LABELS, ROLE_COLORS,
} from "@/lib/admin-api";
import { useConfirm } from "@/components/ConfirmDialog";
import { notify } from "@/lib/notify";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
};

const DOC_TYPES = ["contract", "report", "drawing", "permit", "invoice", "bill", "other"];

type Tab = "overview" | "milestones" | "documents" | "photos" | "payments" | "updates";

function getFileUrl(objectPath: string): string {
  const stripped = objectPath.startsWith("/objects/") ? objectPath.slice("/objects/".length) : objectPath;
  return `/api/staff/storage/serve?path=${encodeURIComponent(stripped)}`;
}

function fmt(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  async function uploadFile(file: File): Promise<string> {
    const { uploadURL, objectPath } = await adminApi.storage.requestUploadUrl(file.name);
    await fetch(uploadURL, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    });
    return objectPath;
  }
  return { uploading, setUploading, uploadFile };
}

export default function AdminProjectDetail({ projectId, user }: { projectId: number; user: StaffUser }) {
  const [, navigate] = useLocation();
  const [project, setProject] = useState<StaffProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const isSuperAdmin = user.role === "super_admin";
  const canFullAccess = user.role === "super_admin" || user.role === "admin";
  const canAssign = canFullAccess || user.role === "project_manager";
  const canManagePayments = canFullAccess || user.role === "project_manager";

  async function load() {
    setLoading(true); setError("");
    try {
      const p = await adminApi.projects.get(projectId);
      setProject(p);
    } catch (err: any) { setError(err.message ?? "Failed to load project"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [projectId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading…</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!project) return null;

  const docs = project.documents ?? [];
  const photos = project.photos ?? [];
  const milestones = project.milestones ?? [];
  const payments = project.payments ?? [];
  const updates = project.updates ?? [];

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "milestones", label: "Milestones", count: milestones.length },
    { id: "documents", label: "Documents", count: docs.length },
    { id: "photos", label: "Photos", count: photos.length },
    { id: "payments", label: "Payments", count: payments.length },
    { id: "updates", label: "Updates", count: updates.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/projects" className="text-gray-400 hover:text-gray-600 text-sm">← Projects</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-semibold text-gray-900">{project.title}</h1>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
          {project.status.replace("_", " ")}
        </span>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t.id
                ? "text-[hsl(352,83%,50%)] border-b-2 border-[hsl(352,83%,50%)] -mb-px bg-white"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs rounded-full px-1.5 py-0.5">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {/* Pass normalised data so sub-tabs never crash on missing fields */}
      {(() => {
        const p = { ...project, milestones, payments, updates, photos, documents: docs };
        return (
          <>
            {tab === "overview" && (
              <OverviewTab project={p} user={user} canFullAccess={canFullAccess} canAssign={canAssign} onReload={load} navigate={navigate} />
            )}
            {tab === "milestones" && (
              <MilestonesTab project={p} user={user} isSuperAdmin={isSuperAdmin} canFullAccess={canFullAccess} onReload={load} />
            )}
            {tab === "documents" && (
              <DocumentsTab project={p} user={user} isSuperAdmin={isSuperAdmin} canFullAccess={canFullAccess} onReload={load} />
            )}
            {tab === "photos" && (
              <PhotosTab project={p} user={user} isSuperAdmin={isSuperAdmin} canFullAccess={canFullAccess} onReload={load} />
            )}
            {tab === "payments" && (
              <PaymentsTab project={p} user={user} isSuperAdmin={isSuperAdmin} canManagePayments={canManagePayments} canFullAccess={canFullAccess} onReload={load} />
            )}
            {tab === "updates" && (
              <UpdatesTab project={p} onReload={load} />
            )}
          </>
        );
      })()}
    </div>
  );
}

// ─── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ project, user, canFullAccess, canAssign, onReload, navigate }: any) {
  const confirm = useConfirm();
  const [editProgress, setEditProgress] = useState(false);
  const [progress, setProgress] = useState(project.progress);
  const [status, setStatus] = useState(project.status);
  const [showAssign, setShowAssign] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleLabel, setAssignRoleLabel] = useState("");

  async function saveProgress() {
    try {
      await adminApi.projects.update(project.id, { progress, status });
      notify.success("Progress and status updated.");
      onReload(); setEditProgress(false);
    } catch (e: any) { notify.error(e.message); }
  }

  async function loadUsers() {
    try { const us = await adminApi.users.list(); setAllUsers(us); } catch {}
  }

  async function handleAssign() {
    if (!assignUserId || !assignRoleLabel) return;
    try {
      await adminApi.projects.assign(project.id, parseInt(assignUserId), assignRoleLabel);
      notify.success("Team member assigned.");
      onReload(); setShowAssign(false); setAssignUserId(""); setAssignRoleLabel("");
    } catch (e: any) { notify.error(e.message); }
  }

  async function handleRemove(userId: number) {
    const ok = await confirm({ title: "Remove Team Member?", message: "They will lose access to this project.", confirmLabel: "Remove", danger: true });
    if (!ok) return;
    try { await adminApi.projects.removeAssignment(project.id, userId); notify.success("Member removed."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleDelete() {
    const ok = await confirm({ title: `Delete "${project.title}"?`, message: "This project and all its data will be permanently deleted.", confirmLabel: "Delete Project", danger: true });
    if (!ok) return;
    try { await adminApi.projects.update(project.id, { deleted: true }); notify.success("Project deleted."); navigate("/admin/projects"); }
    catch (e: any) { notify.error(e.message); }
  }

  useEffect(() => { if (showAssign) loadUsers(); }, [showAssign]);

  return (
    <div className="space-y-6">
      {/* Progress card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Progress</h2>
          {!editProgress && (
            <button onClick={() => setEditProgress(true)} className="text-sm text-[hsl(352,83%,50%)] hover:underline">Edit</button>
          )}
        </div>
        {editProgress ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Progress ({progress}%)</label>
              <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full">
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={saveProgress} className="bg-[hsl(352,83%,50%)] text-white px-4 py-1.5 rounded-lg text-sm hover:opacity-90">Save</button>
              <button onClick={() => setEditProgress(false)} className="text-gray-500 text-sm hover:text-gray-800">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-gray-900">{project.progress}%</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>{project.status.replace("_", " ")}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-[hsl(352,83%,50%)] transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Project Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Client</dt><dd className="font-medium">{project.client?.name ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Location</dt><dd className="font-medium">{project.location ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Type</dt><dd className="font-medium">{project.type ?? "—"}</dd></div>
          <div><dt className="text-gray-500">Start Date</dt><dd className="font-medium">{fmt(project.startDate)}</dd></div>
          <div><dt className="text-gray-500">End Date</dt><dd className="font-medium">{fmt(project.endDate)}</dd></div>
          <div><dt className="text-gray-500">Created</dt><dd className="font-medium">{fmt(project.createdAt)}</dd></div>
          {project.description && (
            <div className="col-span-2"><dt className="text-gray-500">Description</dt><dd className="font-medium whitespace-pre-wrap">{project.description}</dd></div>
          )}
        </dl>
      </div>

      {/* Team */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Team Members</h2>
          {canAssign && (
            <button onClick={() => setShowAssign(v => !v)} className="text-sm text-[hsl(352,83%,50%)] hover:underline">
              {showAssign ? "Cancel" : "+ Add Member"}
            </button>
          )}
        </div>
        {showAssign && (
          <div className="flex gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1">
              <option value="">Select staff member…</option>
              {allUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role})</option>
              ))}
            </select>
            <input placeholder="Role on project" value={assignRoleLabel} onChange={e => setAssignRoleLabel(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48" />
            <button onClick={handleAssign} className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">Assign</button>
          </div>
        )}
        {project.assignments.length === 0 ? (
          <p className="text-gray-400 text-sm">No team members assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {project.assignments.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{a.userName ?? "Unknown"}</p>
                  <p className="text-xs text-gray-500">{a.roleLabel} · {a.userEmail}</p>
                </div>
                {canAssign && (
                  <button onClick={() => handleRemove(a.userId)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {canFullAccess && (
        <div className="pt-2">
          <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700">Delete this project</button>
        </div>
      )}
    </div>
  );
}

// ─── MILESTONES TAB ────────────────────────────────────────────────────────────
function MilestonesTab({ project, user, isSuperAdmin, canFullAccess, onReload }: any) {
  const confirm = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", order: "0" });
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await adminApi.milestones.create(project.id, {
        title: form.title,
        description: form.description || undefined,
        dueDate: form.dueDate || undefined,
        order: parseInt(form.order) || 0,
      });
      notify.success("Milestone added.");
      setForm({ title: "", description: "", dueDate: "", order: "0" });
      setShowAdd(false); onReload();
    } catch (e: any) { notify.error(e.message); }
    finally { setSaving(false); }
  }

  async function toggleComplete(m: Milestone) {
    try {
      if (m.completedAt) await adminApi.milestones.markIncomplete(m.id);
      else { await adminApi.milestones.markComplete(m.id); notify.success("Milestone marked complete — awaiting verification."); }
      onReload();
    } catch (e: any) { notify.error(e.message); }
  }

  async function handleVerify(m: Milestone) {
    try { await adminApi.milestones.verify(m.id); notify.success(`"${m.title}" verified.`); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleReject(m: Milestone) {
    const ok = await confirm({ title: "Reject Milestone?", message: "This will re-open the milestone for more work.", confirmLabel: "Reject & Re-open", danger: true });
    if (!ok) return;
    try { await adminApi.milestones.reject(m.id); notify.info("Milestone rejected and re-opened."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleDelete(m: Milestone) {
    const ok = await confirm({ title: "Delete Milestone?", message: `"${m.title}" will be permanently removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try { await adminApi.milestones.delete(m.id); notify.success("Milestone deleted."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  const milestones: Milestone[] = project.milestones;
  const total = milestones.length;
  const verified = milestones.filter(m => m.verifiedAt).length;
  const completed = milestones.filter(m => m.completedAt && !m.verifiedAt).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{completed}</div>
            <div className="text-xs text-gray-500 mt-1">Pending Verification</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{verified}</div>
            <div className="text-xs text-gray-500 mt-1">Verified</div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(v => !v)} className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
          {showAdd ? "Cancel" : "+ Add Milestone"}
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-gray-900">New Milestone</h3>
          <input placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-20 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={saving || !form.title.trim()}
            className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Adding…" : "Add Milestone"}
          </button>
        </div>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
          No milestones yet. Add one to track project progress.
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map(m => {
            const isCompleted = !!m.completedAt;
            const isVerified = !!m.verifiedAt;
            const pendingVerify = isCompleted && !isVerified;
            return (
              <div key={m.id} className={`bg-white border rounded-xl p-4 transition-all ${isVerified ? "border-green-200" : pendingVerify ? "border-yellow-200" : "border-gray-200"}`}>
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(m)}
                    disabled={isVerified}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isVerified ? "bg-green-500 border-green-500 cursor-not-allowed" :
                      isCompleted ? "bg-yellow-400 border-yellow-400" :
                      "border-gray-300 hover:border-[hsl(352,83%,50%)]"
                    }`}
                    title={isVerified ? "Verified" : isCompleted ? "Pending verification — click to re-open" : "Mark complete"}
                  >
                    {(isCompleted || isVerified) && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                        <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${isVerified ? "text-green-800" : isCompleted ? "text-yellow-800" : "text-gray-900"}`}>
                        {m.title}
                      </span>
                      {isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
                      {pendingVerify && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending Verification</span>}
                      {!isCompleted && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Open</span>}
                    </div>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      {m.dueDate && <span>Due: {fmt(m.dueDate)}</span>}
                      {m.completedAt && <span>Completed: {fmt(m.completedAt)}</span>}
                      {m.verifiedAt && <span>Verified: {fmt(m.verifiedAt)}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-2">
                    {isSuperAdmin && pendingVerify && (
                      <>
                        <button onClick={() => handleVerify(m)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Verify</button>
                        <button onClick={() => handleReject(m)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                      </>
                    )}
                    {canFullAccess && (
                      <button onClick={() => handleDelete(m)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DOCUMENTS TAB ─────────────────────────────────────────────────────────────
function DocumentsTab({ project, isSuperAdmin, canFullAccess, onReload }: any) {
  const confirm = useConfirm();
  const [showUpload, setShowUpload] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("other");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploading, setUploading, uploadFile } = useFileUpload();

  async function handleUpload() {
    if (!file || !docName.trim()) return;
    setUploading(true);
    try {
      const objectPath = await uploadFile(file);
      await adminApi.documents.upload(project.id, { name: docName, url: objectPath, type: docType });
      notify.success(`"${docName}" uploaded successfully.`);
      setFile(null); setDocName(""); setDocType("other");
      if (fileRef.current) fileRef.current.value = "";
      setShowUpload(false); onReload();
    } catch (e: any) { notify.error(e.message); }
    finally { setUploading(false); }
  }

  async function handleApprove(doc: ProjectDocument) {
    try { await adminApi.documents.approve(doc.id); notify.success(`"${doc.name}" approved.`); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleDelete(doc: ProjectDocument) {
    const ok = await confirm({ title: "Delete Document?", message: `"${doc.name}" will be permanently removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try { await adminApi.documents.delete(doc.id); notify.success("Document deleted."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  const documents: ProjectDocument[] = project.documents;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowUpload(v => !v)} className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
          {showUpload ? "Cancel" : "+ Upload Document"}
        </button>
      </div>

      {showUpload && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-gray-900">Upload Document</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">File *</label>
            <input ref={fileRef} type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-sm file:text-gray-700 hover:file:bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Name *</label>
              <input placeholder="e.g. Foundation Contract" value={docName} onChange={e => setDocName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {DOC_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleUpload} disabled={uploading || !file || !docName.trim()}
            className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No documents uploaded yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {documents.map((doc: ProjectDocument) => (
            <div key={doc.id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.type} · {fmt(doc.uploadedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {doc.status}
                </span>
                <a href={getFileUrl(doc.url)} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline">Download</a>
                {isSuperAdmin && doc.status === "pending" && (
                  <button onClick={() => handleApprove(doc)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Approve</button>
                )}
                {canFullAccess && (
                  <button onClick={() => handleDelete(doc)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PHOTOS TAB ────────────────────────────────────────────────────────────────
function PhotosTab({ project, isSuperAdmin, canFullAccess, onReload }: any) {
  const confirm = useConfirm();
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploading, setUploading, uploadFile } = useFileUpload();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const objectPath = await uploadFile(file);
      await adminApi.photos.upload(project.id, { url: objectPath, caption: caption || undefined });
      notify.success("Photo uploaded successfully.");
      setFile(null); setCaption(""); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setShowUpload(false); onReload();
    } catch (e: any) { notify.error(e.message); }
    finally { setUploading(false); }
  }

  async function handleApprove(photo: ProjectPhoto) {
    try { await adminApi.photos.approve(photo.id); notify.success("Photo approved."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleDelete(photo: ProjectPhoto) {
    const ok = await confirm({ title: "Delete Photo?", message: "This photo will be permanently removed.", confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try { await adminApi.photos.delete(photo.id); notify.success("Photo deleted."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  const photos: ProjectPhoto[] = project.photos;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowUpload(v => !v)} className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
          {showUpload ? "Cancel" : "+ Upload Photo"}
        </button>
      </div>

      {showUpload && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-gray-900">Upload Progress Photo</h3>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Image File *</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-sm file:text-gray-700 hover:file:bg-gray-200" />
          </div>
          {preview && (
            <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-cover border border-gray-200" />
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Caption (optional)</label>
            <input placeholder="e.g. Foundation work complete — Feb 2025" value={caption} onChange={e => setCaption(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button onClick={handleUpload} disabled={uploading || !file}
            className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No photos uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo: ProjectPhoto) => (
            <div key={photo.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="relative">
                <img
                  src={getFileUrl(photo.url)}
                  alt={photo.caption ?? "Progress photo"}
                  className="w-full h-48 object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='80'%3E%3Crect fill='%23f3f4f6' width='100%25' height='100%25'/%3E%3Ctext fill='%239ca3af' font-size='12' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E"; }}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${photo.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {photo.status}
                  </span>
                </div>
              </div>
              <div className="p-3">
                {photo.caption && <p className="text-sm text-gray-700 mb-1">{photo.caption}</p>}
                <p className="text-xs text-gray-400">{fmt(photo.uploadedAt)}</p>
                <div className="flex gap-2 mt-2">
                  <a href={getFileUrl(photo.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                  {isSuperAdmin && photo.status === "pending" && (
                    <button onClick={() => handleApprove(photo)} className="text-xs text-green-600 hover:underline">Approve</button>
                  )}
                  {canFullAccess && (
                    <button onClick={() => handleDelete(photo)} className="text-xs text-red-400 hover:underline">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAYMENTS TAB ──────────────────────────────────────────────────────────────
function PaymentsTab({ project, isSuperAdmin, canManagePayments, canFullAccess, onReload }: any) {
  const confirm = useConfirm();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", status: "pending", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const payments: Payment[] = project.payments;
  const total = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
  const paid = payments.filter(p => p.status === "paid").reduce((s, p) => s + parseFloat(p.amount), 0);
  const pending = payments.filter(p => p.status === "pending").reduce((s, p) => s + parseFloat(p.amount), 0);
  const overdue = payments.filter(p => p.status === "overdue").reduce((s, p) => s + parseFloat(p.amount), 0);

  async function handleAdd() {
    if (!form.label.trim() || !form.amount) return;
    setSaving(true);
    try {
      await adminApi.payments.create(project.id, {
        label: form.label, amount: form.amount, status: form.status, dueDate: form.dueDate || undefined,
      });
      notify.success("Billing record added.");
      setForm({ label: "", amount: "", status: "pending", dueDate: "" });
      setShowAdd(false); onReload();
    } catch (e: any) { notify.error(e.message); }
    finally { setSaving(false); }
  }

  async function markPaid(p: Payment) {
    try {
      await adminApi.payments.update(p.id, { status: "paid", paidAt: new Date().toISOString() });
      notify.success(`"${p.label}" marked as paid.`);
      onReload();
    } catch (e: any) { notify.error(e.message); }
  }

  async function markOverdue(p: Payment) {
    try { await adminApi.payments.update(p.id, { status: "overdue" }); notify.warning(`"${p.label}" marked overdue.`); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  async function handleDelete(p: Payment) {
    const ok = await confirm({ title: "Delete Billing Record?", message: `"${p.label}" will be permanently removed.`, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try { await adminApi.payments.delete(p.id); notify.success("Billing record deleted."); onReload(); }
    catch (e: any) { notify.error(e.message); }
  }

  const fmtAmt = (n: number) => `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total", val: fmtAmt(total), color: "text-gray-900" },
            { label: "Paid", val: fmtAmt(paid), color: "text-green-600" },
            { label: "Pending", val: fmtAmt(pending), color: "text-yellow-600" },
            { label: "Overdue", val: fmtAmt(overdue), color: "text-red-600" },
          ].map(item => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.val}</div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {canManagePayments && (
        <div className="flex justify-end">
          <button onClick={() => setShowAdd(v => !v)} className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            {showAdd ? "Cancel" : "+ Add Billing Record"}
          </button>
        </div>
      )}

      {showAdd && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-gray-900">New Billing Record</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label *</label>
              <input placeholder="e.g. Foundation Work Invoice" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Amount (Rs.) *</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={saving || !form.label.trim() || !form.amount}
            className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Adding…" : "Add Record"}
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No billing records yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {payments.map((p: Payment) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{p.label}</p>
                <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                  {p.dueDate && <span>Due: {fmt(p.dueDate)}</span>}
                  {p.paidAt && <span>Paid: {fmt(p.paidAt)}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{fmtAmt(parseFloat(p.amount))}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS_COLORS[p.status]}`}>{p.status}</span>
              </div>
              {canFullAccess && (
                <div className="flex gap-2 ml-2">
                  {p.status === "pending" && (
                    <>
                      <button onClick={() => markPaid(p)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Mark Paid</button>
                      <button onClick={() => markOverdue(p)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Overdue</button>
                    </>
                  )}
                  <button onClick={() => handleDelete(p)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── UPDATES TAB ───────────────────────────────────────────────────────────────
function UpdatesTab({ project, onReload }: any) {
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!message.trim()) return;
    setPosting(true);
    try {
      await adminApi.projects.addUpdate(project.id, message.trim());
      notify.success("Update posted.");
      setMessage(""); onReload();
    } catch (e: any) { notify.error(e.message); }
    finally { setPosting(false); }
  }

  const updates = [...(project.updates ?? [])].reverse();

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <textarea
          placeholder="Post a project update…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-24 resize-none mb-3"
        />
        <button onClick={handlePost} disabled={posting || !message.trim()}
          className="bg-[hsl(352,83%,50%)] text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
          {posting ? "Posting…" : "Post Update"}
        </button>
      </div>

      {updates.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">No updates yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {updates.map((u: any) => (
            <div key={u.id} className="p-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{u.message}</p>
              <p className="text-xs text-gray-400 mt-1">{fmt(u.postedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
