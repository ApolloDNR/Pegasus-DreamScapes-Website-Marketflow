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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  Send,
  Sparkles,
  Shield,
  Palette,
  BarChart3,
  Star,
  Flame,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Info,
  Zap,
  Award,
  ThumbsUp,
  AlertTriangle,
  TrendingDown,
  Activity,
  Pencil,
  Save,
  X
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DealChat } from "@/components/deal-chat";

interface CapitalProject {
  id: number;
  title: string;
  description?: string;
  location?: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  structure?: string;
  projectedReturn?: string;
  holdPeriod?: string;
  status: string;
  createdBy?: string;
  images?: string[];
  riskLevel?: string;
  designAppeal?: number;
  roiPotential?: number;
  marketDemand?: number;
  neighborhoodGrade?: string;
  strategy?: string;
  propertyType?: string;
  investorCount?: number;
  isFeatured?: boolean;
  isHot?: boolean;
  askingInterestRate?: string;
  askingLoanDuration?: string;
  askingEquityPercent?: string;
  askingProfitSplit?: string;
}

export default function DealflowProject() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/dealflow/project/:id");
  const projectId = params?.id ? parseInt(params.id) : null;

  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [investStructure, setInvestStructure] = useState<"equity" | "debt" | "hybrid">("equity");
  const [investRole, setInvestRole] = useState("LP");
  const [requestGP, setRequestGP] = useState(false);
  const [proposedEquity, setProposedEquity] = useState("");
  const [proposedProfitSplit, setProposedProfitSplit] = useState("70/30");
  const [proposedInterest, setProposedInterest] = useState("");
  const [proposedLoanDuration, setProposedLoanDuration] = useState("");
  const [investNotes, setInvestNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  
  // Admin edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<CapitalProject>>({});

  const { data: project, isLoading } = useQuery<CapitalProject>({
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

  const { data: negotiations = [] } = useQuery<any[]>({
    queryKey: ["/api/negotiations", "capital_project", projectId],
    enabled: !!projectId,
  });

  const submitOfferMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/investment-offers", {
        projectId,
        amountOffered: parseInt(investAmount),
        structureType: investStructure,
        requestedRole: requestGP ? "GP" : investRole,
        proposedEquityPercent: proposedEquity || undefined,
        proposedProfitSplit: proposedProfitSplit || undefined,
        proposedInterestRate: proposedInterest || undefined,
        proposedLoanDuration: proposedLoanDuration || undefined,
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

  // Admin update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: Partial<CapitalProject>) => {
      const res = await apiRequest("PATCH", `/api/hq/capital-projects/${projectId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      toast({
        title: "Project Updated",
        description: "Your changes have been saved.",
      });
      setIsEditMode(false);
      setEditData({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditData({});
    } else if (project) {
      setEditData({
        title: project.title,
        description: project.description,
        fundingGoal: project.fundingGoal,
        amountRaised: project.amountRaised,
        minInvestment: project.minInvestment,
        projectedReturn: project.projectedReturn,
        holdPeriod: project.holdPeriod,
        riskLevel: project.riskLevel,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveEdits = () => {
    if (Object.keys(editData).length > 0) {
      updateProjectMutation.mutate(editData);
    }
  };

  const resetForm = () => {
    setInvestAmount("");
    setInvestStructure("equity");
    setInvestRole("LP");
    setRequestGP(false);
    setProposedEquity("");
    setProposedProfitSplit("70/30");
    setProposedLoanDuration("");
    setProposedInterest("");
    setInvestNotes("");
  };

  const openConformToTerms = () => {
    if (!project) return;
    
    resetForm();
    
    const hasDebt = project.askingInterestRate || project.askingLoanDuration;
    const hasEquity = project.askingEquityPercent || project.askingProfitSplit;
    
    if (hasDebt && hasEquity) {
      setInvestStructure("hybrid");
    } else if (hasDebt) {
      setInvestStructure("debt");
    } else {
      setInvestStructure("equity");
    }
    
    setInvestAmount(String(project.minInvestment));
    
    if (hasDebt) {
      setProposedInterest(project.askingInterestRate || "");
      setProposedLoanDuration(project.askingLoanDuration || "");
    }
    
    if (hasEquity) {
      setProposedEquity(project.askingEquityPercent || "");
      setProposedProfitSplit(project.askingProfitSplit || "70/30");
    }
    
    setInvestNotes("Conforming to operator's asking terms.");
    setInvestDialogOpen(true);
  };

  const openCounterOffer = () => {
    resetForm();
    setInvestDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMatchScore = (project: CapitalProject) => {
    let score = 75;
    if (project.roiPotential) score += project.roiPotential * 3;
    if (project.designAppeal) score += project.designAppeal * 2;
    if (project.marketDemand) score += project.marketDemand * 2;
    if (project.isFeatured) score += 5;
    if (project.isHot) score += 3;
    return Math.min(Math.round(score), 100);
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
  const matchScore = calculateMatchScore(project);

  const getRiskColor = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case "low": return "text-green-600 bg-green-100 dark:bg-green-950";
      case "medium": return "text-amber-600 bg-amber-100 dark:bg-amber-950";
      case "high": return "text-red-600 bg-red-100 dark:bg-red-950";
      default: return "text-amber-600 bg-amber-100 dark:bg-amber-950";
    }
  };

  const getRiskIcon = (risk?: string) => {
    switch (risk?.toLowerCase()) {
      case "low": return Shield;
      case "high": return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <DealflowLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dealflow/deals">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Deals
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {/* Staff Admin Edit Controls */}
            {user?.isStaff && (
              <>
                {isEditMode ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEditToggle}
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveEdits}
                      disabled={updateProjectMutation.isPending}
                      data-testid="button-save-edit"
                    >
                      {updateProjectMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditToggle}
                    className="border-amber-500 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                    data-testid="button-edit-project"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Deal
                  </Button>
                )}
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setIsSaved(!isSaved);
                    toast({ title: isSaved ? "Removed from saved" : "Saved to your list" });
                  }}
                  data-testid="button-save-project"
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" data-testid="button-share-project">
                  <Share2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm" data-testid="button-contact-project">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>

        {/* Admin Edit Mode Banner */}
        {isEditMode && (
          <Card className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Pencil className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Edit Mode Active</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Click on editable fields below to modify deal information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 rounded-xl overflow-hidden">
              {project.images && project.images[0] ? (
                <img 
                  src={project.images[0]} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-primary/30" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                {project.isHot && (
                  <Badge className="bg-red-500 text-white">
                    <Flame className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
                {project.isFeatured && (
                  <Badge className="bg-amber-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge className={
                  project.status === "OPEN_FOR_INVESTMENT" ? "bg-green-600 text-white" :
                  project.status === "FUNDED" ? "bg-blue-600 text-white" :
                  project.status === "COMPLETED" ? "bg-emerald-600 text-white" :
                  "bg-amber-600 text-white"
                }>
                  {project.status?.replace(/_/g, " ")}
                </Badge>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-serif font-bold text-white mb-2">{project.title}</h1>
                {project.location && (
                  <p className="text-white/80 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </p>
                )}
              </div>
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5">
              <CardContent className="py-5">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-secondary"
                        />
                        <circle
                          cx="18" cy="18" r="15"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${matchScore} ${100 - matchScore}`}
                          strokeLinecap="round"
                          className={matchScore >= 90 ? "text-green-500" : matchScore >= 75 ? "text-emerald-500" : "text-amber-500"}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${matchScore >= 90 ? "text-green-600" : matchScore >= 75 ? "text-emerald-600" : "text-amber-600"}`}>
                        {matchScore}%
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Match Score
                      </h3>
                      <p className="text-sm text-muted-foreground">Based on your investment profile</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {project.roiPotential && (
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                        <p className="text-xs text-muted-foreground">ROI Potential</p>
                        <p className="font-bold text-green-600">{project.roiPotential}/5</p>
                      </div>
                    )}
                    {project.designAppeal && (
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <Palette className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                        <p className="text-xs text-muted-foreground">Design Appeal</p>
                        <p className="font-bold text-pink-600">{project.designAppeal}/5</p>
                      </div>
                    )}
                    {project.marketDemand && (
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        <BarChart3 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-xs text-muted-foreground">Market Demand</p>
                        <p className="font-bold text-blue-600">{project.marketDemand}/5</p>
                      </div>
                    )}
                    {project.riskLevel && (
                      <div className="text-center p-2 bg-background/50 rounded-lg">
                        {(() => {
                          const RiskIcon = getRiskIcon(project.riskLevel);
                          const riskColorClass = getRiskColor(project.riskLevel).split(' ')[0];
                          return (
                            <>
                              <RiskIcon className={`w-5 h-5 mx-auto mb-1 ${riskColorClass}`} />
                              <p className="text-xs text-muted-foreground">Risk Level</p>
                              <p className={`font-bold capitalize ${riskColorClass}`}>{project.riskLevel}</p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {project.description || "Investment opportunity in real estate development."}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {project.strategy && (
                  <Badge variant="outline">{project.strategy.replace("-", " & ")}</Badge>
                )}
                {project.propertyType && (
                  <Badge variant="outline">{project.propertyType.replace("-", " ")}</Badge>
                )}
                {project.neighborhoodGrade && (
                  <Badge variant="outline">Grade {project.neighborhoodGrade}</Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="chemistry" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="chemistry" data-testid="tab-chemistry">Chemistry</TabsTrigger>
                <TabsTrigger value="overview" data-testid="tab-overview">Details</TabsTrigger>
                <TabsTrigger value="milestones" data-testid="tab-milestones">Milestones</TabsTrigger>
                <TabsTrigger value="offers" data-testid="tab-offers">Offers</TabsTrigger>
                <TabsTrigger value="investors" data-testid="tab-investors">Investors</TabsTrigger>
              </TabsList>

              <TabsContent value="chemistry" className="mt-6 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Investment Chemistry Breakdown
                    </CardTitle>
                    <CardDescription>
                      How this deal aligns with your investment preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ChemistryBar 
                      label="ROI Potential" 
                      value={project.roiPotential || 3} 
                      max={5}
                      color="bg-green-500"
                      icon={<TrendingUp className="w-4 h-4" />}
                      description="Expected return on investment compared to similar projects"
                    />
                    <ChemistryBar 
                      label="Design Appeal" 
                      value={project.designAppeal || 3} 
                      max={5}
                      color="bg-pink-500"
                      icon={<Palette className="w-4 h-4" />}
                      description="Quality of renovation design and aesthetic value"
                    />
                    <ChemistryBar 
                      label="Market Demand" 
                      value={project.marketDemand || 3} 
                      max={5}
                      color="bg-blue-500"
                      icon={<BarChart3 className="w-4 h-4" />}
                      description="Local market conditions and buyer demand"
                    />
                    <ChemistryBar 
                      label="Risk Profile Match" 
                      value={project.riskLevel === "low" ? 5 : project.riskLevel === "medium" ? 3 : 1} 
                      max={5}
                      color="bg-amber-500"
                      icon={<Shield className="w-4 h-4" />}
                      description="How well the risk level matches your preferences"
                    />
                    <ChemistryBar 
                      label="Investment Size Fit" 
                      value={4} 
                      max={5}
                      color="bg-purple-500"
                      icon={<DollarSign className="w-4 h-4" />}
                      description="How well the minimum investment fits your capital allocation"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                      Why This Matches You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Strong ROI Potential</p>
                          <p className="text-xs text-muted-foreground">Target returns align with your goals</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Premium Location</p>
                          <p className="text-xs text-muted-foreground">High-demand neighborhood grade</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Design-Forward Approach</p>
                          <p className="text-xs text-muted-foreground">Matches your aesthetic preferences</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Experienced Operator</p>
                          <p className="text-xs text-muted-foreground">Proven track record with similar projects</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <p className="text-sm text-muted-foreground">Structure</p>
                      <p className="text-xl font-bold">{project.structure || "Equity"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <p className="text-sm text-muted-foreground">Min Investment</p>
                      <p className="text-xl font-bold">{formatCurrency(project.minInvestment)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5 pb-4">
                      <p className="text-sm text-muted-foreground">Target Return</p>
                      <p className="text-xl font-bold text-green-600">{project.projectedReturn || "15-20%"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5 pb-4">
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
                      <Card key={milestone.id} className={milestone.isComplete ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : ""}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              milestone.isComplete ? "bg-green-600 text-white" : "bg-secondary"
                            }`}>
                              {milestone.isComplete ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{milestone.title}</p>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{milestone.description}</p>
                              )}
                            </div>
                            <Badge variant={milestone.isComplete ? "default" : "outline"} className="shrink-0">
                              {milestone.isComplete ? "Complete" : "Pending"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offers" className="mt-6 space-y-4">
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="py-6 text-center">
                    <Button onClick={() => setInvestDialogOpen(true)} className="gap-2" data-testid="button-make-offer">
                      <Zap className="w-4 h-4" />
                      Make an Investment Offer
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Submit your terms and start negotiating
                    </p>
                  </CardContent>
                </Card>

                {negotiations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No offers yet</p>
                      <p className="text-sm">Be the first to make an investment offer</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Negotiation History ({negotiations.length})
                    </h3>
                    {negotiations.map((negotiation: any) => (
                      <Card key={negotiation.id} className={
                        negotiation.status === "accepted" ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" :
                        negotiation.status === "declined" ? "border-red-500/50 bg-red-50/50 dark:bg-red-950/20" :
                        negotiation.status === "countered" ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" :
                        ""
                      }>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={
                                  negotiation.status === "accepted" ? "default" :
                                  negotiation.status === "declined" ? "destructive" :
                                  negotiation.status === "countered" ? "secondary" :
                                  "outline"
                                }>
                                  {negotiation.status}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {negotiation.structureType === "debt" ? "Debt" : "Equity"}
                                </Badge>
                                {negotiation.transactionRole && (
                                  <Badge variant="outline" className="text-xs">
                                    {negotiation.transactionRole}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                                <div>
                                  <p className="text-muted-foreground text-xs">Amount</p>
                                  <p className="font-semibold">{formatCurrency(negotiation.proposedAmount)}</p>
                                </div>
                                {negotiation.structureType === "debt" && (
                                  <>
                                    {negotiation.proposedInterestRate && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">Interest Rate</p>
                                        <p className="font-semibold text-green-600">{negotiation.proposedInterestRate}</p>
                                      </div>
                                    )}
                                    {negotiation.proposedLoanDuration && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">Duration</p>
                                        <p className="font-semibold">{negotiation.proposedLoanDuration}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                                {negotiation.structureType === "equity" && (
                                  <>
                                    {negotiation.proposedEquityPercent && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">Equity</p>
                                        <p className="font-semibold text-blue-600">{negotiation.proposedEquityPercent}</p>
                                      </div>
                                    )}
                                    {negotiation.proposedProfitSplit && (
                                      <div>
                                        <p className="text-muted-foreground text-xs">Profit Split</p>
                                        <p className="font-semibold">{negotiation.proposedProfitSplit}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              {negotiation.notes && (
                                <p className="text-sm text-muted-foreground mt-3 italic">
                                  "{negotiation.notes}"
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {new Date(negotiation.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            {negotiation.status === "pending" && negotiation.responderId === user?.id && (
                              <div className="flex flex-col gap-2">
                                <Button size="sm" variant="default" className="gap-1" data-testid={`button-accept-${negotiation.id}`}>
                                  <CheckCircle2 className="w-3 h-3" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1" data-testid={`button-counter-${negotiation.id}`}>
                                  <MessageCircle className="w-3 h-3" />
                                  Counter
                                </Button>
                              </div>
                            )}
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
                      <p className="font-medium">No investors yet</p>
                      <p className="text-sm">Be the first to invest in this project</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {commitments.map((commitment: any) => (
                      <Card key={commitment.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{formatCurrency(commitment.committedAmount)}</p>
                                <p className="text-sm text-muted-foreground">{commitment.role}</p>
                              </div>
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
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Capital Raise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-semibold">{progress}%</span>
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
                    <span className="font-medium">{project.investorCount || commitments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Return</span>
                    <span className="font-medium text-green-600">{project.projectedReturn}</span>
                  </div>
                </div>

                {project.status === "OPEN_FOR_INVESTMENT" && (
                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => setInvestDialogOpen(true)}
                      data-testid="button-invest-now"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Invest Now
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      data-testid="button-schedule-call"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule a Call
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{project.holdPeriod || "12-18 months"}</p>
                    <p className="text-sm text-muted-foreground">Expected hold period</p>
                  </div>
                </div>
                {milestones.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Milestone Progress</p>
                    <Progress value={(completedMilestones / milestones.length) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedMilestones} of {milestones.length} complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capital Raising Block - Operator Terms */}
            <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 via-amber-500/5 to-primary/10 shadow-lg" data-testid="capital-raising-block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span>Capital Raising Terms</span>
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">These are the operator's asking terms. Accept as-is or propose your own terms.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(project.askingInterestRate || project.askingLoanDuration) && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">Debt Structure</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {project.askingInterestRate && (
                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-md">
                          <p className="text-muted-foreground text-xs">Interest Rate</p>
                          <p className="text-lg font-bold text-green-600">{project.askingInterestRate}</p>
                        </div>
                      )}
                      {project.askingLoanDuration && (
                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-md">
                          <p className="text-muted-foreground text-xs">Loan Duration</p>
                          <p className="text-lg font-bold">{project.askingLoanDuration}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {(project.askingEquityPercent || project.askingProfitSplit) && (
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Equity Structure</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {project.askingEquityPercent && (
                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-md">
                          <p className="text-muted-foreground text-xs">Equity Offered</p>
                          <p className="text-lg font-bold text-blue-600">{project.askingEquityPercent}</p>
                        </div>
                      )}
                      {project.askingProfitSplit && (
                        <div className="p-2 bg-white/50 dark:bg-black/20 rounded-md">
                          <p className="text-muted-foreground text-xs">Profit Split</p>
                          <p className="text-lg font-bold">{project.askingProfitSplit}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!(project.askingInterestRate || project.askingLoanDuration || project.askingEquityPercent || project.askingProfitSplit) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">Terms to be discussed</p>
                    <p className="text-xs">Submit an offer to start negotiation</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  {(project.askingInterestRate || project.askingEquityPercent) && (
                    <Button 
                      onClick={openConformToTerms}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      data-testid="button-conform-terms"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept Operator's Terms
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={openCounterOffer}
                    className="w-full border-primary/50 hover:bg-primary/10"
                    data-testid="button-counter-offer"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Counter-Offer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Operator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                    P
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Pegasus Dreamscapes</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                      Certified Dreamscaper
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {projectId && (
              <DealChat 
                dealType="capital_project" 
                dealId={projectId} 
              />
            )}
          </div>
        </div>
      </div>

      <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Invest in {project.title}
            </DialogTitle>
            <DialogDescription>
              Structure your investment offer with your preferred terms
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {(project.askingInterestRate || project.askingEquityPercent) && (
              <Card className="bg-gradient-to-r from-amber-500/10 to-primary/10 border-amber-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Operator's Asking Terms</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {project.askingInterestRate && (
                      <div>
                        <p className="text-muted-foreground text-xs">Interest Rate</p>
                        <p className="font-semibold text-green-600">{project.askingInterestRate}</p>
                      </div>
                    )}
                    {project.askingLoanDuration && (
                      <div>
                        <p className="text-muted-foreground text-xs">Loan Duration</p>
                        <p className="font-semibold">{project.askingLoanDuration}</p>
                      </div>
                    )}
                    {project.askingEquityPercent && (
                      <div>
                        <p className="text-muted-foreground text-xs">Equity Offered</p>
                        <p className="font-semibold text-blue-600">{project.askingEquityPercent}</p>
                      </div>
                    )}
                    {project.askingProfitSplit && (
                      <div>
                        <p className="text-muted-foreground text-xs">Profit Split</p>
                        <p className="font-semibold">{project.askingProfitSplit}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Min ${formatCurrency(project.minInvestment)}`}
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    className="pl-10"
                    data-testid="input-invest-amount"
                  />
                </div>
                {parseInt(investAmount) > 0 && parseInt(investAmount) < project.minInvestment && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Below minimum investment
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Investment Role</Label>
                <RadioGroup value={investRole} onValueChange={setInvestRole} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LP" id="role-lp" />
                    <Label htmlFor="role-lp" className="font-normal text-sm cursor-pointer">LP</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GP" id="role-gp" />
                    <Label htmlFor="role-gp" className="font-normal text-sm cursor-pointer">GP</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Investment Structure</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "equity", label: "Equity", icon: <TrendingUp className="w-4 h-4" />, desc: "Own a stake in the project" },
                  { value: "debt", label: "Debt", icon: <DollarSign className="w-4 h-4" />, desc: "Loan with fixed returns" },
                  { value: "hybrid", label: "Hybrid", icon: <Sparkles className="w-4 h-4" />, desc: "Equity + Debt combined" },
                ].map((struct) => (
                  <button
                    key={struct.value}
                    type="button"
                    onClick={() => setInvestStructure(struct.value as any)}
                    className={`p-4 rounded-lg border-2 text-left transition-all hover-elevate ${
                      investStructure === struct.value 
                        ? "border-primary bg-primary/5" 
                        : "border-muted"
                    }`}
                    data-testid={`button-structure-${struct.value}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {struct.icon}
                      <span className="font-medium">{struct.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{struct.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {(investStructure === "equity" || investStructure === "hybrid") && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Equity Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equity-pct">Equity Percentage (%)</Label>
                      <Input
                        id="equity-pct"
                        placeholder="e.g., 10"
                        value={proposedEquity}
                        onChange={(e) => setProposedEquity(e.target.value)}
                        data-testid="input-proposed-equity"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profit Split (You/Operator)</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {["50/50", "60/40", "70/30", "80/20", "90/10"].map((split) => (
                          <button
                            key={split}
                            type="button"
                            onClick={() => setProposedProfitSplit(split)}
                            className={`px-2.5 py-1.5 text-xs rounded-md border transition-all ${
                              proposedProfitSplit === split 
                                ? "border-primary bg-primary/10 font-medium" 
                                : "border-muted hover-elevate"
                            }`}
                            data-testid={`button-split-${split.replace("/", "-")}`}
                          >
                            {split}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {(investStructure === "debt" || investStructure === "hybrid") && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Debt Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interest-rate">Interest Rate</Label>
                      <Input
                        id="interest-rate"
                        placeholder="e.g., 10%"
                        value={proposedInterest}
                        onChange={(e) => setProposedInterest(e.target.value)}
                        data-testid="input-proposed-interest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loan-duration">Loan Duration</Label>
                      <Input
                        id="loan-duration"
                        placeholder="e.g., 12 months"
                        value={proposedLoanDuration}
                        onChange={(e) => setProposedLoanDuration(e.target.value)}
                        data-testid="input-loan-duration"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional terms, conditions, or questions..."
                value={investNotes}
                onChange={(e) => setInvestNotes(e.target.value)}
                rows={2}
                data-testid="input-invest-notes"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
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

function getChemistryRating(value: number, max: number = 5): { label: string; color: string; textColor: string; description: string } {
  const normalized = (value / max) * 5;
  if (normalized >= 4.5) return { label: "Exceptional", color: "bg-green-500", textColor: "text-green-600", description: "Outstanding alignment with your investment profile" };
  if (normalized >= 3.5) return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600", description: "Very good match for your preferences" };
  if (normalized >= 2.5) return { label: "Good", color: "bg-amber-500", textColor: "text-amber-600", description: "Solid alignment with some considerations" };
  if (normalized >= 1.5) return { label: "Fair", color: "bg-orange-500", textColor: "text-orange-600", description: "Partial match, review carefully" };
  return { label: "Low", color: "bg-red-500", textColor: "text-red-600", description: "Limited alignment with preferences" };
}

function ChemistryBar({ 
  label, 
  value, 
  max, 
  color, 
  icon,
  description 
}: { 
  label: string; 
  value: number; 
  max: number;
  color: string;
  icon: JSX.Element;
  description: string;
}) {
  const percentage = (value / max) * 100;
  const rating = getChemistryRating(value, max);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="space-y-2 cursor-help p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              {icon}
              {label}
            </span>
            <Badge variant="outline" className={`${rating.textColor} font-semibold`}>
              {rating.label}
            </Badge>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${rating.color}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{rating.description}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="font-medium mb-1">{label}: {rating.label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
