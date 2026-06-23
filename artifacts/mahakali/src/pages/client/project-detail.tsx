import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  clientApi, type ClientProject, type Milestone, type Photo,
  type Document, type Update, type Payment, type Comment,
} from "@/lib/client-portal-api";

type Tab = "overview" | "milestones" | "photos" | "documents" | "updates" | "payments" | "comments";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

const PAY_STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  overdue: "bg-red-100 text-red-700",
};

export default function ClientProjectDetail({ projectId }: { projectId: number }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [project, setProject] = useState<ClientProject | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [p, ms, phs, docs, upds, pays, cmts] = await Promise.all([
          clientApi.projects.get(projectId),
          clientApi.resources.milestones(projectId),
          clientApi.resources.photos(projectId),
          clientApi.resources.documents(projectId),
          clientApi.resources.updates(projectId),
          clientApi.resources.payments(projectId),
          clientApi.resources.comments(projectId),
        ]);
        setProject(p);
        setMilestones(ms);
        setPhotos(phs);
        setDocuments(docs);
        setUpdates(upds);
        setPayments(pays);
        setComments(cmts);
      } catch (err: any) {
        setError(err.message ?? "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const c = await clientApi.resources.addComment(projectId, newComment.trim());
      setComments(prev => [...prev, c]);
      setNewComment("");
    } finally {
      setPosting(false);
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "milestones", label: "Milestones", count: milestones.length },
    { key: "photos", label: "Photos", count: photos.length },
    { key: "documents", label: "Documents", count: documents.length },
    { key: "updates", label: "Updates", count: updates.length },
    { key: "payments", label: "Payments", count: payments.length },
    { key: "comments", label: "Comments", count: comments.length },
  ];

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  );

  if (error || !project) return (
    <div className="text-center py-16">
      <p className="text-red-600 font-medium">{error || "Project not found"}</p>
      <Link href="/client"><a className="text-sm text-gray-400 hover:underline mt-2 block">← Back to dashboard</a></Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Link href="/client">
          <a className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Projects
          </a>
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[project.status]}`}>
                {project.status.replace("_", " ")}
              </span>
              {project.location && <span className="text-sm text-gray-400">{project.location}</span>}
              {project.type && <span className="text-sm text-gray-400">· {project.type}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Progress</h2>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Overall Completion</span>
                  <span className="font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              {project.description && (
                <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">{project.description}</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Details</h2>
              <InfoRow label="Start Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} />
              <InfoRow label="Est. Completion" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"} />
              <InfoRow label="Type" value={project.type ?? "—"} />
              <InfoRow label="Location" value={project.location ?? "—"} />
            </div>
          </div>
        )}

        {tab === "milestones" && (
          <div className="bg-white rounded-xl border border-gray-200">
            {milestones.length === 0 ? (
              <EmptyState label="No milestones added yet." />
            ) : (
              <div className="divide-y divide-gray-50">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex items-start gap-4 px-5 py-4">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${m.completed ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                      {m.completed ? (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs text-gray-400">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${m.completed ? "line-through text-gray-400" : "text-gray-900"}`}>{m.title}</p>
                      {m.description && <p className="text-sm text-gray-500 mt-0.5">{m.description}</p>}
                      {m.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">Due: {new Date(m.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${m.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {m.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "photos" && (
          <div>
            {photos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200"><EmptyState label="No photos uploaded yet." /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map(p => (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                    className="block aspect-video bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity">
                    <img src={p.url} alt={p.caption ?? "Photo"} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "documents" && (
          <div className="bg-white rounded-xl border border-gray-200">
            {documents.length === 0 ? (
              <EmptyState label="No documents uploaded yet." />
            ) : (
              <div className="divide-y divide-gray-50">
                {documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.fileType ?? "Document"} · {new Date(d.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "updates" && (
          <div className="bg-white rounded-xl border border-gray-200">
            {updates.length === 0 ? (
              <EmptyState label="No updates posted yet." />
            ) : (
              <div className="divide-y divide-gray-50">
                {[...updates].reverse().map(u => (
                  <div key={u.id} className="px-5 py-4">
                    <p className="text-sm text-gray-700">{u.content}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{new Date(u.postedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            {payments.length === 0 ? (
              <EmptyState label="No payment records yet." />
            ) : (
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Description</th>
                    <th className="text-right px-5 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Due Date</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Paid On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="px-5 py-3 text-gray-900">{p.description}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">
                        NPR {parseFloat(p.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${PAY_STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "comments" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200">
              {comments.length === 0 ? (
                <EmptyState label="No comments yet. Be the first to comment." />
              ) : (
                <div className="divide-y divide-gray-50">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3 px-5 py-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(c.authorName ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{c.authorName ?? "Unknown"}</span>
                          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{c.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form onSubmit={submitComment} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Add a comment</label>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write your comment or question here…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end">
                <button type="submit" disabled={posting || !newComment.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {posting ? "Posting…" : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium text-right ml-2">{value}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="py-10 text-center text-sm text-gray-400">{label}</div>;
}
