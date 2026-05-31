import { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban,
  LogOut,
  Loader2
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = import.meta.env.BASE_URL || "/portal/";
      }
    });
  };

  const isStaff = user.role === "admin" || user.role === "super_admin";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ...(isStaff
      ? [
          { href: "/admin/projects", label: "All Projects", icon: FolderKanban },
          { href: "/admin/clients", label: "Clients", icon: Users },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-9 w-auto object-contain" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">Mahakali Engineers</div>
              <div className="text-xs text-muted-foreground">& Developers Pvt. Ltd.</div>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-card flex items-center px-6 md:hidden">
          <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-8 w-auto object-contain mr-2" />
          <div className="leading-tight">
            <div className="text-sm font-bold">Mahakali Engineers</div>
            <div className="text-xs text-muted-foreground">& Developers Pvt. Ltd.</div>
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
