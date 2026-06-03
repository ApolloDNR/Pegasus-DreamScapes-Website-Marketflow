import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSupabaseAuth, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import type { UserRole } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowRight, Eye } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { signIn, isLoading, profile, enterGuestMode } = useSupabaseAuth();

  const handleGuestExplore = (role: UserRole) => {
    enterGuestMode(role);
    setLocation(getRoleDashboardPath(role));
  };
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "You've been signed in successfully.",
        });
        const dashboardPath = getRoleDashboardPath(profile?.primary_role ?? null);
        setLocation(dashboardPath);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 pt-24 pb-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-serif" data-testid="text-login-title">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to access your Pegasus Dreamscapes marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          data-testid="input-email"
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          data-testid="input-password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-login"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
              data-testid="link-signup"
            >
              Create one
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Want to explore first? Pick a preview role.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleGuestExplore("investor")}
                data-testid="button-explore-guest"
              >
                <Eye className="w-4 h-4 mr-2" />
                Investor
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGuestExplore("buyer_retail")}
                data-testid="button-explore-guest-buyer"
              >
                <Eye className="w-4 h-4 mr-2" />
                Buyer
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGuestExplore("wholesaler")}
                data-testid="button-explore-guest-wholesaler"
              >
                <Eye className="w-4 h-4 mr-2" />
                Wholesaler
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGuestExplore("dreamscaper")}
                data-testid="button-explore-guest-dreamscaper"
              >
                <Eye className="w-4 h-4 mr-2" />
                DreamScaper
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center mt-3">
              Preview only. Sample data. No real actions.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="link-home"
            >
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
