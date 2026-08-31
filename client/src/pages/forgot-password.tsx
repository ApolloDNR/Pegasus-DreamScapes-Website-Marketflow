import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/use-seo";
import { getReturnToFromSearch, withReturnTo } from "@/lib/auth-return";
import { buildPasswordRecoveryRedirect } from "@/lib/password-recovery";
import { getSupabase } from "@/lib/supabase";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const search = useSearch();
  const returnTo = getReturnToFromSearch(search);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useSEO({
    title: "Reset Password",
    description: "Request a secure password-reset link for your Pegasus Dreamscapes account.",
    noIndex: true,
    noCanonical: true,
  });

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = await getSupabase();
      const redirectTo = buildPasswordRecoveryRedirect(
        window.location.origin,
        returnTo,
      );
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setSubmitError(
          "We couldn't send a reset email. Check your connection or wait before trying again.",
        );
        return;
      }

      // Supabase intentionally returns the same outcome whether or not an
      // account exists. Keep that privacy boundary in our own UI copy too.
      setSubmittedEmail(email.trim());
    } catch {
      setSubmitError(
        "We couldn't reach the authentication service. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <CheckCircle2
              className="h-10 w-10 text-primary mx-auto"
              aria-hidden="true"
            />
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Check your email
            </h1>
            <CardDescription className="leading-relaxed">
              If an account exists for {submittedEmail}, we sent a password-reset
              link. Check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setSubmittedEmail(null)}
              data-testid="button-use-different-email"
            >
              Use a different email
            </Button>
            <Link
              href={withReturnTo("/login", returnTo)}
              className="block text-center text-sm text-primary hover:underline font-medium"
              data-testid="link-return-login"
            >
              Return to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 pt-24 pb-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <h1 className="text-3xl font-serif font-semibold tracking-tight">
            Reset your password
          </h1>
          <CardDescription>
            Enter your account email and we'll send reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          data-testid="input-recovery-email"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p
                  className="text-sm text-destructive"
                  role="alert"
                  data-testid="text-recovery-error"
                >
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-send-reset-link"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                )}
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          </Form>

          <Link
            href={withReturnTo("/login", returnTo)}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-back-login"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
