import { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/contexts/auth";
import {
  useListUsers, useCreateStaff, useUpdateUserRole,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Mail, ShieldCheck, Shield, UserCog } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "super_admin"]),
});

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  client: "Client",
};

function RoleBadge({ role }: { role: string }) {
  if (role === "super_admin") {
    return (
      <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold gap-1">
        <ShieldCheck className="h-3 w-3" />Super Admin
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Shield className="h-3 w-3" />Admin
    </Badge>
  );
}

export default function AdminStaff() {
  const { user: me } = useAuth();
  const { data: users, isLoading } = useListUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roleDialogUser, setRoleDialogUser] = useState<{ id: number; name: string; role: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStaff = useCreateStaff();
  const updateRole = useUpdateUserRole();

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "", password: "", role: "admin" },
  });

  const onCreateSubmit = (values: z.infer<typeof staffSchema>) => {
    createStaff.mutate(
      { data: values },
      {
        onSuccess: (created) => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          setIsCreateOpen(false);
          form.reset();
          toast({ title: "Staff account created", description: `${created.name} can now log in.` });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create staff account.", variant: "destructive" });
        },
      }
    );
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRole.mutate(
      { id: userId, data: { role: newRole as "client" | "admin" | "super_admin" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          setRoleDialogUser(null);
          toast({ title: "Role updated" });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
            <p className="text-muted-foreground mt-1">Manage admin and super admin accounts.</p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Staff</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Staff Account</DialogTitle>
                <DialogDescription>
                  Create a login for an admin or super admin team member.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4 pt-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Sunita Thapa" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Login)</FormLabel>
                      <FormControl><Input placeholder="sunita@mahakali.com.np" type="email" {...field} /></FormControl>
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
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin — can upload and add data</SelectItem>
                          <SelectItem value="super_admin">Super Admin — full control</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createStaff.isPending}>
                    {createStaff.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create Account"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["super_admin", "admin", "client"] as const).map((role) => (
            <Card key={role} className="border">
              <CardContent className="pt-5 pb-4">
                <p className="text-2xl font-bold">
                  {role === "client" ? "—" : (users?.filter((u) => u.role === role).length ?? "—")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{ROLE_LABELS[role]}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role === "super_admin" && "Approves content, manages all staff"}
                  {role === "admin" && "Uploads data, manages projects"}
                  {role === "client" && "Managed on the Clients page"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {users?.map((u) => (
              <Card key={u.id} className="border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{u.name}</p>
                          <RoleBadge role={u.role} />
                          {u.id === me?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />{u.email}
                        </p>
                        {u.createdAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Added {format(new Date(u.createdAt), "dd MMM yyyy")}
                          </p>
                        )}
                      </div>
                    </div>

                    {u.id !== me?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => setRoleDialogUser({ id: u.id, name: u.name, role: u.role })}
                      >
                        <UserCog className="h-4 w-4 mr-1.5" />Change Role
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {users?.length === 0 && (
              <div className="py-12 text-center border-2 border-dashed rounded-xl bg-card">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium">No staff accounts yet</h3>
                <p className="text-muted-foreground text-sm">Add your first admin team member above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Role Dialog */}
      {roleDialogUser && (
        <Dialog open={!!roleDialogUser} onOpenChange={() => setRoleDialogUser(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Change Role — {roleDialogUser.name}</DialogTitle>
              <DialogDescription>Select the new role for this staff member.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              {(["admin", "super_admin"] as const).map((role) => (
                <Button
                  key={role}
                  variant={roleDialogUser.role === role ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                  disabled={updateRole.isPending}
                  onClick={() => handleRoleChange(roleDialogUser.id, role)}
                >
                  {role === "super_admin" ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  {ROLE_LABELS[role]}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
