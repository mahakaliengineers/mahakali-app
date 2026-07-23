import { useEffect, useState } from "react";
import { adminApi, type Inquiry } from "@/lib/admin-api";
import { notify } from "@/lib/notify";
import { useConfirm } from "@/components/ConfirmDialog";

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  archived: "bg-yellow-100 text-yellow-700",
};

type Filter = "all" | "new" | "read" | "archived";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminInquiries() {
  const confirm = useConfirm();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("new");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    adminApi.inquiries
      .list()
      .then(setItems)
      .catch(() => notify.error("Failed to load inquiries"))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: number) {
    try {
      const updated = await adminApi.inquiries.updateStatus(id, "read");
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch {
      notify.error("Failed to update status");
    }
  }

  async function archive(id: number) {
    try {
      const updated = await adminApi.inquiries.updateStatus(id, "archived");
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      notify.success("Archived");
    } catch {
      notify.error("Failed to archive");
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: "Delete this inquiry permanently?",
      message:
        "Are you sure you want to delete this inquiry? This action cannot be undone.",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminApi.inquiries.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      notify.success("Deleted");
    } catch {
      notify.error("Failed to delete");
    }
  }

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);
  const counts = {
    all: items.length,
    new: items.filter((i) => i.status === "new").length,
    read: items.filter((i) => i.status === "read").length,
    archived: items.filter((i) => i.status === "archived").length,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "new", label: "New" },
    { key: "read", label: "Read" },
    { key: "archived", label: "Archived" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quote Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submissions from the "Request a Quote" form on the website.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f.key
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
            <span
              className={`ml-1.5 text-xs ${filter === f.key ? "text-white/80" : "text-gray-400"}`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">
            No {filter === "all" ? "" : filter} inquiries
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => {
            const isOpen = expanded === inquiry.id;
            const fullName = [inquiry.firstName, inquiry.lastName]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={inquiry.id}
                className={`bg-white border rounded-xl overflow-hidden transition-shadow ${inquiry.status === "new" ? "border-blue-200 shadow-sm" : "border-gray-100"}`}
              >
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpanded(isOpen ? null : inquiry.id);
                    if (inquiry.status === "new") markRead(inquiry.id);
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {inquiry.firstName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {fullName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[inquiry.status]}`}
                      >
                        {inquiry.status}
                      </span>
                      {inquiry.projectType && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {inquiry.projectType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="hover:text-red-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inquiry.email}
                      </a>
                      {inquiry.phone && <span>{inquiry.phone}</span>}
                      <span>{formatDate(inquiry.createdAt)}</span>
                    </div>
                    {!isOpen && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {inquiry.message}
                      </p>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
                      {inquiry.message}
                    </p>
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <a
                        href={`mailto:${inquiry.email}?subject=Re: Your inquiry — Mahakali Engineers&body=Dear ${inquiry.firstName},%0A%0A`}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reply by Email
                      </a>
                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Call
                        </a>
                      )}
                      {inquiry.status !== "archived" && (
                        <button
                          onClick={() => archive(inquiry.id)}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:border-gray-300 transition-colors"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
