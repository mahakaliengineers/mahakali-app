import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      const isStaff = user.role === "admin" || user.role === "super_admin";
      setLocation(isStaff ? "/admin/projects" : "/dashboard");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return null;

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (loggedInUser) => {
          queryClient.setQueryData(getGetMeQueryKey(), loggedInUser);
          const isStaff = loggedInUser.role === "admin" || loggedInUser.role === "super_admin";
          setLocation(isStaff ? "/admin/projects" : "/dashboard");
        },
        onError: () => {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 bg-secondary text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888081622-12caa292849e?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-14 w-auto object-contain brightness-0 invert" />
            <div>
              <div className="text-xl font-bold text-white leading-tight">Mahakali Engineers</div>
              <div className="text-sm text-white/60">and Developers Pvt. Ltd.</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight max-w-sm">
            Your project. Our commitment.
          </h2>
          <p className="mt-4 text-white/70 max-w-sm text-base leading-relaxed">
            Track every milestone, document, and payment of your construction project — all in one secure place.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { label: "Real-time progress tracking" },
              { label: "Photo gallery & documents" },
              { label: "Payment & milestone status" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-white/80 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} Mahakali Engineers and Developers Pvt. Ltd., Chabahil-07, Kathmandu
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-10 w-auto object-contain" />
            <div>
              <div className="text-base font-bold leading-tight">Mahakali Engineers</div>
              <div className="text-xs text-muted-foreground">and Developers Pvt. Ltd.</div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Client Portal</h1>
            <p className="text-muted-foreground">Sign in to track your project progress</p>
          </div>

          <Card className="border shadow-sm">
            <CardContent className="pt-6 pb-8 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            autoComplete="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type="password"
                            autoComplete="current-password"
                            data-testid="input-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Secure client portal for Mahakali Engineers project tracking
          </p>
        </div>
      </div>
    </div>
  );
}
