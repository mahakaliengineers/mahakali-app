import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetProject, 
  getGetProjectQueryKey,
  useListMilestones, 
  getListMilestonesQueryKey,
  useListPhotos, 
  getListPhotosQueryKey,
  useListDocuments, 
  getListDocumentsQueryKey,
  useListUpdates, 
  getListUpdatesQueryKey,
  useListPayments,
  getListPaymentsQueryKey
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, MapPin, CheckCircle2, Circle, FileText, Download, MessageSquare, Image as ImageIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function ProjectDetail() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = match && params?.id ? parseInt(params.id, 10) : 0;

  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId, { 
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) } 
  });
  
  const { data: milestones } = useListMilestones(projectId, {
    query: { enabled: !!projectId, queryKey: getListMilestonesQueryKey(projectId) }
  });
  
  const { data: photos } = useListPhotos(projectId, {
    query: { enabled: !!projectId, queryKey: getListPhotosQueryKey(projectId) }
  });
  
  const { data: documents } = useListDocuments(projectId, {
    query: { enabled: !!projectId, queryKey: getListDocumentsQueryKey(projectId) }
  });
  
  const { data: updates } = useListUpdates(projectId, {
    query: { enabled: !!projectId, queryKey: getListUpdatesQueryKey(projectId) }
  });
  
  const { data: payments } = useListPayments(projectId, {
    query: { enabled: !!projectId, queryKey: getListPaymentsQueryKey(projectId) }
  });

  if (isProjectLoading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">Project not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-sm">
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {project.location}
              </span>
            )}
            {project.type && (
              <span className="flex items-center gap-1 border-l pl-4">
                <BuildingIcon className="h-4 w-4" /> {project.type}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="py-2.5">Overview</TabsTrigger>
            <TabsTrigger value="milestones" className="py-2.5">Milestones</TabsTrigger>
            <TabsTrigger value="photos" className="py-2.5">Photos</TabsTrigger>
            <TabsTrigger value="documents" className="py-2.5">Documents</TabsTrigger>
            <TabsTrigger value="updates" className="py-2.5">Updates</TabsTrigger>
            <TabsTrigger value="payments" className="py-2.5">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span>Overall Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm leading-relaxed">{project.description || 'No description provided.'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Start Date
                      </span>
                      <span className="text-sm font-medium">
                        {project.startDate ? format(new Date(project.startDate), 'PPP') : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> Est. Completion
                      </span>
                      <span className="text-sm font-medium">
                        {project.endDate ? format(new Date(project.endDate), 'PPP') : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="h-4 w-4 flex items-center justify-center bg-muted rounded-full text-[10px]">C</span> 
                        Client
                      </span>
                      <span className="text-sm font-medium">{project.client.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>Track the key phases of your project.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {milestones?.sort((a, b) => a.order - b.order).map((milestone) => (
                    <div key={milestone.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {milestone.completedAt ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                        <div className="flex flex-col gap-1">
                          <h4 className="font-semibold text-base">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                          {milestone.completedAt && (
                            <span className="text-xs font-medium text-primary mt-2 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> 
                              Completed {format(new Date(milestone.completedAt), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {milestones?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground relative z-10 bg-background/80 backdrop-blur-sm mx-auto max-w-sm rounded-lg border">
                      No milestones set for this project yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos?.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group cursor-pointer">
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || 'Project photo'} 
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {photo.caption && (
                    <CardContent className="p-3 bg-card border-t">
                      <p className="text-sm text-muted-foreground truncate">{photo.caption}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
              {photos?.length === 0 && (
                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-card">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">No photos uploaded yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {documents?.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(doc.uploadedAt), 'MMM d, yyyy')} &bull; {doc.type}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  ))}
                  {documents?.length === 0 && (
                    <div className="py-12 text-center">
                      <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground">No documents uploaded yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  {updates?.map((update) => (
                    <div key={update.id} className="flex gap-4">
                      <div className="mt-1">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">Project Update</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(update.postedAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {update.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {updates?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      No updates posted yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Description</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Due Date</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Paid On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments?.map((payment) => (
                        <tr key={payment.id} className="bg-card hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">
                            {payment.label}
                          </td>
                          <td className="px-6 py-4 font-mono font-medium">
                            Rs. {parseFloat(payment.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {payment.dueDate ? format(new Date(payment.dueDate), 'MMM d, yyyy') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              payment.status === 'paid' ? 'default' : 
                              payment.status === 'overdue' ? 'destructive' : 
                              'secondary'
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {payment.paidAt ? format(new Date(payment.paidAt), 'MMM d, yyyy') : '-'}
                          </td>
                        </tr>
                      ))}
                      {payments?.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No payments recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}