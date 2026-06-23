import { toast } from "@/hooks/use-toast";

export const notify = {
  success: (description: string, title = "Done") =>
    toast({ title, description, className: "border-l-4 border-green-500 bg-white" }),

  error: (description: string, title = "Something went wrong") =>
    toast({ title, description, variant: "destructive" }),

  info: (description: string, title = "Info") =>
    toast({ title, description, className: "border-l-4 border-blue-500 bg-white" }),

  warning: (description: string, title = "Warning") =>
    toast({ title, description, className: "border-l-4 border-yellow-500 bg-white" }),
};
