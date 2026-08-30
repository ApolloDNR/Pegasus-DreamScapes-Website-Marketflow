import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
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
import {
  inspectPasswordRecoveryLocation,
  isExpiredPasswordRecoveryError,
  passwordUpdateErrorMessage,
} from "@/lib/password-recovery";
import { getSupabase } from "@/lib/supabase";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type ResetState = "checking" | "ready" | "expired" | "invalid" | "success";

export default function ResetPasswordPage() {
  const search = useSearch();
  const returnTo = getReturnToFromSearch(search);
  const linkState = useMemo(
    () =>
      inspectPasswordRecoveryLocation(
        search,
        typeof window === "undefined" ? "" : window.location.hash,
      ),
    [search],
  );
  const [resetState, setResetState] = useState<ResetState>(
    linkState.kind === "candidate" ? "checking" : linkState.kind,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useSEO({
    title: "Choose a New Password",
    description: "Complete a secure password reset for your Pegasus Dreamscapes account.",
    noIndex: true,
    noCanonical: true,
  });

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (linkState.kind !== "candidate") {
      setResetState(linkState.kind);
      return;
    }

    setResetState("checking");

    let active = true;
    let recoveryEventObserved = false;
    let unsubscribe = () => {};

    const verifyRecoverySession = async () => {
      try {
        const supabase = await getSupabase();
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" && session?.user) {
            recoveryEventObserved = true;
            if (active) setResetState("ready");
          }
        });
        if (!active) {
          data.subscription.unsubscribe();
          return;
        }
        unsubscribe = () => data.subscription.unsubscribe();

        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!active || recoveryEventObserved) return;

        if (error || !sessionData.session?.user) {
          setResetState("expired");
          return;
        }

        // A valid recovery callback authenticates a short-lived session. The
        // URL signal is required so an ordinary signed-in visit cannot use
        // this recovery-only surface as a general account-settings page.
        setResetState("ready");
      } catch {
        if (active) setResetState("invalid");
      }
    };

    void verifyRecoverySession();
    return () => {
      active = false;
      unsubscribe();
    };
  }, [linkState.kind, search]);

  const onSubmit = async ({ password }: ResetPasswordFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        if (isExpiredPasswordRecoveryError(error)) {
          setResetState("expired");
        } else {
          setSubmitError(passwordUpdateErrorMessage(error));
        }
        return;
      }

      // End the temporary recovery session. A fresh sign-in proves the new
      // password works and avoids leaving a recovery-authenticated tab open.
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      setResetState("success");
      form.reset();
    } catch (error) {
      if (isExpiredPasswordRecoveryError(error)) {
        setResetState("expired");
      } else {
        setSubmitError("We couldn't reach the authentication service. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resetState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
        <div className="text-center" role="status" data-testid="password-reset-checking">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Checking your reset link…</p>
        </div>
      </div>
    );
  }

  if (resetState === "expired" || resetState === "invalid") {
    const expired = resetState === "expired";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" aria-hidden="true" />
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              {expired ? "Reset link expired" : "Reset link unavailable"}
            </h1>
            <CardDescription>
              {expired
                ? "This reset link is no longer valid. Request a new link to continue."
                : "Open the password-reset link from your email, or request a new one."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link
                href={withReturnTo("/forgot-password", returnTo)}
                data-testid="link-request-new-reset"
              >
                Request a new link
              </Link>
            </Button>
            <Link
              href={withReturnTo("/login", returnTo)}
              className="block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Return to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 pt-24 pb-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" aria-hidden="true" />
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Password updated
            </h1>
            <CardDescription>
              Your password has been changed. Sign in again with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link
                href={withReturnTo("/login", returnTo)}
                data-testid="link-login-after-reset"
              >
                Continue to sign in
              </Link>
            </Button>
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
            Choose a new password
          </h1>
          <CardDescription>
            Use at least 8 characters and choose a password you don't reuse elsewhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className="pl-10"
                          data-testid="input-new-password"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm new password</FormLabel>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className="pl-10"
                          data-testid="input-confirm-new-password"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-update-password"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                )}
                {isSubmitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
