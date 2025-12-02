import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useRoute } from "wouter";
import { DealflowLayout } from "@/components/dealflow-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building2, 
  DollarSign, 
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  Send
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function DealflowProject() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/dealflow/project/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [investRole, setInvestRole] = useState("LP");
  const [requestGP, setRequestGP] = useState(false);
  const [proposedEquity, setProposedEquity] = useState("");
  const [proposedInterest, setProposedInterest] = useState("");
  const [investNotes, setInvestNotes] = useState("");

  const { data: project, isLoading } = useQuery<any>({
    queryKey: ["/api/capital-projects", projectId],
    enabled: !!projectId,
  });

  const { data: milestones = [] } = useQuery<any[]>({
    queryKey: [`/api/capital-projects/${projectId}/milestones`],
    enabled: !!projectId,
  });

  const { data: commitments = [] } = useQuery<any[]>({
    queryKey: [`/api/capital-projects/${projectId}/commitments`],
    enabled: !!projectId,
  });

  const submitOfferMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/investment-offers", {
        projectId,
        amountOffered: parseInt(investAmount),
        requestedRole: requestGP ? "GP" : investRole,
        proposedEquityPercent: proposedEquity || undefined,
        proposedInterestRate: proposedInterest || undefined,
        notes: investNotes || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-investment-offers"] });
      toast({
        title: "Offer Submitted",
        description: "Your investment offer has been sent to the project creator.",
      });
      setInvestDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setInvestAmount("");
    setInvestRole("LP");
    setRequestGP(false);
    setProposedEquity("");
    setProposedInterest("");
    setInvestNotes("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <DealflowLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading project...</p>
        </div>
      </DealflowLayout>
    );
  }

  if (!project) {
    return (
      <DealflowLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">This project doesn't exist or has been removed.</p>
          <Link href="/dealflow/deals">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </DealflowLayout>
    );
  }

  const progress = project.fundingGoal > 0 
    ? Math.round((project.amountRaised / project.fundingGoal) * 100) 
    : 0;

  const completedMilestones = milestones.filter((m: any) => m.isComplete).length;

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/dealflow/deals">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              <Building2 className="w-24 h-24 text-primary/40" />
            </div>

            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-serif font-bold mb-2">{project.title}</h1>
                  {project.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                  )}
                </div>
                <Badge className={
                  project.status === "OPEN_FOR_INVESTMENT" ? "bg-green-600" :
                  project.status === "FUNDED" ? "bg-blue-600" :
                  project.status === "COMPLETED" ? "bg-emerald-600" :
                  "bg-amber-600"
                }>
                  {project.status?.replace(/_/g, " ")}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {project.description || "Investment opportunity in real estate development."}
              </p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
                <TabsTrigger value="investors">Investors ({commitments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Structure</p>
                      <p className="text-xl font-bold">{project.structure || "Equity"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Min Investment</p>
                      <p className="text-xl font-bold">{formatCurrency(project.minInvestment)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Target Return</p>
                      <p className="text-xl font-bold">{project.projectedReturn || "15-20%"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Hold Period</p>
                      <p className="text-xl font-bold">{project.holdPeriod || "12-18 mo"}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="milestones" className="mt-6">
                {milestones.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No milestones defined yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone: any, index: number) => (
                      <Card key={milestone.id} className={milestone.isComplete ? "bg-green-50 dark:bg-green-950/20" : ""}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              milestone.isComplete ? "bg-green-600 text-white" : "bg-secondary"
                            }`}>
                              {milestone.isComplete ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{milestone.title}</p>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              )}
                            </div>
                            <Badge variant={milestone.isComplete ? "default" : "outline"}>
                              {milestone.isComplete ? "Complete" : "Pending"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="investors" className="mt-6">
                {commitments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No investors yet</p>
                      <p className="text-sm">Be the first to invest in this project</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {commitments.map((commitment: any) => (
                      <Card key={commitment.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{formatCurrency(commitment.committedAmount)}</p>
                              <p className="text-sm text-muted-foreground">{commitment.role}</p>
                            </div>
                            <Badge>{commitment.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Capital Raise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}% funded</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(project.amountRaised || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">raised</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold">
                      {formatCurrency(project.fundingGoal)}
                    </p>
                    <p className="text-sm text-muted-foreground">goal</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Investment</span>
                    <span className="font-medium">{formatCurrency(project.minInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Structure</span>
                    <span className="font-medium">{project.structure || "Equity"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investors</span>
                    <span className="font-medium">{commitments.length}</span>
                  </div>
                </div>

                {project.status === "OPEN_FOR_INVESTMENT" && (
                  <Button 
                    className="w-full mt-4" 
                    size="lg"
                    onClick={() => setInvestDialogOpen(true)}
                    data-testid="button-invest-now"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Request to Invest / Partner
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{project.holdPeriod || "12-18 months"}</p>
                    <p className="text-sm text-muted-foreground">Expected hold period</p>
                  </div>
                </div>
                {milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Milestone Progress</p>
                    <Progress value={(completedMilestones / milestones.length) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedMilestones} of {milestones.length} complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dreamscaper</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    P
                  </div>
                  <div>
                    <p className="font-medium">Pegasus Dreamscapes</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      Dreamscaper Certified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request to Invest / Partner</DialogTitle>
            <DialogDescription>
              Submit your investment offer for {project.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Investment Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min: ${formatCurrency(project.minInvestment)}`}
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                data-testid="input-invest-amount"
              />
            </div>

            <div className="space-y-2">
              <Label>Investment Role</Label>
              <RadioGroup value={investRole} onValueChange={setInvestRole}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LP" id="lp" />
                  <Label htmlFor="lp" className="font-normal">Limited Partner (LP)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DEBT" id="debt" />
                  <Label htmlFor="debt" className="font-normal">Debt / Lender</Label>
                </div>
              </RadioGroup>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox 
                  id="gp" 
                  checked={requestGP} 
                  onCheckedChange={(checked) => setRequestGP(checked as boolean)} 
                />
                <Label htmlFor="gp" className="font-normal text-sm">
                  Request General Partner (GP) role
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equity">Proposed Equity %</Label>
                <Input
                  id="equity"
                  placeholder="e.g., 10%"
                  value={proposedEquity}
                  onChange={(e) => setProposedEquity(e.target.value)}
                  data-testid="input-proposed-equity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest">Proposed Interest Rate</Label>
                <Input
                  id="interest"
                  placeholder="e.g., 12%"
                  value={proposedInterest}
                  onChange={(e) => setProposedInterest(e.target.value)}
                  data-testid="input-proposed-interest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Conditions (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional terms or conditions..."
                value={investNotes}
                onChange={(e) => setInvestNotes(e.target.value)}
                rows={3}
                data-testid="input-invest-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => submitOfferMutation.mutate()}
              disabled={submitOfferMutation.isPending || !investAmount || parseInt(investAmount) < project.minInvestment}
              data-testid="button-submit-offer"
            >
              {submitOfferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DealflowLayout>
  );
}
