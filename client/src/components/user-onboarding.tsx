import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Target, 
  MapPin, 
  DollarSign,
  Building2,
  TrendingUp,
  Home,
  Wrench,
  Users,
  Award,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  displayName: string;
  role: string;
  investmentStyle: string;
  preferredPropertyTypes: string[];
  preferredStrategies: string[];
  targetROI: number;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  experience: string;
  goals: string[];
}

const defaultData: OnboardingData = {
  displayName: "",
  role: "",
  investmentStyle: "moderate",
  preferredPropertyTypes: [],
  preferredStrategies: [],
  targetROI: 15,
  budgetMin: 50000,
  budgetMax: 500000,
  preferredLocations: [],
  experience: "beginner",
  goals: [],
};

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  initialData?: Partial<OnboardingData>;
}

export function OnboardingFlow({ isOpen, onComplete, initialData }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({ ...defaultData, ...initialData });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const saveMutation = useMutation({
    mutationFn: async (profileData: OnboardingData) => {
      return apiRequest("POST", "/api/user/onboarding", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Profile complete!",
        description: "Your preferences have been saved",
      });
      onComplete();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      saveMutation.mutate(data);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.displayName.length >= 2;
      case 1:
        return !!data.role;
      case 2:
        return data.preferredPropertyTypes.length > 0;
      case 3:
        return data.preferredStrategies.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <DialogTitle>Welcome to MarketFlow</DialogTitle>
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </DialogHeader>

        <div className="py-4">
          {step === 0 && (
            <StepProfile data={data} onChange={updateData} />
          )}
          {step === 1 && (
            <StepRole data={data} onChange={updateData} />
          )}
          {step === 2 && (
            <StepPropertyTypes data={data} onChange={updateData} />
          )}
          {step === 3 && (
            <StepStrategies data={data} onChange={updateData} />
          )}
          {step === 4 && (
            <StepGoals data={data} onChange={updateData} />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            data-testid="button-onboarding-back"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saveMutation.isPending}
            data-testid="button-onboarding-next"
          >
            {step === totalSteps - 1 ? (
              <>
                Complete Setup
                <Check className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepProfile({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold">Let's get started</h3>
        <p className="text-muted-foreground">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">What should we call you?</Label>
          <Input
            id="displayName"
            placeholder="Your name or nickname"
            value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            data-testid="input-display-name"
          />
        </div>

        <div className="space-y-2">
          <Label>How experienced are you with real estate investing?</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "beginner", label: "Beginner", desc: "Just starting out" },
              { value: "intermediate", label: "Intermediate", desc: "A few deals done" },
              { value: "expert", label: "Expert", desc: "Many deals completed" },
            ].map((option) => (
              <button
                key={option.value}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  data.experience === option.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => onChange({ experience: option.value })}
                data-testid={`button-experience-${option.value}`}
              >
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepRole({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const roles = [
    { value: "investor", label: "Investor", icon: DollarSign, desc: "Looking to invest in deals" },
    { value: "wholesaler", label: "Wholesaler", icon: Users, desc: "Finding and assigning deals" },
    { value: "dreamscaper", label: "Dreamscaper", icon: Sparkles, desc: "Transforming properties" },
    { value: "buyer", label: "Buyer", icon: Home, desc: "Looking to purchase property" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-12 h-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold">What's your role?</h3>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            className={`p-4 rounded-lg border text-left transition-all ${
              data.role === role.value
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onChange({ role: role.value })}
            data-testid={`button-role-${role.value}`}
          >
            <role.icon className="w-6 h-6 text-primary mb-2" />
            <p className="font-medium">{role.label}</p>
            <p className="text-xs text-muted-foreground">{role.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPropertyTypes({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const types = [
    { value: "single_family", label: "Single Family", icon: Home },
    { value: "multi_family", label: "Multi-Family", icon: Building2 },
    { value: "commercial", label: "Commercial", icon: Building2 },
    { value: "land", label: "Land", icon: MapPin },
    { value: "mobile_home", label: "Mobile Home", icon: Home },
    { value: "mixed_use", label: "Mixed Use", icon: Building2 },
  ];

  const toggleType = (type: string) => {
    const current = data.preferredPropertyTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({ preferredPropertyTypes: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="w-12 h-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold">Property preferences</h3>
        <p className="text-muted-foreground">
          Select the property types you're interested in
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {types.map((type) => {
          const isSelected = data.preferredPropertyTypes.includes(type.value);
          return (
            <button
              key={type.value}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => toggleType(type.value)}
              data-testid={`button-type-${type.value}`}
            >
              <div className={`p-2 rounded ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
                <type.icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">{type.label}</span>
              {isSelected && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepStrategies({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const strategies = [
    { value: "flip", label: "Fix & Flip", desc: "Buy, renovate, sell", icon: Wrench },
    { value: "rental", label: "Buy & Hold", desc: "Long-term rental income", icon: DollarSign },
    { value: "brrrr", label: "BRRRR", desc: "Buy, Rehab, Rent, Refinance, Repeat", icon: TrendingUp },
    { value: "wholesale", label: "Wholesale", desc: "Contract assignment", icon: Users },
  ];

  const toggleStrategy = (strategy: string) => {
    const current = data.preferredStrategies;
    const updated = current.includes(strategy)
      ? current.filter((s) => s !== strategy)
      : [...current, strategy];
    onChange({ preferredStrategies: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold">Investment strategies</h3>
        <p className="text-muted-foreground">
          Which strategies are you interested in?
        </p>
      </div>

      <div className="space-y-3">
        {strategies.map((strategy) => {
          const isSelected = data.preferredStrategies.includes(strategy.value);
          return (
            <button
              key={strategy.value}
              className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => toggleStrategy(strategy.value)}
              data-testid={`button-strategy-${strategy.value}`}
            >
              <div className={`p-2 rounded ${isSelected ? "bg-primary text-white" : "bg-muted"}`}>
                <strategy.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{strategy.label}</p>
                <p className="text-xs text-muted-foreground">{strategy.desc}</p>
              </div>
              {isSelected && <Check className="w-5 h-5 text-primary" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Target ROI</Label>
            <span className="text-sm font-medium">{data.targetROI}%+</span>
          </div>
          <Slider
            value={[data.targetROI]}
            onValueChange={([v]) => onChange({ targetROI: v })}
            min={5}
            max={50}
            step={5}
            data-testid="slider-target-roi"
          />
        </div>
      </div>
    </div>
  );
}

function StepGoals({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (updates: Partial<OnboardingData>) => void;
}) {
  const goals = [
    { value: "passive_income", label: "Generate passive income" },
    { value: "build_wealth", label: "Build long-term wealth" },
    { value: "quick_profits", label: "Make quick profits" },
    { value: "diversify", label: "Diversify investments" },
    { value: "learn", label: "Learn real estate investing" },
    { value: "network", label: "Connect with other investors" },
  ];

  const toggleGoal = (goal: string) => {
    const current = data.goals;
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    onChange({ goals: updated });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Award className="w-12 h-12 mx-auto text-primary mb-3" />
        <h3 className="text-lg font-semibold">What are your goals?</h3>
        <p className="text-muted-foreground">
          Select all that apply - this helps us recommend relevant deals
        </p>
      </div>

      <div className="space-y-2">
        {goals.map((goal) => {
          const isSelected = data.goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => toggleGoal(goal.value)}
              data-testid={`button-goal-${goal.value}`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                isSelected ? "bg-primary border-primary" : "border-muted-foreground"
              }`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{goal.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium text-sm">You're all set!</p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll use your preferences to show you the most relevant deals and opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed");
    setNeedsOnboarding(!completed);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setNeedsOnboarding(false);
  };

  return { needsOnboarding, completeOnboarding };
}
