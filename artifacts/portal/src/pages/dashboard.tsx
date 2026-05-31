import { useAuth } from "@/contexts/auth";
import { Layout } from "@/components/layout";
import { useListProjects } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, MapPin, CalendarDays, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useListProjects();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name}. Here is an overview of your projects.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects?.map(project => (
              <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/50 border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {project.title}
                      </CardTitle>
                      {project.location && (
                        <CardDescription className="flex items-center gap-1 mt-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {project.location}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-medium">
                      <span>Overall Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" /> Start Date
                      </span>
                      <p className="font-medium">{project.startDate ? format(new Date(project.startDate), 'PPP') : 'TBD'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" /> Est. Completion
                      </span>
                      <p className="font-medium">{project.endDate ? format(new Date(project.endDate), 'PPP') : 'TBD'}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={(user?.role === "admin" || user?.role === "super_admin") ? `/admin/projects/${project.id}/manage` : `/projects/${project.id}`}>
                      <Button className="w-full" variant="outline">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {projects?.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-card">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground">You don't have any active construction projects yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
