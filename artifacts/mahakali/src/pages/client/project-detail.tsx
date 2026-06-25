import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  clientApi, type ClientProject, type Milestone, type Photo,
  type Document, type Update, type Payment, type Comment, type Testimonial,
} from "@/lib/client-portal-api";
import { notify } from "@/lib/notify";

type Tab = "overview" | "milestones" | "photos" | "documents" | "updates" | "payments" | "comments" | "testimonial";

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

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <svg
            viewBox="0 0 20 20"
            className={`w-7 h-7 transition-colors ${star <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ClientProjectDetail({ projectId }: { projectId: number }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [project, setProject] = useState<ClientProject | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Testimonial form state
  const [tForm, setTForm] = useState({ text: "", rating: 5, authorRole: "" });
  const [tSubmitting, setTSubmitting] = useState(false);
  const [tSubmitted, setTSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [p, ms, phs, docs, upds, pays, cmts, tests] = await Promise.all([
          clientApi.projects.get(projectId),
          clientApi.resources.milestones(projectId),
          clientApi.resources.photos(projectId),
          clientApi.resources.documents(projectId),
          clientApi.resources.updates(projectId),
          clientApi.resources.payments(projectId),
          clientApi.resources.comments(projectId),
          clientApi.resources.testimonials(projectId),
        ]);
        setProject(p);
        setMilestones(ms);
        setPhotos(phs);
        setDocuments(docs);
        setUpdates(upds);
        setPayments(pays);
        setComments(cmts);
        setTestimonials(tests);
        if (tests.length > 0) setTSubmitted(true);
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

  async function submitTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (!tForm.text.trim()) return;
    setTSubmitting(true);
    try {
      const t = await clientApi.resources.submitTestimonial(projectId, {
        text: tForm.text.trim(),
        rating: tForm.rating,
        authorRole: tForm.authorRole.trim() || undefined,
      });
      setTestimonials(prev => [...prev, t]);
      setTSubmitted(true);
      notify.success("Your review has been submitted and is pending approval. Thank you!", "Review Submitted");
    } catch (err: any) {
      notify.error(err.message ?? "Failed to submit review");
    } finally {
      setTSubmitting(false);
    }
  }

  const myTestimonial = testimonials[0];

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "milestones", label: "Milestones", count: milestones.length },
    { key: "photos", label: "Photos", count: photos.length },
    { key: "documents", label: "Documents", count: documents.length },
    { key: "updates", label: "Updates", count: updates.length },
    { key: "payments", label: "Payments", count: payments.length },
    { key: "comments", label: "Comments", count: comments.length },
    { key: "testimonial", label: "Leave a Review" },
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
      <Link href="/client" className="text-sm text-gray-400 hover:underline mt-2 block">← Back to dashboard</Link>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Link href="/client" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          My Projects
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
              {t.key === "testimonial" && myTestimonial && (
                <span className="ml-1.5 text-xs text-yellow-500">★</span>
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

        {tab === "testimonial" && (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Share Your Experience</h2>
                  <p className="text-sm text-gray-500">Your feedback helps us improve and helps others trust us</p>
                </div>
              </div>
            </div>

            {/* Submitted testimonial */}
            {myTestimonial && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} viewBox="0 0 20 20" className={`w-4 h-4 ${s <= myTestimonial.rating ? "fill-yellow-400" : "fill-gray-200"}`}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${myTestimonial.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {myTestimonial.status === "approved" ? "Published" : "Pending Review"}
                  </span>
                </div>
                <p className="text-gray-700 italic text-sm leading-relaxed">"{myTestimonial.text}"</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Submitted on {new Date(myTestimonial.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {/* Form — only show if not yet submitted */}
            {!tSubmitted ? (
              <form onSubmit={submitTestimonial} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <h3 className="font-semibold text-gray-900">Write a Review</h3>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
                  <StarRating value={tForm.rating} onChange={r => setTForm(f => ({ ...f, rating: r }))} />
                  <p className="text-xs text-gray-400 mt-1">
                    {tForm.rating === 5 ? "Excellent" : tForm.rating === 4 ? "Very Good" : tForm.rating === 3 ? "Good" : tForm.rating === 2 ? "Fair" : "Poor"}
                  </p>
                </div>

                {/* Review text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={tForm.text}
                    onChange={e => setTForm(f => ({ ...f, text: e.target.value }))}
                    rows={4}
                    placeholder="Share your experience working with Mahakali Engineers — quality of work, communication, timeliness, professionalism…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{tForm.text.length}/500 characters</p>
                </div>

                {/* Your role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Role / Company (optional)</label>
                  <input
                    type="text"
                    value={tForm.authorRole}
                    onChange={e => setTForm(f => ({ ...f, authorRole: e.target.value }))}
                    placeholder="e.g. Director, Valley Holdings"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={tSubmitting || !tForm.text.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    {tSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Review
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-400">Reviews are approved before appearing on the website.</p>
                </div>
              </form>
            ) : (
              !myTestimonial && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800">Review Submitted!</h3>
                  <p className="text-sm text-green-600 mt-1">Your review is pending approval and will appear on the website shortly.</p>
                </div>
              )
            )}
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
