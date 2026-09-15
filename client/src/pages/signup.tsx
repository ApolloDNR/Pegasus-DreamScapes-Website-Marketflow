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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Building2, Home, DollarSign, Briefcase, CheckCircle2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum([
    "wholesaler",
    "dreamscaper",
    "investor",
    "buyer_retail",
    "buyer_investment",
  ] as const),
  acceptPolicies: z.boolean().refine((accepted) => accepted, {
    message: "Accept the Terms and Privacy Policy to create an account",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const roleOptions = [
  {
    value: "wholesaler",
    label: "Deal sourcing",
    description: "I am interested in sourcing or assigning opportunities",
    icon: Briefcase,
  },
  {
    value: "dreamscaper",
    label: "Renovation / operations",
    description: "I am interested in renovating or operating projects",
    icon: Building2,
  },
  {
    value: "investor",
    label: "Capital relationships",
    description: "I am interested in learning about private capital relationships",
    icon: DollarSign,
  },
  {
    value: "buyer_retail",
    label: "Home buying",
    description: "I am interested in licensed buyer-representation information",
    icon: Home,
  },
  {
    value: "buyer_investment",
    label: "Investment-property buying",
    description: "I am interested in investment-property buying information",
    icon: Building2,
  },
];

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { signUp, isLoading, enterGuestMode } = useSupabaseAuth();

  const handleGuestExplore = () => {
    enterGuestMode("investor");
    setLocation(getRoleDashboardPath("investor"));
  };
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "investor",
      acceptPolicies: false,
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(
        data.email,
        data.password,
        data.role as UserRole,
        data.displayName
      );

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message || "Could not create your account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Preview Account Created",
          description:
            "Please check your email to verify the account. MarketFlow access remains separate and invitation-led.",
        });
        setLocation("/marketflow");
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

  const handleNextStep = async () => {
    const isValid = await form.trigger(["role"]);
    if (isValid) {
      setStep(2);
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
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center">
          <h1
            className="text-3xl font-serif font-semibold leading-none tracking-tight"
            data-testid="text-signup-title"
          >
            Create a Pegasus preview account
          </h1>
          <CardDescription>
            {step === 1
              ? "Choose the interest that should shape your preview"
              : "Complete your general preview-account setup"}
          </CardDescription>

          <p className="text-sm text-muted-foreground leading-relaxed pt-2" data-testid="signup-access-boundary">
            Your selected role records declared interest. It does not verify or approve you,
            and it does not grant MarketFlow inventory access or submission privileges.
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : <span>1</span>}
              <span>Interest</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              <span>2</span>
              <span>Account</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="sr-only">Select your declared interest</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid gap-3"
                          >
                            {roleOptions.map((option) => {
                              const Icon = option.icon;
                              const isSelected = selectedRole === option.value;
                              return (
                                <Label
                                  key={option.value}
                                  htmlFor={option.value}
                                  className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors hover-elevate",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border"
                                  )}
                                  data-testid={`role-option-${option.value}`}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={option.value}
                                    className="sr-only"
                                  />
                                  <div
                                    className={cn(
                                      "flex items-center justify-center w-10 h-10 rounded-full",
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    )}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {option.description}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                  )}
                                </Label>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleNextStep}
                    data-testid="button-next-step"
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="John Smith"
                              className="pl-10"
                              data-testid="input-display-name"
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
                    name="acceptPolicies"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3 rounded-md border border-border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              data-testid="checkbox-signup-policies"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal leading-relaxed cursor-pointer">
                              I agree to the <Link href="/terms" className="underline underline-offset-2">Terms</Link>{" "}
                              and acknowledge the <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
                              Creating this account does not create MarketFlow approval or access.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

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
                              placeholder="Minimum 8 characters"
                              className="pl-10"
                              data-testid="input-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Use a strong password with letters, numbers, and symbols
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Confirm your password"
                              className="pl-10"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                      data-testid="button-signup"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Create Preview Account
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
              data-testid="link-login"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground text-center leading-relaxed">
            MarketFlow is a controlled, invitation-led pilot. A preview account does not
            provide approval, verification, private inventory, or submission privileges.
          </p>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Want to explore first?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGuestExplore}
              data-testid="button-explore-guest"
            >
              <Eye className="w-4 h-4 mr-2" />
              Explore as Guest
            </Button>
            <p className="text-[11px] text-muted-foreground/80 text-center mt-3">
              Preview only. Private-beta walkthrough. No real actions.
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
