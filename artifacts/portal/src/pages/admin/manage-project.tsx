import { useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { 
  useGetProject, 
  getGetProjectQueryKey,
  useUpdateProject,
  useListMilestones, 
  getListMilestonesQueryKey,
  useAddMilestone,
  useUpdateMilestone,
  useListPhotos, 
  getListPhotosQueryKey,
  useAddPhoto,
  useListDocuments, 
  getListDocumentsQueryKey,
  useAddDocument,
  useListUpdates, 
  getListUpdatesQueryKey,
  useAddUpdate,
  useListPayments,
  getListPaymentsQueryKey,
  useAddPayment,
  useUpdatePayment
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, ArrowLeft, Image as ImageIcon, Save, CheckCircle2, FileText, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminManageProject() {
  const [match, params] = useRoute("/admin/projects/:id/manage");
  const projectId = match && params?.id ? parseInt(params.id, 10) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
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

  // Mutations
  const updateProject = useUpdateProject();
  const addMilestone = useAddMilestone();
  const updateMilestone = useUpdateMilestone();
  const addPhoto = useAddPhoto();
  const addDocument = useAddDocument();
  const addUpdate = useAddUpdate();
  const addPayment = useAddPayment();
  const updatePayment = useUpdatePayment();

  // Local states for quick forms
  const [projectProgress, setProjectProgress] = useState<number>(0);
  const [projectStatus, setProjectStatus] = useState<string>("");
  
  // Set initial state when project loads
  if (project && projectProgress === 0 && !updateProject.isPending && project.progress !== projectProgress && projectStatus === "") {
    setProjectProgress(project.progress);
    setProjectStatus(project.status);
  }

  const handleUpdateProject = () => {
    updateProject.mutate({
      id: projectId,
      data: { progress: projectProgress, status: projectStatus }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
        toast({ title: "Project updated" });
      }
    });
  };

  // Forms states
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    addMilestone.mutate({
      id: projectId,
      data: { title: newMilestoneTitle, description: newMilestoneDesc, order: (milestones?.length || 0) + 1 }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMilestonesQueryKey(projectId) });
        setNewMilestoneTitle("");
        setNewMilestoneDesc("");
        toast({ title: "Milestone added" });
      }
    });
  };

  const handleMarkMilestone = (milestoneId: number, isComplete: boolean) => {
    updateMilestone.mutate({
      id: milestoneId,
      data: { completedAt: isComplete ? new Date().toISOString() : null }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMilestonesQueryKey(projectId) });
      }
    });
  };

  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    addPhoto.mutate({
      id: projectId,
      data: { url: newPhotoUrl, caption: newPhotoCaption }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey(projectId) });
        setNewPhotoUrl("");
        setNewPhotoCaption("");
        toast({ title: "Photo added" });
      }
    });
  };

  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument.mutate({
      id: projectId,
      data: { name: newDocName, url: newDocUrl, type: "PDF" }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(projectId) });
        setNewDocName("");
        setNewDocUrl("");
        toast({ title: "Document added" });
      }
    });
  };

  const [newUpdateMsg, setNewUpdateMsg] = useState("");
  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    addUpdate.mutate({
      id: projectId,
      data: { message: newUpdateMsg }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUpdatesQueryKey(projectId) });
        setNewUpdateMsg("");
        toast({ title: "Update posted" });
      }
    });
  };

  const [paymentLabel, setPaymentLabel] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment.mutate({
      id: projectId,
      data: { label: paymentLabel, amount: paymentAmount, status: "pending" }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(projectId) });
        setPaymentLabel("");
        setPaymentAmount("");
        toast({ title: "Payment record added" });
      }
    });
  };

  const handleUpdatePaymentStatus = (paymentId: number, status: string) => {
    updatePayment.mutate({
      id: paymentId,
      data: { 
        status, 
        paidAt: status === 'paid' ? new Date().toISOString() : undefined 
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPaymentsQueryKey(projectId) });
      }
    });
  };

  if (isProjectLoading || !project) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage: {project.title}</h1>
            <p className="text-muted-foreground mt-1">Client: {project.client.name}</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1 mb-6">
            <TabsTrigger value="overview" className="py-2.5">Settings</TabsTrigger>
            <TabsTrigger value="milestones" className="py-2.5">Milestones</TabsTrigger>
            <TabsTrigger value="photos" className="py-2.5">Photos</TabsTrigger>
            <TabsTrigger value="documents" className="py-2.5">Documents</TabsTrigger>
            <TabsTrigger value="updates" className="py-2.5">Updates</TabsTrigger>
            <TabsTrigger value="payments" className="py-2.5">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Status & Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-end">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={projectStatus} onValueChange={setProjectStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Progress (%)</label>
                    <Input 
                      type="number" 
                      min="0" max="100" 
                      value={projectProgress} 
                      onChange={(e) => setProjectProgress(Number(e.target.value))} 
                    />
                  </div>
                  <Button onClick={handleUpdateProject} disabled={updateProject.isPending}>
                    {updateProject.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMilestone} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-4">
                    <Input 
                      placeholder="Milestone Title" 
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      required
                    />
                    <Input 
                      placeholder="Description (Optional)" 
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={addMilestone.isPending}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {milestones?.sort((a, b) => a.order - b.order).map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4">
                      <div>
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                      </div>
                      <Button 
                        variant={milestone.completedAt ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleMarkMilestone(milestone.id, !milestone.completedAt)}
                        disabled={updateMilestone.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> 
                        {milestone.completedAt ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </div>
                  ))}
                  {milestones?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">No milestones added yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar forms for Photos, Documents, Updates, Payments ... */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPhoto} className="flex gap-4 items-start">
                  <div className="flex-1 space-y-4">
                    <Input 
                      placeholder="Image URL" 
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      required
                    />
                    <Input 
                      placeholder="Caption (Optional)" 
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={addPhoto.isPending}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos?.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={photo.url} alt={photo.caption || ''} className="object-cover w-full h-full" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Document Link</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDoc} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium">Document Name</label>
                    <Input 
                      required
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium">URL</label>
                    <Input 
                      required type="url"
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={addDocument.isPending}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="grid gap-2">
              {documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-card border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View</a>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Update</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <Textarea 
                    required
                    placeholder="Write an update for the client..."
                    value={newUpdateMsg}
                    onChange={(e) => setNewUpdateMsg(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button type="submit" disabled={addUpdate.isPending}>
                    Post Update
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              {updates?.map((update) => (
                <Card key={update.id}>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-2">
                      {format(new Date(update.postedAt), 'PPp')}
                    </div>
                    <p className="whitespace-pre-wrap">{update.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Payment Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPayment} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium">Description</label>
                    <Input required value={paymentLabel} onChange={(e) => setPaymentLabel(e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium">Amount</label>
                    <Input required type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={addPayment.isPending}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments?.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 font-medium">{payment.label}</td>
                        <td className="px-4 py-3">Rs. {payment.amount}</td>
                        <td className="px-4 py-3">{payment.status}</td>
                        <td className="px-4 py-3">
                          <Select 
                            value={payment.status} 
                            onValueChange={(val) => handleUpdatePaymentStatus(payment.id, val)}
                            disabled={updatePayment.isPending}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
