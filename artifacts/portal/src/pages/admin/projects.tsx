import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/auth";
import {
  useListProjects, useListPending, useApprovePhoto, useApproveDocument,
  useDeletePhoto, useDeleteDocument,
  getListPendingQueryKey, getListPhotosQueryKey, getListDocumentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, Plus, ArrowRight, ChevronDown, ChevronRight,
  FolderOpen, Folder, Image as ImageIcon, FileText, ShieldCheck, Trash2, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Status = "planning" | "active" | "on_hold" | "completed";

const FOLDERS: { status: Status; label: string; color: string; badgeClass: string }[] = [
  { status: "planning",  label: "Planning",  color: "text-blue-600",  badgeClass: "bg-blue-100 text-blue-700 border-blue-200" },
  { status: "active",    label: "Active",    color: "text-green-600", badgeClass: "bg-green-100 text-green-700 border-green-200" },
  { status: "on_hold",   label: "On Hold",   color: "text-amber-600", badgeClass: "bg-amber-100 text-amber-700 border-amber-200" },
  { status: "completed", label: "Completed", color: "text-gray-500",  badgeClass: "bg-gray-100 text-gray-600 border-gray-200" },
];

export default function AdminProjects() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const { data: projects, isLoading } = useListProjects();
  const { data: pending } = useListPending({ query: { enabled: isSuperAdmin, queryKey: getListPendingQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approvePhoto = useApprovePhoto();
  const approveDocument = useApproveDocument();
  const deletePhoto = useDeletePhoto();
  const deleteDocument = useDeleteDocument();

  const [open, setOpen] = useState<Record<Status, boolean>>({
    planning: true, active: true, on_hold: true, completed: false,
  });
  const toggle = (s: Status) => setOpen(prev => ({ ...prev, [s]: !prev[s] }));
  const byStatus = (status: Status) => (projects ?? []).filter(p => p.status === status);

  const totalPending = (pending?.photos.length ?? 0) + (pending?.documents.length ?? 0);

  const handleApprovePhoto = (photoId: number, projectId: number) => {
    approvePhoto.mutate({ id: photoId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey(projectId) });
        toast({ title: "Photo approved — now visible to client" });
      },
    });
  };

  const handleDeletePhoto = (photoId: number, projectId: number) => {
    deletePhoto.mutate({ id: photoId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey(projectId) });
        toast({ title: "Photo deleted" });
      },
    });
  };

  const handleApproveDoc = (docId: number, projectId: number) => {
    approveDocument.mutate({ id: docId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(projectId) });
        toast({ title: "Document approved — now visible to client" });
      },
    });
  };

  const handleDeleteDoc = (docId: number, projectId: number) => {
    deleteDocument.mutate({ id: docId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPendingQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(projectId) });
        toast({ title: "Document deleted" });
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and track all client construction projects.</p>
          </div>
          <Link href="/admin/projects/new">
            <Button><Plus className="h-4 w-4 mr-2" /> New Project</Button>
          </Link>
        </div>

        {/* ── Pending Approvals panel (super admin only) ── */}
        {isSuperAdmin && totalPending > 0 && (
          <Card className="border-amber-300 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
                Pending Approvals
                <Badge className="bg-amber-500 text-white ml-1">{totalPending}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending Photos */}
              {(pending?.photos.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Photos ({pending!.photos.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pending!.photos.map(photo => (
                      <div key={photo.id} className="border rounded-lg overflow-hidden bg-white">
                        <div className="aspect-[4/3] relative">
                          <img src={photo.url} alt={photo.caption || ''} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Photo'; }} />
                        </div>
                        <div className="p-2 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span className="font-medium">{photo.uploaderName ?? "Unknown"}</span>
                            <span>·</span>
                            <Link href={`/admin/projects/${photo.projectId}/manage`} className="text-primary hover:underline truncate">
                              {photo.projectTitle}
                            </Link>
                          </div>
                          {photo.caption && <p className="text-xs text-muted-foreground truncate">{photo.caption}</p>}
                          <p className="text-xs text-muted-foreground">{format(new Date(photo.uploadedAt), 'dd MMM yyyy')}</p>
                          <div className="flex gap-1.5 pt-0.5">
                            <Button size="sm" className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApprovePhoto(photo.id, photo.projectId)} disabled={approvePhoto.isPending}>
                              <ShieldCheck className="h-3.5 w-3.5 mr-1" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => handleDeletePhoto(photo.id, photo.projectId)} disabled={deletePhoto.isPending}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Documents */}
              {(pending?.documents.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Documents ({pending!.documents.length})
                  </p>
                  <div className="space-y-2">
                    {pending!.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.uploaderName ?? "Unknown"} ·{" "}
                              <Link href={`/admin/projects/${doc.projectId}/manage`} className="text-primary hover:underline">
                                {doc.projectTitle}
                              </Link>
                              {" "}· {format(new Date(doc.uploadedAt), 'dd MMM yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline hidden sm:block">View</a>
                          <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700" onClick={() => handleApproveDoc(doc.id, doc.projectId)} disabled={approveDocument.isPending}>
                            <ShieldCheck className="h-3.5 w-3.5 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => handleDeleteDoc(doc.id, doc.projectId)} disabled={deleteDocument.isPending}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── No pending indicator ── */}
        {isSuperAdmin && totalPending === 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            No pending approvals — all content is reviewed.
          </div>
        )}

        {/* ── Project folders ── */}
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
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                                {project.clientName && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />{project.clientName}
                                  </span>
                                )}
                                {project.location && <span>· {project.location}</span>}
                                {project.type && <span>· {project.type}</span>}
                              </div>
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
