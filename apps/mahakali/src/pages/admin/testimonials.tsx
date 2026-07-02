import { useEffect, useState } from "react";
import { adminApi, type AdminTestimonial } from "@/lib/admin-api";
import { notify } from "@/lib/notify";
import { useConfirm } from "@/components/ConfirmDialog";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} viewBox="0 0 20 20" className={`w-4 h-4 ${s <= rating ? "fill-yellow-400" : "fill-gray-200"}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminTestimonials() {
  const confirm = useConfirm();
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await adminApi.testimonials.list();
      setItems(data);
    } catch (err: any) {
      notify.error(err.message ?? "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: number) {
    setActing(id);
    try {
      const updated = await adminApi.testimonials.approve(id);
      setItems(prev => prev.map(t => t.id === id ? updated : t));
      notify.success("Review approved and published to the website.", "Approved");
    } catch (err: any) {
      notify.error(err.message ?? "Failed to approve");
    } finally {
      setActing(null);
    }
  }

  async function reject(id: number) {
    setActing(id);
    try {
      const updated = await adminApi.testimonials.reject(id);
      setItems(prev => prev.map(t => t.id === id ? updated : t));
      notify.info("Review rejected and hidden from the website.", "Rejected");
    } catch (err: any) {
      notify.error(err.message ?? "Failed to reject");
    } finally {
      setActing(null);
    }
  }

  async function remove(id: number, authorName: string) {
    const ok = await confirm({
      title: "Delete Review",
      message: `Permanently delete the review by "${authorName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setActing(id);
    try {
      await adminApi.testimonials.delete(id);
      setItems(prev => prev.filter(t => t.id !== id));
      notify.success("Review permanently deleted.");
    } catch (err: any) {
      notify.error(err.message ?? "Failed to delete");
    } finally {
      setActing(null);
    }
  }

  const filtered = filter === "all" ? items : items.filter(t => t.status === filter);

  const counts = {
    all: items.length,
    pending: items.filter(t => t.status === "pending").length,
    approved: items.filter(t => t.status === "approved").length,
    rejected: items.filter(t => t.status === "rejected").length,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderate client testimonials before they appear on the website</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Pending alert banner */}
      {counts.pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-yellow-800 font-medium">
            {counts.pending} review{counts.pending !== 1 ? "s" : ""} awaiting your decision
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["pending", "approved", "rejected", "all"] as FilterStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${filter === s ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === s ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                  <div className="h-14 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">
            {filter === "all" ? "No reviews yet" : `No ${filter} reviews`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <div key={t.id} className={`bg-white rounded-xl border p-5 transition-opacity ${acting === t.id ? "opacity-50 pointer-events-none" : ""} ${t.status === "pending" ? "border-yellow-200" : t.status === "approved" ? "border-green-200" : "border-gray-200"}`}>
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0">
                  {t.authorName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{t.authorName}</span>
                    {t.authorRole && <span className="text-sm text-gray-500">{t.authorRole}</span>}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>

                  {/* Stars + date */}
                  <div className="flex items-center gap-3 mb-3">
                    <StarRow rating={t.rating} />
                    <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    {t.projectId && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Project #{t.projectId}</span>}
                  </div>

                  {/* Review text */}
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 italic">
                    "{t.text}"
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {t.status !== "approved" && (
                      <button
                        onClick={() => approve(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve & Publish
                      </button>
                    )}
                    {t.status !== "rejected" && (
                      <button
                        onClick={() => reject(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Reject
                      </button>
                    )}
                    {t.status === "approved" && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Live on website
                      </span>
                    )}
                    <button
                      onClick={() => remove(t.id, t.authorName)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors border border-red-200 hover:border-red-300"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
