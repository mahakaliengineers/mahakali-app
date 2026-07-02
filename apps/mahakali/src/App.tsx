import { Route, Router as WouterRouter, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminApp from "@/pages/admin/index";
import ClientApp from "@/pages/client/index";
import PublicProjectPage from "@/pages/public-project";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects/:id">
        {(params) => <PublicProjectPage projectId={parseInt(params.id ?? "0", 10)} />}
      </Route>
      <Route path={/^\/admin(\/.*)?$/} component={AdminApp} />
      <Route path={/^\/client(\/.*)?$/} component={ClientApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConfirmProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </ConfirmProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
