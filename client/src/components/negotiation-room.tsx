import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  CheckCircle2, 
  X, 
  Send, 
  DollarSign, 
  Percent, 
  Clock, 
  ArrowLeftRight,
  Handshake,
  TrendingUp,
  Home,
  User,
  History,
  Sparkles,
  Bot,
  AlertCircle,
  Calendar,
  Shield,
  FileText,
  Target,
  Loader2,
  ChevronRight,
  Lightbulb,
  BarChart3,
  Info
} from "lucide-react";

export type NegotiationType = "wholesale" | "capital";

export interface NegotiationTerms {
  investmentAmount?: number;
  interestRate?: number;
  profitSplit?: number;
  duration?: number;
  equityPercentage?: number;
  assignmentFee?: number;
  purchasePrice?: number;
  contractPrice?: number;
  notes?: string;
  earnestMoney?: number;
  inspectionPeriod?: number;
  closingTimeline?: number;
  financingContingency?: boolean;
  inspectionContingency?: boolean;
  appraisalContingency?: boolean;
  minimumHoldPeriod?: number;
  exitStrategy?: string;
  preferredReturnRate?: number;
  managementFee?: number;
  capitalCallProvision?: boolean;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  terms?: NegotiationTerms;
  type: "message" | "offer" | "counter" | "accepted" | "rejected";
  timestamp: Date;
}

