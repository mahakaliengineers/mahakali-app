import { Layout } from "@/components/layout";
import { useListProjects } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AdminProjects() {
  const { data: projects, isLoading } = useListProjects();

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
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Progress</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projects?.map((project) => (
                      <tr key={project.id} className="bg-card hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-base mb-1">{project.title}</div>
                          {project.location && (
                            <div className="text-muted-foreground text-xs">{project.location}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full max-w-[200px] flex items-center gap-3">
                            <Progress value={project.progress} className="h-2 flex-1" />
                            <span className="text-xs font-medium w-8">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/projects/${project.id}/manage`}>
                            <Button variant="ghost" size="sm">
                              Manage <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {projects?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          No projects found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
