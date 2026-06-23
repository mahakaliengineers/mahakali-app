import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { clientApi, type ClientUser } from "@/lib/client-portal-api";
import ClientLogin from "./login";
import ClientDashboard from "./dashboard";
import ClientProjectDetail from "./project-detail";

function ClientLayout({ user, onLogout, children }: { user: ClientUser; onLogout: () => void; children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Mahakali Client Portal</p>
              <p className="text-xs text-gray-400">Engineers & Developers Pvt. Ltd.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <button onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default function ClientApp() {
  const [user, setUser] = useState<ClientUser | null | undefined>(undefined);
  const [, navigate] = useLocation();

  useEffect(() => {
    clientApi.auth.me()
      .then(u => {
        if (u.role === "client") setUser(u);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await clientApi.auth.logout();
    setUser(null);
    navigate("/client");
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user === null) {
    return <ClientLogin onLogin={setUser} />;
  }

  return (
    <ClientLayout user={user} onLogout={logout}>
      <Switch>
        <Route path="/client" component={() => <ClientDashboard user={user} />} />
        <Route path="/client/projects/:id" component={({ params }) => (
          <ClientProjectDetail projectId={parseInt(params.id, 10)} />
        )} />
        <Route component={() => <ClientDashboard user={user} />} />
      </Switch>
    </ClientLayout>
  );
}
