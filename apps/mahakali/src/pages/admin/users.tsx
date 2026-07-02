import { useEffect, useState } from "react";
import { adminApi, type StaffUser, type StaffRole, ROLE_LABELS, ROLE_COLORS } from "@/lib/admin-api";
import { useConfirm } from "@/components/ConfirmDialog";
import { notify } from "@/lib/notify";

const ASSIGNABLE_ROLES: StaffRole[] = ["admin", "project_manager", "engineer", "site_engineer"];

function validatePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10) return "Phone number must not exceed 10 digits";
  return "";
}

export default function AdminUsers({ currentUser }: { currentUser: StaffUser }) {
  const confirm = useConfirm();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try { setUsers(await adminApi.users.list()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, name: string) {
    const ok = await confirm({
      title: "Delete Staff User?",
      message: `"${name}" will lose all access. This cannot be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.users.delete(id);
      notify.success(`${name} has been removed.`, "User Deleted");
      await load();
    } catch (err: any) {
      notify.error(err.message ?? "Failed to delete user");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Users</h1>
          <p className="text-sm text-gray-500">Manage team members and their roles</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Staff
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Phone</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                      {u.id === currentUser.id && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">You</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >Edit</button>
                      {u.id !== currentUser.id && u.role !== "super_admin" && (
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">No staff users yet.</div>
          )}
        </div>
      )}

      {showCreate && (
        <UserFormModal
          title="Add Staff Member"
          onClose={() => setShowCreate(false)}
          onSave={async (data) => {
            await adminApi.users.create(data as any);
            setShowCreate(false);
            await load();
          }}
        />
      )}

      {editUser && (
        <UserFormModal
          title="Edit Staff Member"
          initialUser={editUser}
          onClose={() => setEditUser(null)}
          onSave={async (data) => {
            if (data.role !== editUser.role) {
              await adminApi.users.changeRole(editUser.id, data.role);
            }
            const { role, ...rest } = data;
            if (rest.name || rest.email || rest.phone !== undefined || rest.password) {
              await adminApi.users.update(editUser.id, rest);
            }
            setEditUser(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function UserFormModal({
  title,
  initialUser,
  onClose,
  onSave,
}: {
  title: string;
  initialUser?: StaffUser;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState(initialUser?.name ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [role, setRole] = useState<StaffRole>(
    initialUser?.role === "super_admin" ? "admin" : (initialUser?.role ?? "engineer")
  );
  const [phone, setPhone] = useState(initialUser?.phone ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function handlePhoneChange(val: string) {
    // Allow only digits
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
    setPhoneError(digitsOnly.length === 10 ? "" : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const pErr = phone ? validatePhone(phone) : "";
    if (pErr) { setPhoneError(pErr); return; }
    setSaving(true);
    try {
      await onSave({ name, email, role, phone: phone || undefined, password: password || undefined });
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
              <select value={role} onChange={e => setRole(e.target.value as StaffRole)}
                disabled={initialUser?.role === "super_admin"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-50 disabled:text-gray-400">
                {initialUser?.role === "super_admin" ? (
                  <option value="super_admin">Super Admin</option>
                ) : (
                  ASSIGNABLE_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)
                )}
              </select>
              {initialUser?.role === "super_admin" && (
                <p className="text-xs text-gray-400 mt-1">Super Admin role cannot be changed</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone (max 10 digits)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                maxLength={10}
                placeholder="e.g. 9851234567"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${phoneError ? "border-red-400" : "border-gray-300"}`}
              />
              {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password {initialUser ? "(leave blank to keep current)" : "*"}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required={!initialUser}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
