import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListClients, useCreateClient, getListClientsQueryKey } from "@workspace/api-client-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  siteLocation: z.string().optional(),
  fiscalYear: z.string().optional(),
});

export default function AdminClients() {
  const { data: clients, isLoading } = useListClients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createClient = useCreateClient();

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", siteLocation: "", fiscalYear: "" },
  });

  const onSubmit = (values: z.infer<typeof clientSchema>) => {
    createClient.mutate(
      { data: values as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
          setIsDialogOpen(false);
          form.reset();
          toast({ title: "Client created", description: "The client account has been created successfully." });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create client.", variant: "destructive" });
        },
      }
    );
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Client</DialogTitle>
                <DialogDescription>Create an account for a new client to access the portal.</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Ram Bahadur Shrestha" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Login ID)</FormLabel>
                      <FormControl><Input placeholder="ram@example.com" type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+977 98XXXXXXXX" {...field} /></FormControl>
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
                  <FormField control={form.control} name="fiscalYear" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiscal Year (Nepali)</FormLabel>
                      <FormControl><Input placeholder="2082/083" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={createClient.isPending}>
                      {createClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Client Account
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
                  {client.clientCode && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-mono font-bold text-primary tracking-widest">
                        {client.clientCode}
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