export interface NegotiationRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: NegotiationType;
  dealId: string | number;
  dealTitle: string;
  originalTerms: NegotiationTerms;
  counterpartyName: string;
  counterpartyId: string;
  onAgreementReached?: (finalTerms: NegotiationTerms) => void;
}

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export function NegotiationRoom({
  open,
  onOpenChange,
  type,
  dealId,
  dealTitle,
  originalTerms,
  counterpartyName,
  counterpartyId,
  onAgreementReached
}: NegotiationRoomProps) {
  const { profile, user } = useSupabaseAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"terms" | "chat">("terms");
  const [message, setMessage] = useState("");
  const [proposedTerms, setProposedTerms] = useState<NegotiationTerms>({});
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const enrichedTerms: NegotiationTerms = {
        ...originalTerms,
        earnestMoney: originalTerms.earnestMoney || Math.round((originalTerms.purchasePrice || 0) * 0.01),
        inspectionPeriod: originalTerms.inspectionPeriod || 10,
        closingTimeline: originalTerms.closingTimeline || 30,
        financingContingency: originalTerms.financingContingency ?? false,
        inspectionContingency: originalTerms.inspectionContingency ?? true,
        appraisalContingency: originalTerms.appraisalContingency ?? false,
        minimumHoldPeriod: originalTerms.minimumHoldPeriod || 12,
        exitStrategy: originalTerms.exitStrategy || "refinance",
        preferredReturnRate: originalTerms.preferredReturnRate || 8,
        managementFee: originalTerms.managementFee || 2,
        capitalCallProvision: originalTerms.capitalCallProvision ?? true,
      };
      setProposedTerms(enrichedTerms);
      setMessage("");
      setMessages([
        {
          id: "1",
          senderId: counterpartyId,
          senderName: counterpartyName,
          message: `I'm offering these terms for ${dealTitle}. Let me know if you'd like to discuss.`,
          terms: originalTerms,
          type: "offer",
          timestamp: new Date(Date.now() - 3600000)
        }
      ]);
      setAiMessages([{
        role: "assistant",
        content: `Hi! I'm Peggy, your AI negotiation assistant. I'm here to help you analyze this ${type === "wholesale" ? "wholesale deal" : "capital raise"} and guide you through the negotiation. What would you like to know about the deal terms?`
      }]);
    }
  }, [open, dealId, originalTerms, counterpartyId, counterpartyName, dealTitle, type]);

  const currentUserId = user?.id || "current-user";
  const currentUserName = profile?.display_name || "You";

  const acceptMutation = useMutation({
    mutationFn: async (terms: NegotiationTerms) => {
      const response = await apiRequest('POST', '/api/negotiations/accept', {
        type,
        dealId,
        terms
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/negotiations'] });
    }
  });

  const counterMutation = useMutation({
    mutationFn: async (terms: NegotiationTerms) => {
      const response = await apiRequest('POST', '/api/negotiations/counter', {
        type,
        dealId,
        terms,
        message: "Counter offer submitted"
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/negotiations'] });
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage: NegotiationMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: profile?.avatar_url || undefined,
      message: message.trim(),
      type: "message",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  const handleSendCounterOffer = async () => {
    if (!validateTerms()) {
      toast({
        title: "Invalid Terms",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await counterMutation.mutateAsync(proposedTerms);
      
      const counterMessage: NegotiationMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: currentUserName,
        senderAvatar: profile?.avatar_url || undefined,
        message: "I'd like to propose these revised terms:",
        terms: proposedTerms,
        type: "counter",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, counterMessage]);
      setActiveTab("chat");
      
      toast({
        title: "Counter Offer Sent",
        description: "Your counter offer has been sent to the other party.",
      });
    } catch (error) {
      toast({
        title: "Failed to send counter offer",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTerms = async () => {
    const latestOffer = [...messages].reverse().find(m => m.terms);
    const finalTerms = latestOffer?.terms || proposedTerms;
    
    setIsSubmitting(true);
    
    try {
      await acceptMutation.mutateAsync(finalTerms);
      
      const acceptMessage: NegotiationMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: currentUserName,
        senderAvatar: profile?.avatar_url || undefined,
        message: "I accept these terms. Let's proceed!",
        terms: finalTerms,
        type: "accepted",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, acceptMessage]);
      
      toast({
        title: "Agreement Reached!",
        description: "Congratulations! Both parties have agreed to the terms.",
      });
      
      onAgreementReached?.(finalTerms);
      
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to record agreement",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskPeggy = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = aiInput.trim();
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsAiLoading(true);

    try {
      const response = await apiRequest('POST', '/api/peggy/chat', {
        message: userMessage,
        context: {
          dealType: type,
          dealTitle,
          originalTerms,
          proposedTerms,
          counterpartyName
        }
      });
      
      const data = await response.json();
      setAiMessages(prev => [...prev, { role: "assistant", content: data.response || "I'm sorry, I couldn't process that request. Please try again." }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting right now. Here are some general tips: Focus on creating win-win scenarios, be clear about your must-haves vs. nice-to-haves, and always get agreements in writing." 
      }]);
    } finally {
      setIsAiLoading(false);
    }

    setTimeout(() => {
      aiScrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const validateTerms = (): boolean => {
    if (type === "wholesale") {
      return !!(proposedTerms.purchasePrice && proposedTerms.purchasePrice > 0);
    } else {
      return !!(proposedTerms.investmentAmount && proposedTerms.investmentAmount > 0);
    }
  };

  const calculateTermsDifference = () => {
    const diffs: { field: string; original: string; proposed: string; change: string }[] = [];
    
    if (type === "wholesale") {
      if (originalTerms.purchasePrice !== proposedTerms.purchasePrice) {
        const diff = (proposedTerms.purchasePrice || 0) - (originalTerms.purchasePrice || 0);
        diffs.push({
          field: "Purchase Price",
          original: formatCurrency(originalTerms.purchasePrice),
          proposed: formatCurrency(proposedTerms.purchasePrice),
          change: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
        });
      }
      if (originalTerms.assignmentFee !== proposedTerms.assignmentFee) {
        const diff = (proposedTerms.assignmentFee || 0) - (originalTerms.assignmentFee || 0);
        diffs.push({
          field: "Assignment Fee",
          original: formatCurrency(originalTerms.assignmentFee),
          proposed: formatCurrency(proposedTerms.assignmentFee),
          change: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
        });
      }
    } else {
      if (originalTerms.investmentAmount !== proposedTerms.investmentAmount) {
        const diff = (proposedTerms.investmentAmount || 0) - (originalTerms.investmentAmount || 0);
        diffs.push({
          field: "Investment Amount",
          original: formatCurrency(originalTerms.investmentAmount),
          proposed: formatCurrency(proposedTerms.investmentAmount),
          change: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
        });
      }
      if (originalTerms.profitSplit !== proposedTerms.profitSplit) {
        const diff = (proposedTerms.profitSplit || 0) - (originalTerms.profitSplit || 0);
        diffs.push({
          field: "Profit Split",
          original: `${originalTerms.profitSplit}%`,
          proposed: `${proposedTerms.profitSplit}%`,
          change: diff > 0 ? `+${diff}%` : `${diff}%`
        });
      }
    }
    
    return diffs;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "TBD";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const quickAiQuestions = type === "wholesale" 
    ? [
        "Is this assignment fee competitive?",
        "What's a fair inspection period?",
        "Should I request seller financing?",
        "Red flags to watch for?"
      ]
    : [
        "Is this profit split fair?",
        "What preferred return should I ask for?",
        "Evaluate the exit strategy",
        "Key risks to consider?"
      ];

  const renderWholesaleTermsForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Financial Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Purchase Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={proposedTerms.purchasePrice || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  className="pl-9"
                  placeholder="0"
                  data-testid="input-purchase-price"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">Assignment Fee</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={proposedTerms.assignmentFee || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, assignmentFee: Number(e.target.value) }))}
                  className="pl-9"
                  placeholder="0"
                  data-testid="input-assignment-fee"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Earnest Money Deposit</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={proposedTerms.earnestMoney || ""}
                onChange={(e) => setProposedTerms(prev => ({ ...prev, earnestMoney: Number(e.target.value) }))}
                className="pl-9"
                placeholder="0"
                data-testid="input-earnest-money"
              />
            </div>
            <p className="text-xs text-muted-foreground">Typically 1-3% of purchase price</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Inspection Period (days)</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.inspectionPeriod || 10]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, inspectionPeriod: value }))}
                  max={30}
                  min={0}
                  step={1}
                  data-testid="slider-inspection-period"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 days</span>
                  <span className="font-medium text-foreground">{proposedTerms.inspectionPeriod || 10} days</span>
                  <span>30 days</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-medium">Closing Timeline (days)</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.closingTimeline || 30]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, closingTimeline: value }))}
                  max={90}
                  min={7}
                  step={1}
                  data-testid="slider-closing-timeline"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 days</span>
                  <span className="font-medium text-foreground">{proposedTerms.closingTimeline || 30} days</span>
                  <span>90 days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Contingencies
          </CardTitle>
          <CardDescription className="text-xs">
            Select protections for your offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Inspection Contingency</Label>
              <p className="text-xs text-muted-foreground">Right to inspect and negotiate repairs</p>
            </div>
            <Switch
              checked={proposedTerms.inspectionContingency ?? true}
              onCheckedChange={(checked) => setProposedTerms(prev => ({ ...prev, inspectionContingency: checked }))}
              data-testid="switch-inspection-contingency"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Financing Contingency</Label>
              <p className="text-xs text-muted-foreground">Subject to loan approval</p>
            </div>
            <Switch
              checked={proposedTerms.financingContingency ?? false}
              onCheckedChange={(checked) => setProposedTerms(prev => ({ ...prev, financingContingency: checked }))}
              data-testid="switch-financing-contingency"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Appraisal Contingency</Label>
              <p className="text-xs text-muted-foreground">Property must appraise at purchase price</p>
            </div>
            <Switch
              checked={proposedTerms.appraisalContingency ?? false}
              onCheckedChange={(checked) => setProposedTerms(prev => ({ ...prev, appraisalContingency: checked }))}
              data-testid="switch-appraisal-contingency"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCapitalTermsForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Investment Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Investment Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                value={proposedTerms.investmentAmount || ""}
                onChange={(e) => setProposedTerms(prev => ({ ...prev, investmentAmount: Number(e.target.value) }))}
                className="pl-9"
                placeholder="0"
                data-testid="input-investment-amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Equity Percentage</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.equityPercentage || 10]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, equityPercentage: value }))}
                  max={50}
                  min={1}
                  step={1}
                  data-testid="slider-equity-percentage"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span className="font-medium text-foreground">{proposedTerms.equityPercentage || 10}%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Profit Split (Your Share)</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.profitSplit || 50]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, profitSplit: value }))}
                  max={90}
                  min={10}
                  step={5}
                  data-testid="slider-profit-split"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span className="font-medium text-foreground">{proposedTerms.profitSplit || 50}%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            Return Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Preferred Return Rate</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.preferredReturnRate || 8]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, preferredReturnRate: value }))}
                  max={15}
                  min={0}
                  step={0.5}
                  data-testid="slider-preferred-return"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-medium text-foreground">{proposedTerms.preferredReturnRate || 8}%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Management Fee</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.managementFee || 2]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, managementFee: value }))}
                  max={5}
                  min={0}
                  step={0.25}
                  data-testid="slider-management-fee"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="font-medium text-foreground">{proposedTerms.managementFee || 2}%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Exit & Hold Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Minimum Hold Period (months)</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.minimumHoldPeriod || 12]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, minimumHoldPeriod: value }))}
                  max={60}
                  min={6}
                  step={6}
                  data-testid="slider-hold-period"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6mo</span>
                  <span className="font-medium text-foreground">{proposedTerms.minimumHoldPeriod || 12} months</span>
                  <span>60mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Exit Strategy</Label>
              <Select
                value={proposedTerms.exitStrategy || "refinance"}
                onValueChange={(value) => setProposedTerms(prev => ({ ...prev, exitStrategy: value }))}
              >
                <SelectTrigger data-testid="select-exit-strategy">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refinance">Refinance</SelectItem>
                  <SelectItem value="sale">Property Sale</SelectItem>
                  <SelectItem value="buyout">Partner Buyout</SelectItem>
                  <SelectItem value="hold">Long-term Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Capital Call Provision</Label>
              <p className="text-xs text-muted-foreground">Allow additional capital requests</p>
            </div>
            <Switch
              checked={proposedTerms.capitalCallProvision ?? true}
              onCheckedChange={(checked) => setProposedTerms(prev => ({ ...prev, capitalCallProvision: checked }))}
              data-testid="switch-capital-call"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessage = (msg: NegotiationMessage) => {
    const isCurrentUser = msg.senderId === currentUserId;
    
    return (
      <div 
        key={msg.id}
        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={msg.senderAvatar} />
          <AvatarFallback>{msg.senderName[0]}</AvatarFallback>
        </Avatar>
        
        <div className={`max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium">{msg.senderName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className={`rounded-lg p-3 ${
            msg.type === "accepted" 
              ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" 
              : msg.type === "counter" || msg.type === "offer"
                ? "bg-primary/10 border border-primary/30"
                : isCurrentUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
          }`}>
            {msg.type === "accepted" && (
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <Badge className="bg-green-600 text-white">Agreement Reached</Badge>
              </div>
            )}
            
            {(msg.type === "counter" || msg.type === "offer") && (
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeftRight className="w-4 h-4" />
                <Badge variant="outline">{msg.type === "offer" ? "Initial Offer" : "Counter Offer"}</Badge>
              </div>
            )}
            
            <p className="text-sm">{msg.message}</p>
            
            {msg.terms && (
              <div className="mt-3 p-2 bg-background/50 rounded border">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {msg.terms.investmentAmount && (
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">{formatCurrency(msg.terms.investmentAmount)}</span>
                    </div>
                  )}
                  {msg.terms.interestRate && (
                    <div>
                      <span className="text-muted-foreground">Interest: </span>
                      <span className="font-medium">{msg.terms.interestRate}%</span>
                    </div>
                  )}
                  {msg.terms.profitSplit && (
                    <div>
                      <span className="text-muted-foreground">Split: </span>
                      <span className="font-medium">{msg.terms.profitSplit}%</span>
                    </div>
                  )}
                  {msg.terms.purchasePrice && (
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-medium">{formatCurrency(msg.terms.purchasePrice)}</span>
                    </div>
                  )}
                  {msg.terms.assignmentFee && (
                    <div>
                      <span className="text-muted-foreground">Assignment: </span>
                      <span className="font-medium">{formatCurrency(msg.terms.assignmentFee)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const termsDiff = calculateTermsDifference();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" />
                Negotiation Room
              </DialogTitle>
              <DialogDescription className="mt-1">
                {dealTitle}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                with {counterpartyName}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                {type === "wholesale" ? <Home className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {type === "wholesale" ? "Wholesale" : "Capital Raise"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Terms Form */}
          <div className="w-[420px] border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "terms" | "chat")} className="flex flex-col h-full">
              <TabsList className="mx-4 mt-4 grid grid-cols-2">
                <TabsTrigger value="terms" className="gap-1">
                  <FileText className="w-3 h-3" />
                  Edit Terms
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Messages
                  {messages.length > 1 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">{messages.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="terms" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full p-4">
                  {type === "wholesale" ? renderWholesaleTermsForm() : renderCapitalTermsForm()}
                  
                  {/* Notes section - common to both */}
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Additional Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={proposedTerms.notes || ""}
                        onChange={(e) => setProposedTerms(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any conditions, requests, or notes for the other party..."
                        className="min-h-[80px] resize-none"
                        data-testid="textarea-notes"
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Terms Comparison Summary */}
                  {termsDiff.length > 0 && (
                    <Card className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-amber-600" />
                          Your Changes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {termsDiff.map((diff, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{diff.field}</span>
                              <div className="flex items-center gap-2">
                                <span className="line-through text-muted-foreground">{diff.original}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="font-medium">{diff.proposed}</span>
                                <Badge variant="outline" className="text-[10px]">{diff.change}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={handleSendCounterOffer}
                      disabled={isSubmitting || !validateTerms()}
                      data-testid="button-send-counter"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Counter Offer
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                      onClick={handleAcceptTerms}
                      disabled={isSubmitting}
                      data-testid="button-accept-and-close"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept Original Terms
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 overflow-hidden m-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(renderMessage)}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      data-testid="input-message"
                    />
                    <Button onClick={handleSendMessage} data-testid="button-send-message">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                      data-testid="button-exit-negotiation"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Exit
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Peggy AI Assistant */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="p-4 border-b bg-background/80 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Peggy AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Your deal negotiation advisor</p>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "assistant" ? (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback>{currentUserName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[85%] ${msg.role === "user" ? "text-right" : ""}`}>
                      <div className={`inline-block rounded-lg p-3 text-sm ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-background border shadow-sm"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-background border rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={aiScrollRef} />
              </div>
            </ScrollArea>
            
            {/* Quick Questions */}
            <div className="px-4 py-2 border-t bg-background/50">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Quick questions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickAiQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setAiInput(q);
                      setTimeout(() => handleAskPeggy(), 100);
                    }}
                    data-testid={`button-quick-question-${i}`}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-background/80">
              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask Peggy about this deal..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAskPeggy()}
                  disabled={isAiLoading}
                  data-testid="input-ai-question"
                />
                <Button 
                  onClick={handleAskPeggy} 
                  disabled={isAiLoading || !aiInput.trim()}
                  data-testid="button-ask-peggy"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
