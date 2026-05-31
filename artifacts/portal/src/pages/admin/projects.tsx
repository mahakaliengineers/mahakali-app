import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, ArrowRight, ChevronDown, ChevronRight, FolderOpen, Folder } from "lucide-react";

type Status = "planning" | "active" | "on_hold" | "completed";

const FOLDERS: { status: Status; label: string; color: string; badgeClass: string }[] = [
  { status: "planning",  label: "Planning",  color: "text-blue-600",  badgeClass: "bg-blue-100 text-blue-700 border-blue-200" },
  { status: "active",    label: "Active",    color: "text-green-600", badgeClass: "bg-green-100 text-green-700 border-green-200" },
  { status: "on_hold",   label: "On Hold",   color: "text-amber-600", badgeClass: "bg-amber-100 text-amber-700 border-amber-200" },
  { status: "completed", label: "Completed", color: "text-gray-500",  badgeClass: "bg-gray-100 text-gray-600 border-gray-200" },
];

export default function AdminProjects() {
  const { data: projects, isLoading } = useListProjects();
  const [open, setOpen] = useState<Record<Status, boolean>>({
    planning: true, active: true, on_hold: true, completed: false,
  });

  const toggle = (s: Status) => setOpen(prev => ({ ...prev, [s]: !prev[s] }));

  const byStatus = (status: Status) => (projects ?? []).filter(p => p.status === status);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track all client construction projects.</p>
          </div>
          <Link href="/admin/projects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {FOLDERS.map(({ status, label, color, badgeClass }) => {
              const items = byStatus(status);
              const isOpen = open[status];
              return (
                <div key={status} className="border rounded-xl overflow-hidden bg-card">
                  <button
                    onClick={() => toggle(status)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors"
                  >
                    {isOpen
                      ? <FolderOpen className={`h-5 w-5 ${color}`} />
                      : <Folder className={`h-5 w-5 ${color}`} />
                    }
                    <span className={`font-semibold text-base ${color}`}>{label}</span>
                    <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                      {items.length}
                    </span>
                    <span className="ml-auto text-muted-foreground">
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t divide-y">
                      {items.length === 0 ? (
                        <div className="px-5 py-6 text-sm text-muted-foreground text-center">
                          No {label.toLowerCase()} projects.
                        </div>
                      ) : (
                        items.map(project => (
                          <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{project.title}</div>
                              {project.location && (
                                <div className="text-xs text-muted-foreground mt-0.5">{project.location}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 w-44 shrink-0">
                              <Progress value={project.progress} className="h-1.5 flex-1" />
                              <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                                {project.progress}%
                              </span>
                            </div>
                            <Link href={`/admin/projects/${project.id}/manage`}>
                              <Button variant="ghost" size="sm">
                                Manage <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
