import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { ScrollReveal, FadeIn } from "@/components/animations";
import { PropertyMap } from "@/components/property-map";
import type { CapitalProject } from "@shared/schema";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  Target,
  Percent,
  Users,
  Briefcase,
  FileText,
  Download,
  Send,
  AlertCircle,
  Shield,
  BarChart3,
  Wallet,
  ArrowRight,
  Home,
  Hammer
} from "lucide-react";

export default function MarketplaceCapitalDetail() {
  return (
    <AuthGuard requiredRoles={["investor", "admin", "dreamscaper", "pegasus_dreamscaper"]}>
      <MarketplaceLayout>
        <CapitalDetailPage />
      </MarketplaceLayout>
    </AuthGuard>
  );
}

function CapitalDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const { trackProjectView } = useAnalytics();

  const { data: project, isLoading, error } = useQuery<CapitalProject>({
    queryKey: ['/api/supabase/capital-projects', projectId],
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project?.id) {
      trackProjectView(typeof project.id === 'string' ? parseInt(project.id) : project.id);
    }
  }, [project?.id, trackProjectView]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The capital opportunity you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/marketflow/capital">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Opportunities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fundingProgress = project.fundingGoal ? 
    Math.min(100, ((project.amountRaised || 0) / project.fundingGoal) * 100) : 0;
  const isFunded = project.status === "FUNDED";
  const amountRemaining = (project.fundingGoal || 0) - (project.amountRaised || 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/marketflow/capital">
          <Button variant="ghost" size="sm" data-testid="button-back-to-capital">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScrollReveal>
            <Card data-testid="card-project-header">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <StructureBadge structure={project.structure} />
                  <StatusBadge status={project.status} />
                  {project.propertyType && (
                    <Badge variant="outline">
                      <Building2 className="w-3 h-3 mr-1" />
                      {project.propertyType.replace("-", " ")}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl" data-testid="text-project-title">
                  {project.title}
                </CardTitle>
                {project.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed" data-testid="text-project-description">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          {project.location && (
            <PropertyMap
              address={project.location}
              showCard={true}
              title="Project Location"
              height="300px"
              data-testid="project-map"
            />
          )}

          <ScrollReveal delay={0.1}>
            <Card data-testid="card-funding-progress">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Funding Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-3xl font-bold text-primary">
                        ${((project.amountRaised || 0) / 1000).toFixed(0)}K
                      </span>
                      <span className="text-lg text-muted-foreground ml-1">raised</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">
                        ${((project.fundingGoal || 0) / 1000).toFixed(0)}K
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">goal</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Progress Bar with Milestones */}
                  <div className="relative">
                    <Progress value={fundingProgress} className="h-4" />
                    {/* Milestone markers below progress bar */}
                    <div className="flex justify-between mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">0%</span>
                      <span className={`text-[10px] ${fundingProgress >= 25 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>25%</span>
                      <span className={`text-[10px] ${fundingProgress >= 50 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>50%</span>
                      <span className={`text-[10px] ${fundingProgress >= 75 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>75%</span>
                      <span className={`text-[10px] ${fundingProgress >= 100 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>100%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 text-sm">
                    <Badge 
                      variant={isFunded ? "default" : "secondary"} 
                      className={isFunded ? "bg-green-600" : ""}
                    >
                      {fundingProgress.toFixed(0)}% funded
                    </Badge>
                    {!isFunded && (
                      <span className="font-medium text-muted-foreground">
                        ${(amountRemaining / 1000).toFixed(0)}K remaining to goal
                      </span>
                    )}
                    {isFunded && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Fully Funded
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Min Investment</p>
                    <p className="font-semibold">${((project.minInvestment || 0) / 1000).toFixed(0)}K</p>
                  </div>
                  {project.maxInvestmentPerInvestor && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Max Investment</p>
                      <p className="font-semibold">${(project.maxInvestmentPerInvestor / 1000).toFixed(0)}K</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Projected Return</p>
                    <p className="font-semibold text-green-600">{project.projectedReturn || "15-20%"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Hold Period</p>
                    <p className="font-semibold">{project.holdPeriod || "12-18 months"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <Card data-testid="card-investment-terms">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Investment Terms
                </CardTitle>
                <CardDescription>
                  Operator's proposed terms for this capital raise
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.structure?.toUpperCase() === "DEBT" || project.structure?.toUpperCase() === "HYBRID" ? (
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Debt Terms
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {project.askingInterestRate && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                          <p className="font-semibold text-blue-600">{project.askingInterestRate}</p>
                        </div>
                      )}
                      {project.askingLoanDuration && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Loan Duration</p>
                          <p className="font-semibold text-blue-600">{project.askingLoanDuration}</p>
                        </div>
                      )}
                      {project.askingPoints && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Points</p>
                          <p className="font-semibold text-blue-600">{project.askingPoints}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {project.structure?.toUpperCase() === "EQUITY" || project.structure?.toUpperCase() === "HYBRID" ? (
                  <div className={`space-y-4 ${project.structure?.toUpperCase() === "HYBRID" ? "mt-6 pt-6 border-t" : ""}`}>
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Equity Terms
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {project.askingEquityPercent && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Equity Offered</p>
                          <p className="font-semibold text-green-600">{project.askingEquityPercent}%</p>
                        </div>
                      )}
                      {project.askingProfitSplit && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Profit Split</p>
                          <p className="font-semibold text-green-600">{project.askingProfitSplit}</p>
                        </div>
                      )}
                      {project.askingPreferredReturn && (
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                          <p className="text-xs text-muted-foreground mb-1">Preferred Return</p>
                          <p className="font-semibold text-green-600">{project.askingPreferredReturn}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {!project.askingInterestRate && !project.askingEquityPercent && !project.askingProfitSplit && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Detailed terms available upon request</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {project.scopeOfWork && (
            <ScrollReveal delay={0.2}>
              <Card data-testid="card-scope-of-work">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hammer className="w-5 h-5 text-primary" />
                    Scope of Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {project.scopeOfWork}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

          {(project.purchasePrice || project.rehabBudget || project.projectedARV) && (
            <ScrollReveal delay={0.25}>
              <Card data-testid="card-capital-stack">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Capital Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {project.purchasePrice && (
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Purchase Price</p>
                        <p className="font-semibold">${(project.purchasePrice / 1000).toFixed(0)}K</p>
                      </div>
                    )}
                    {project.rehabBudget && (
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Rehab Budget</p>
                        <p className="font-semibold">${(project.rehabBudget / 1000).toFixed(0)}K</p>
                      </div>
                    )}
                    {project.softCosts && (
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Soft Costs</p>
                        <p className="font-semibold">${(project.softCosts / 1000).toFixed(0)}K</p>
                      </div>
                    )}
                    {project.projectedARV && (
                      <div className="text-center p-3 rounded-lg bg-green-500/10">
                        <p className="text-xs text-muted-foreground mb-1">Projected ARV</p>
                        <p className="font-semibold text-green-600">${(project.projectedARV / 1000).toFixed(0)}K</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}
        </div>

        <div className="space-y-6">
          <ScrollReveal delay={0.1}>
            <Card className="sticky top-6 border-2 border-primary/20" data-testid="card-invest-action">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  Invest in This Project
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Seeking</p>
                  <p className="text-2xl font-bold text-primary">
                    ${((project.fundingGoal || 0) / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {project.structure} Structure | Min ${((project.minInvestment || 0) / 1000).toFixed(0)}K
                  </p>
                </div>

                {isFunded ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-600">Fully Funded</p>
                    <p className="text-sm text-muted-foreground">This opportunity is no longer accepting investments</p>
                  </div>
                ) : (
                  <>
                    <Dialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          size="lg" 
                          data-testid="button-commit-capital"
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Express Interest
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <CommitCapitalForm 
                          project={project} 
                          onClose={() => setIsCommitDialogOpen(false)} 
                        />
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full" data-testid="button-save-project">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save for Later
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card data-testid="card-operator-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Operator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Hammer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Dreamscaper</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span>4.8 rating</span>
                      <span className="mx-1">|</span>
                      <span>12 deals</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Identity Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-primary" />
                    <span>Pegasus Certified</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Background Checked</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" data-testid="button-view-operator">
                  View Full Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Card data-testid="card-documents">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="button-download-pitch">
                  <Download className="w-4 h-4 mr-2" />
                  Investment Pitch Deck
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-download-proforma">
                  <Download className="w-4 h-4 mr-2" />
                  Financial Pro Forma
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-download-agreement">
                  <Download className="w-4 h-4 mr-2" />
                  Investment Agreement
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Documents available after expressing interest
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

function CommitCapitalForm({ project, onClose }: { project: CapitalProject; onClose: () => void }) {
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const [amount, setAmount] = useState("");
  const [structurePreference, setStructurePreference] = useState(project.structure || "EQUITY");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) < (project.minInvestment || 0)) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is $${((project.minInvestment || 0) / 1000).toFixed(0)}K`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/marketplace/investment-interest", {
        projectId: project.id,
        amount: Number(amount),
        structurePreference,
        notes,
      });

      toast({
        title: "Interest Submitted",
        description: "The operator will review your interest and reach out soon.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to submit interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Express Investment Interest</DialogTitle>
        <DialogDescription>
          Submit your interest in {project.title}. The operator will review and contact you with next steps.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium">{project.title}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Structure:</span>
            <span className="font-medium">{project.structure}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Min Investment:</span>
            <span className="font-medium">${((project.minInvestment || 0) / 1000).toFixed(0)}K</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Investment Amount ($)</label>
          <Input
            type="number"
            placeholder={`Minimum ${(project.minInvestment || 0).toLocaleString()}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid="input-investment-amount"
          />
        </div>

        {project.structure === "HYBRID" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Structure Preference</label>
            <Select value={structurePreference} onValueChange={setStructurePreference}>
              <SelectTrigger data-testid="select-structure-preference">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBT">Debt (Fixed Returns)</SelectItem>
                <SelectItem value="EQUITY">Equity (Profit Share)</SelectItem>
                <SelectItem value="HYBRID">Hybrid (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            placeholder="Any questions or specific terms you'd like to discuss..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            data-testid="textarea-investment-notes"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} data-testid="button-cancel-interest">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-submit-interest">
          {isSubmitting ? "Submitting..." : "Submit Interest"}
        </Button>
      </DialogFooter>
    </>
  );
}

function StructureBadge({ structure }: { structure: string | null }) {
  const getColor = () => {
    switch (structure?.toUpperCase()) {
      case "EQUITY":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "DEBT":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "HYBRID":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Badge variant="outline" className={getColor()}>
      {structure || "Equity"}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "FUNDED") {
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Funded
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
      <Target className="w-3 h-3 mr-1" />
      Open for Investment
    </Badge>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
