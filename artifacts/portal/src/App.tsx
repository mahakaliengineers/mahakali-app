import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectDetail from "@/pages/project-detail";
import AdminProjects from "@/pages/admin/projects";
import AdminClients from "@/pages/admin/clients";
import AdminNewProject from "@/pages/admin/new-project";
import AdminManageProject from "@/pages/admin/manage-project";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/admin/projects" component={AdminProjects} />
      <Route path="/admin/clients" component={AdminClients} />
      <Route path="/admin/projects/new" component={AdminNewProject} />
      <Route path="/admin/projects/:id/manage" component={AdminManageProject} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
