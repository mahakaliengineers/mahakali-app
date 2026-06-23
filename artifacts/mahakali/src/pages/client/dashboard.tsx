import { useEffect, useState } from "react";
import { Link } from "wouter";
import { clientApi, type ClientProject, type ClientUser } from "@/lib/client-portal-api";

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  on_hold: "bg-gray-100 text-gray-600",
  completed: "bg-blue-100 text-blue-700",
};

export default function ClientDashboard({ user }: { user: ClientUser }) {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientApi.projects.list().then(setProjects).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's an overview of your construction projects.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
          </svg>
          <p className="text-gray-500 font-medium">No projects yet</p>
          <p className="text-sm text-gray-400 mt-1">Your projects will appear here once assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map(p => (
            <Link key={p.id} href={`/client/projects/${p.id}`} className="block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden">
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{p.title}</h2>
                    {p.location && (
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {p.location}
                      </p>
                    )}
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {p.status.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span className="font-medium text-gray-900">{p.progress}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-400">Start Date</span>
                    <span className="font-medium text-gray-700">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString("en-NP") : "TBD"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Est. Completion</span>
                    <span className="font-medium text-gray-700">
                      {p.endDate ? new Date(p.endDate).toLocaleDateString("en-NP") : "TBD"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{p.type ?? "Construction Project"}</span>
                <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  View Details
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
