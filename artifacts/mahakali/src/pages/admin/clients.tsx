import { useEffect, useState } from "react";
import { adminApi, type ClientUser } from "@/lib/admin-api";

function validatePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10) return "Phone number must not exceed 10 digits";
  return "";
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState<ClientUser | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try { setClients(await adminApi.clients.list()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete client "${name}"? This will also remove their login access.`)) return;
    await adminApi.clients.delete(id);
    await load();
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.clientCode ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500">Manage client accounts and portal access</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      <div className="relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2 w-full max-w-xs border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Site Location</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Fiscal Year</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {c.clientCode ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{c.siteLocation ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{c.fiscalYear ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditClient(c)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-xs text-red-600 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-10">
              {search ? "No clients match your search." : "No clients yet. Add your first client."}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <ClientFormModal
          title="Add Client"
          onClose={() => setShowCreate(false)}
          onSave={async (data) => {
            await adminApi.clients.create(data as any);
            setShowCreate(false);
            await load();
          }}
        />
      )}

      {editClient && (
        <ClientFormModal
          title="Edit Client"
          initial={editClient}
          onClose={() => setEditClient(null)}
          onSave={async (data) => {
            await adminApi.clients.update(editClient.id, data);
            setEditClient(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: ClientUser;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [siteLocation, setSiteLocation] = useState(initial?.siteLocation ?? "");
  const [fiscalYear, setFiscalYear] = useState(initial?.fiscalYear ?? "");
  const [clientNumber, setClientNumber] = useState(initial?.clientNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  function handlePhoneChange(val: string) {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
    setPhoneError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const pErr = phone ? validatePhone(phone) : "";
    if (pErr) { setPhoneError(pErr); return; }
    setSaving(true);
    try {
      await onSave({
        name,
        email,
        password: password || undefined,
        phone: phone || undefined,
        siteLocation: siteLocation || undefined,
        fiscalYear: fiscalYear || undefined,
        clientNumber: clientNumber || undefined,
      });
    } catch (err: any) {
      setError(err.message ?? "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
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
                Password {initial ? "(leave blank to keep current)" : "*"}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required={!initial}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Site Location</label>
              <input value={siteLocation} onChange={e => setSiteLocation(e.target.value)}
                placeholder="e.g. Chabahil-07, Kathmandu"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fiscal Year</label>
              <input value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}
                placeholder="e.g. 2080/81"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Number</label>
              <input value={clientNumber} onChange={e => setClientNumber(e.target.value)}
                placeholder="e.g. 100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
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
