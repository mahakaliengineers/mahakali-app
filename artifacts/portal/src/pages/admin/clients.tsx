import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useListClients, useCreateClient, useCreateProject,
  getListClientsQueryKey, getListProjectsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Mail, Phone, CalendarDays, MapPin, Hash } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const PROJECT_TYPES = ["Residential", "Commercial", "Industrial", "Renovation", "Interior", "Other"];

const clientSchema = z.object({
  // Client details
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  siteLocation: z.string().optional(),
  fiscalYear: z.string().optional(),
  clientNumber: z.string().optional(),
  // Project details
  projectTitle: z.string().min(2, "Project title is required"),
  projectType: z.string().optional(),
  projectDescription: z.string().optional(),
  projectStartDate: z.string().optional(),
});

export default function AdminClients() {
  const { data: clients, isLoading } = useListClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createClient = useCreateClient();
  const createProject = useCreateProject();

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "", email: "", phone: "", password: "",
      siteLocation: "", fiscalYear: "", clientNumber: "",
      projectTitle: "", projectType: "", projectDescription: "", projectStartDate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Create client
      const client = await new Promise<any>((resolve, reject) => {
        createClient.mutate(
          {
            data: {
              name: values.name,
              email: values.email,
              password: values.password,
              phone: values.phone,
              siteLocation: values.siteLocation,
              fiscalYear: values.fiscalYear,
              clientNumber: values.clientNumber,
            } as any,
          },
          { onSuccess: resolve, onError: reject }
        );
      });

      // 2. Auto-create project in Planning
      await new Promise<void>((resolve, reject) => {
        createProject.mutate(
          {
            data: {
              clientId: client.id,
              title: values.projectTitle,
              location: values.siteLocation || undefined,
              type: values.projectType || undefined,
              description: values.projectDescription || undefined,
              status: "planning",
              progress: 0,
              startDate: values.projectStartDate || undefined,
            },
          },
          { onSuccess: () => resolve(), onError: reject }
        );
      });

      queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Client & project created",
        description: `${values.name}'s account and project "${values.projectTitle}" are ready in Planning.`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to create client or project.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground mt-1">Manage client accounts and access.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Client</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
                <DialogDescription>
                  Fill in the client details and project info. A project will be automatically added to Planning.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">

                  {/* ── Client Details ── */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
                      Client Details
                    </p>
                    <div className="space-y-3">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Ram Bahadur Shrestha" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Login ID)</FormLabel>
                            <FormControl><Input placeholder="ram@example.com" type="email" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input placeholder="+977 98XXXXXXXX" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField control={form.control} name="clientNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client No.</FormLabel>
                            <FormControl><Input placeholder="345" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="fiscalYear" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiscal Year</FormLabel>
                            <FormControl><Input placeholder="2082/083" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="password" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Initial Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      {/* Live Client ID preview */}
                      {(form.watch("clientNumber") || form.watch("fiscalYear")) && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded bg-muted text-sm">
                          <span className="text-muted-foreground">Client ID preview:</span>
                          <span className="font-mono font-bold text-primary tracking-widest">
                            {String(form.watch("clientNumber") || "?").padStart(5, "0")}
                            {form.watch("fiscalYear") ? `-${form.watch("fiscalYear").replace("/", "")}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Project Details ── */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
                      Project Details
                    </p>
                    <div className="space-y-3">
                      <FormField control={form.control} name="projectTitle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Residential House — Chabahil" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField control={form.control} name="projectType" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROJECT_TYPES.map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="siteLocation" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Location</FormLabel>
                            <FormControl><Input placeholder="Chabahil, Kathmandu" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="projectStartDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="projectDescription" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief notes about the project scope..." rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Client & Project
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.map((client) => (
              <Card key={client.id}>
                <CardContent className="pt-5 pb-5">
                  {(client as any).clientCode && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-mono font-bold text-primary tracking-widest">
                        {(client as any).clientCode}
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg leading-tight">{client.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Mail className="h-3.5 w-3.5 mr-1.5 shrink-0" /> {client.email}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0" /> {client.phone}
                      </div>
                    )}
                    {(client as any).siteLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0" /> {(client as any).siteLocation}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0" />
                      Joined {format(new Date(client.createdAt), "dd MMM yyyy")}
                      {(client as any).fiscalYear && (
                        <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded font-medium">
                          FY {(client as any).fiscalYear}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {clients?.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-card">
                <p className="text-muted-foreground">No clients yet. Add your first client.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
