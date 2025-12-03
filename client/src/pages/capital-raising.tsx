import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalHeader } from "@/components/portal-header";
import { AnnouncementsBanner } from "@/components/announcements-banner";
import { 
  TrendingUp, 
  Loader2,
  DollarSign,
  Building2,
  Clock,
  Target,
  MapPin,
  LogIn,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Percent,
  Users,
  Milestone
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CapitalProject, ProjectMilestone, InvestmentOffer, CommittedInvestment } from "@shared/schema";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-slate-100", text: "text-slate-700" },
  OPEN_FOR_INVESTMENT: { bg: "bg-green-100", text: "text-green-700" },
  FUNDED: { bg: "bg-blue-100", text: "text-blue-700" },
  IN_PROGRESS: { bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

const OFFER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { bg: "bg-green-100", text: "text-green-700" },
  DECLINED: { bg: "bg-red-100", text: "text-red-700" },
  COUNTERED: { bg: "bg-blue-100", text: "text-blue-700" },
};

export default function CapitalRaising() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [selectedProject, setSelectedProject] = useState<CapitalProject | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery<CapitalProject[]>({
    queryKey: ["/api/capital-projects"],
    enabled: isAuthenticated,
  });

  const { data: myOffers = [] } = useQuery<InvestmentOffer[]>({
    queryKey: ["/api/my-investment-offers"],
    enabled: isAuthenticated,
  });

  const { data: myCommitments = [] } = useQuery<CommittedInvestment[]>({
    queryKey: ["/api/my-committed-investments"],
    enabled: isAuthenticated,
  });

  const activeProjects = projects.filter(p => p.status === "OPEN_FOR_INVESTMENT");
  const fundedProjects = projects.filter(p => ["FUNDED", "IN_PROGRESS", "COMPLETED"].includes(p.status));

  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Capital Raising</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access exclusive investment opportunities and submit investment offers.
          </p>
          <a href="/api/login?returnTo=/capital-raising">
            <Button size="lg" data-testid="button-capital-login">
              <LogIn className="mr-2 w-5 h-5" />
              Sign In to Continue
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-stone">
      <AnnouncementsBanner audience="INVESTORS" />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-capital-title">
              Capital Raising
            </h1>
            <p className="text-muted-foreground">
              Explore investment opportunities and track your investments
            </p>
          </div>
          <PortalHeader currentPortal="investor" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="opportunities" data-testid="tab-opportunities">
              <Building2 className="w-4 h-4 mr-2" />
              Investment Opportunities
            </TabsTrigger>
            <TabsTrigger value="my-offers" data-testid="tab-my-offers">
              <FileText className="w-4 h-4 mr-2" />
              My Offers
              {myOffers.filter(o => o.status === "PENDING").length > 0 && (
                <Badge className="ml-2 bg-amber-500">{myOffers.filter(o => o.status === "PENDING").length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="my-investments" data-testid="tab-my-investments">
              <DollarSign className="w-4 h-4 mr-2" />
              My Investments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities">
            <OpportunitiesTab 
              projects={activeProjects} 
              isLoading={projectsLoading}
              onSelectProject={(project) => {
                setSelectedProject(project);
                setOfferDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="my-offers">
            <MyOffersTab offers={myOffers} projects={projects} />
          </TabsContent>

          <TabsContent value="my-investments">
            <MyInvestmentsTab commitments={myCommitments} projects={projects} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedProject && (
        <OfferDialog 
          project={selectedProject}
          open={offerDialogOpen}
          onClose={() => {
            setOfferDialogOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

function OpportunitiesTab({ 
  projects, 
  isLoading, 
  onSelectProject 
}: { 
  projects: CapitalProject[];
  isLoading: boolean;
  onSelectProject: (project: CapitalProject) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Open Opportunities</h3>
          <p className="text-muted-foreground">
            There are currently no projects open for investment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onInvest={() => onSelectProject(project)}
        />
      ))}
    </div>
  );
}

function ProjectCard({ 
  project, 
  onInvest 
}: { 
  project: CapitalProject;
  onInvest: () => void;
}) {
  const progress = project.fundingGoal > 0 
    ? ((project.amountRaised || 0) / project.fundingGoal) * 100 
    : 0;

  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES.DRAFT;

  return (
    <Card className="flex flex-col" data-testid={`card-project-${project.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
            {project.status.replace(/_/g, " ")}
          </Badge>
        </div>
        {project.location && (
          <CardDescription className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">
              {formatCurrency(project.amountRaised || 0)} / {formatCurrency(project.fundingGoal)}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="font-semibold">{formatCurrency(project.minInvestment)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Structure</p>
            <p className="font-semibold">{project.structure}</p>
          </div>
          {project.projectedReturn && (
            <div>
              <p className="text-xs text-muted-foreground">Projected Return</p>
              <p className="font-semibold text-green-600">{project.projectedReturn}</p>
            </div>
          )}
          {project.holdPeriod && (
            <div>
              <p className="text-xs text-muted-foreground">Hold Period</p>
              <p className="font-semibold">{project.holdPeriod}</p>
            </div>
          )}
        </div>

        {/* Operator Seeking Terms */}
        <div className="pt-3 mt-3 border-t border-dashed">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" />
            Operator Seeking
          </p>
          <div className="flex flex-wrap gap-2">
            {project.structure === "DEBT" && project.askingInterestRate && (
              <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-700">
                <Percent className="w-3 h-3 mr-1" />
                {project.askingInterestRate} Interest
              </Badge>
            )}
            {project.structure === "DEBT" && project.askingLoanDuration && (
              <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                <Clock className="w-3 h-3 mr-1" />
                {project.askingLoanDuration}
              </Badge>
            )}
            {project.structure === "DEBT" && project.askingPoints && (
              <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-700">
                {project.askingPoints} Points
              </Badge>
            )}
            {(project.structure === "EQUITY" || project.structure === "HYBRID") && project.askingEquityPercent && (
              <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                <Percent className="w-3 h-3 mr-1" />
                {project.askingEquityPercent}% Equity
              </Badge>
            )}
            {(project.structure === "EQUITY" || project.structure === "HYBRID") && project.askingProfitSplit && (
              <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-700">
                {project.askingProfitSplit} Split
              </Badge>
            )}
            {(project.structure === "EQUITY" || project.structure === "HYBRID") && project.askingPreferredReturn && (
              <Badge variant="outline" className="bg-teal-50 border-teal-300 text-teal-700">
                {project.askingPreferredReturn} Pref
              </Badge>
            )}
            {project.structure === "HYBRID" && (
              <>
                {project.askingDebtPortion && (
                  <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700">
                    {project.askingDebtPortion}% Debt
                  </Badge>
                )}
                {project.askingEquityPortion && (
                  <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700">
                    {project.askingEquityPortion}% Equity
                  </Badge>
                )}
              </>
            )}
            {!project.askingInterestRate && !project.askingEquityPercent && !project.askingProfitSplit && (
              <span className="text-xs text-muted-foreground italic">Terms negotiable</span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1" onClick={onInvest} data-testid={`button-invest-${project.id}`}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Submit Offer
        </Button>
      </CardFooter>
    </Card>
  );
}

function OfferDialog({ 
  project, 
  open, 
  onClose 
}: { 
  project: CapitalProject;
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [role, setRole] = useState("LP");
  const [offerType, setOfferType] = useState<"conform" | "counter">("conform");
  const [equityPercent, setEquityPercent] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [holdPeriod, setHoldPeriod] = useState("");
  const [notes, setNotes] = useState("");

  const hasAskingTerms = project.askingInterestRate || project.askingEquityPercent || project.askingProfitSplit;

  const submitOffer = useMutation({
    mutationFn: async () => {
      let finalEquityPercent = equityPercent;
      let finalInterestRate = interestRate;
      let finalHoldPeriod = holdPeriod;
      
      // If conforming to terms, use the operator's asking terms
      if (offerType === "conform") {
        if (project.structure === "EQUITY" || project.structure === "HYBRID") {
          finalEquityPercent = project.askingEquityPercent ? `${project.askingEquityPercent}%` : equityPercent;
        }
        if (project.structure === "DEBT" || project.structure === "HYBRID") {
          finalInterestRate = project.askingInterestRate || interestRate;
        }
        finalHoldPeriod = project.askingLoanDuration || project.holdPeriod || holdPeriod;
      }

      const offerData = {
        projectId: project.id,
        amountOffered: parseInt(amount),
        requestedRole: role,
        offerType: offerType, // conform or counter
        proposedEquityPercent: finalEquityPercent || undefined,
        proposedInterestRate: finalInterestRate || undefined,
        holdPeriod: finalHoldPeriod || undefined,
        notes: notes || undefined,
      };
      return apiRequest("POST", "/api/investment-offers", offerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-investment-offers"] });
      toast({
        title: "Offer Submitted",
        description: "Your investment offer has been submitted for review.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!amount || parseInt(amount) < project.minInvestment) {
      toast({
        title: "Invalid Amount",
        description: `Minimum investment is ${formatCurrency(project.minInvestment)}`,
        variant: "destructive",
      });
      return;
    }
    if (project.maxInvestmentPerInvestor && parseInt(amount) > project.maxInvestmentPerInvestor) {
      toast({
        title: "Invalid Amount",
        description: `Maximum investment is ${formatCurrency(project.maxInvestmentPerInvestor)}`,
        variant: "destructive",
      });
      return;
    }
    submitOffer.mutate();
  };

  const progress = project.fundingGoal > 0 
    ? ((project.amountRaised || 0) / project.fundingGoal) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Investment Offer</DialogTitle>
          <DialogDescription>
            Review the project details and submit your investment offer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{project.title}</CardTitle>
              {project.location && (
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>

              {project.scopeOfWork && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Scope of Work</h4>
                  <p className="text-sm text-muted-foreground">{project.scopeOfWork}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Funding Progress</span>
                  <span className="font-medium">
                    {formatCurrency(project.amountRaised || 0)} / {formatCurrency(project.fundingGoal)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {formatCurrency(project.fundingGoal - (project.amountRaised || 0))} remaining
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Structure</p>
                  <p className="font-semibold">{project.structure}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Min Investment</p>
                  <p className="font-semibold">{formatCurrency(project.minInvestment)}</p>
                </div>
                {project.maxInvestmentPerInvestor && (
                  <div>
                    <p className="text-xs text-muted-foreground">Max Investment</p>
                    <p className="font-semibold">{formatCurrency(project.maxInvestmentPerInvestor)}</p>
                  </div>
                )}
                {project.projectedReturn && (
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Return</p>
                    <p className="font-semibold text-green-600">{project.projectedReturn}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Operator Seeking Terms - Highlighted Section */}
          {hasAskingTerms && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Operator Seeking Terms
                </CardTitle>
                <CardDescription>
                  The operator is seeking the following investment terms for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.structure === "DEBT" && (
                    <>
                      {project.askingInterestRate && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                          <p className="font-bold text-lg text-primary">{project.askingInterestRate}</p>
                        </div>
                      )}
                      {project.askingLoanDuration && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Loan Duration</p>
                          <p className="font-bold text-lg">{project.askingLoanDuration}</p>
                        </div>
                      )}
                      {project.askingPoints && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Points</p>
                          <p className="font-bold text-lg">{project.askingPoints}</p>
                        </div>
                      )}
                    </>
                  )}
                  {(project.structure === "EQUITY" || project.structure === "HYBRID") && (
                    <>
                      {project.askingEquityPercent && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Equity to Investor</p>
                          <p className="font-bold text-lg text-primary">{project.askingEquityPercent}%</p>
                        </div>
                      )}
                      {project.askingProfitSplit && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Profit Split</p>
                          <p className="font-bold text-lg">{project.askingProfitSplit}</p>
                        </div>
                      )}
                      {project.askingPreferredReturn && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Preferred Return</p>
                          <p className="font-bold text-lg">{project.askingPreferredReturn}</p>
                        </div>
                      )}
                    </>
                  )}
                  {project.structure === "HYBRID" && (
                    <>
                      {project.askingDebtPortion && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Debt Portion</p>
                          <p className="font-bold text-lg">{project.askingDebtPortion}%</p>
                        </div>
                      )}
                      {project.askingEquityPortion && (
                        <div className="p-3 rounded-lg bg-background border">
                          <p className="text-xs text-muted-foreground mb-1">Equity Portion</p>
                          <p className="font-bold text-lg">{project.askingEquityPortion}%</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Your Investment Offer</h3>
            
            {/* Conform vs Counter Toggle */}
            {hasAskingTerms && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <Label className="text-sm font-medium mb-3 block">How would you like to proceed?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOfferType("conform")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      offerType === "conform"
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-border hover:border-green-300"
                    }`}
                    data-testid="button-conform-terms"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className={`w-5 h-5 ${offerType === "conform" ? "text-green-600" : "text-muted-foreground"}`} />
                      <span className="font-semibold">Conform to Terms</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accept the operator's asking terms as proposed
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferType("counter")}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      offerType === "counter"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-border hover:border-blue-300"
                    }`}
                    data-testid="button-counter-terms"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className={`w-5 h-5 ${offerType === "counter" ? "text-blue-600" : "text-muted-foreground"}`} />
                      <span className="font-semibold">Counter-Offer</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Propose your own terms for negotiation
                    </p>
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Min: ${formatCurrency(project.minInvestment)}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-offer-amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Requested Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" data-testid="select-offer-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LP">Limited Partner (LP)</SelectItem>
                    <SelectItem value="GP">General Partner (GP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show counter-offer fields only when counter is selected, OR when there are no asking terms */}
              {(offerType === "counter" || !hasAskingTerms) && (
                <>
                  {(project.structure === "EQUITY" || project.structure === "HYBRID") && (
                    <div className="space-y-2">
                      <Label htmlFor="equity">Proposed Equity %</Label>
                      <Input
                        id="equity"
                        placeholder={project.askingEquityPercent ? `Asking: ${project.askingEquityPercent}%` : "e.g., 10%"}
                        value={equityPercent}
                        onChange={(e) => setEquityPercent(e.target.value)}
                        data-testid="input-offer-equity"
                      />
                    </div>
                  )}

                  {(project.structure === "DEBT" || project.structure === "HYBRID") && (
                    <div className="space-y-2">
                      <Label htmlFor="interest">Proposed Interest Rate</Label>
                      <Input
                        id="interest"
                        placeholder={project.askingInterestRate ? `Asking: ${project.askingInterestRate}` : "e.g., 12% APR"}
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        data-testid="input-offer-interest"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="hold">Preferred Hold Period</Label>
                    <Input
                      id="hold"
                      placeholder={project.askingLoanDuration || project.holdPeriod ? `Asking: ${project.askingLoanDuration || project.holdPeriod}` : "e.g., 12 months"}
                      value={holdPeriod}
                      onChange={(e) => setHoldPeriod(e.target.value)}
                      data-testid="input-offer-hold"
                    />
                  </div>
                </>
              )}

              {/* Show summary when conforming */}
              {offerType === "conform" && hasAskingTerms && (
                <div className="col-span-2 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    You're accepting the operator's terms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.askingInterestRate && (
                      <Badge variant="outline" className="bg-white dark:bg-green-900">
                        {project.askingInterestRate} Interest
                      </Badge>
                    )}
                    {project.askingEquityPercent && (
                      <Badge variant="outline" className="bg-white dark:bg-green-900">
                        {project.askingEquityPercent}% Equity
                      </Badge>
                    )}
                    {project.askingProfitSplit && (
                      <Badge variant="outline" className="bg-white dark:bg-green-900">
                        {project.askingProfitSplit} Split
                      </Badge>
                    )}
                    {project.askingLoanDuration && (
                      <Badge variant="outline" className="bg-white dark:bg-green-900">
                        {project.askingLoanDuration}
                      </Badge>
                    )}
                    {project.askingPreferredReturn && (
                      <Badge variant="outline" className="bg-white dark:bg-green-900">
                        {project.askingPreferredReturn} Pref
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder={offerType === "counter" ? "Explain why you're proposing different terms..." : "Any additional notes for the Dreamscaper team..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                data-testid="input-offer-notes"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitOffer.isPending}
            data-testid="button-submit-offer"
          >
            {submitOffer.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Submit Offer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MyOffersTab({ 
  offers, 
  projects 
}: { 
  offers: InvestmentOffer[];
  projects: CapitalProject[];
}) {
  const getProject = (projectId: number) => projects.find(p => p.id === projectId);

  if (offers.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Offers Yet</h3>
          <p className="text-muted-foreground">
            You haven't submitted any investment offers. Browse opportunities to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const project = getProject(offer.projectId);
        const statusStyle = OFFER_STATUS_STYLES[offer.status] || OFFER_STATUS_STYLES.PENDING;

        return (
          <Card key={offer.id} data-testid={`card-offer-${offer.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="text-lg">{project?.title || "Unknown Project"}</CardTitle>
                  <CardDescription>
                    Submitted on {new Date(offer.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                  {offer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount Offered</p>
                  <p className="font-semibold">{formatCurrency(offer.amountOffered)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Requested Role</p>
                  <p className="font-semibold">{offer.requestedRole}</p>
                </div>
                {offer.proposedEquityPercent && (
                  <div>
                    <p className="text-xs text-muted-foreground">Proposed Equity</p>
                    <p className="font-semibold">{offer.proposedEquityPercent}</p>
                  </div>
                )}
                {offer.proposedInterestRate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Proposed Interest</p>
                    <p className="font-semibold">{offer.proposedInterestRate}</p>
                  </div>
                )}
              </div>

              {offer.status === "COUNTERED" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Counter Offer</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {offer.counterAmount && (
                      <div>
                        <p className="text-blue-600">Counter Amount</p>
                        <p className="font-semibold text-blue-900">{formatCurrency(offer.counterAmount)}</p>
                      </div>
                    )}
                    {offer.counterEquityPercent && (
                      <div>
                        <p className="text-blue-600">Counter Equity</p>
                        <p className="font-semibold text-blue-900">{offer.counterEquityPercent}</p>
                      </div>
                    )}
                    {offer.counterInterestRate && (
                      <div>
                        <p className="text-blue-600">Counter Interest</p>
                        <p className="font-semibold text-blue-900">{offer.counterInterestRate}</p>
                      </div>
                    )}
                  </div>
                  {offer.counterNotes && (
                    <p className="mt-2 text-sm text-blue-700">{offer.counterNotes}</p>
                  )}
                </div>
              )}

              {offer.notes && (
                <div className="mt-4 p-3 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground">{offer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MyInvestmentsTab({ 
  commitments, 
  projects 
}: { 
  commitments: CommittedInvestment[];
  projects: CapitalProject[];
}) {
  const getProject = (projectId: number) => projects.find(p => p.id === projectId);

  const totalInvested = commitments.reduce((sum, c) => sum + c.committedAmount, 0);

  if (commitments.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Investments</h3>
          <p className="text-muted-foreground">
            Once your offers are accepted, your investments will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Invested</p>
              <p className="text-3xl font-bold text-green-800">{formatCurrency(totalInvested)}</p>
            </div>
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {commitments.map((commitment) => {
          const project = getProject(commitment.projectId);
          const statusStyle = project ? STATUS_STYLES[project.status] || STATUS_STYLES.DRAFT : STATUS_STYLES.DRAFT;

          return (
            <Card key={commitment.id} data-testid={`card-commitment-${commitment.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <CardTitle className="text-lg">{project?.title || "Unknown Project"}</CardTitle>
                    <CardDescription>
                      Committed on {new Date(commitment.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                    {project?.status?.replace(/_/g, " ") || "Unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Committed Amount</p>
                    <p className="font-semibold text-green-600">{formatCurrency(commitment.committedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="font-semibold">{commitment.role}</p>
                  </div>
                  {commitment.equityPercent && (
                    <div>
                      <p className="text-xs text-muted-foreground">Equity</p>
                      <p className="font-semibold">{commitment.equityPercent}</p>
                    </div>
                  )}
                  {commitment.interestRate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold">{commitment.interestRate}</p>
                    </div>
                  )}
                </div>

                {commitment.notes && (
                  <div className="mt-4 p-3 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">{commitment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
