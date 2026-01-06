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

// FORM A: Wholesale Assignment Offer - buyer/operator taking a contract
// FORM B: Wholesale JV Request - wholesaler partnering with another wholesaler  
// FORM C: Capital Raise Terms - operator/dreamscaper listing capital raise
// FORM D: Capital Investment - investor counter terms on capital raise
export type NegotiationType = "wholesale_offer" | "wholesale_jv" | "capital_raise" | "capital_invest";

// Legacy type support for backward compatibility
export type LegacyNegotiationType = "wholesale" | "capital";

export interface WholesaleOfferTerms {
  assignmentFee: number;
  earnestMoney: number;
  closingDate: string;
  inspectionPeriod: number;
  message?: string;
}

export interface WholesaleJVTerms {
  assignmentSplitPercent: number;
  partnerRole: "deal_bringer" | "buyer_bringer";
  message?: string;
}

export interface CapitalRaiseTerms {
  capitalTarget: number;
  minimumInvestment: number;
  structureType: "debt" | "equity" | "hybrid";
  proposedReturns: number;
  profitSplit: number;
  timeline: number;
  amountRaised?: number;
}

export interface CapitalInvestTerms {
  investmentAmount: number;
  expectedReturn: number;
  profitSplit: number;
  termMonths: number;
  message?: string;
}

// Union type for all negotiation terms
export interface NegotiationTerms {
  // Wholesale Offer (Form A)
  assignmentFee?: number;
  earnestMoney?: number;
  closingDate?: string;
  inspectionPeriod?: number;
  
  // Wholesale JV (Form B)
  assignmentSplitPercent?: number;
  partnerRole?: "deal_bringer" | "buyer_bringer";
  
  // Capital Raise (Form C)
  capitalTarget?: number;
  minimumInvestment?: number;
  structureType?: "debt" | "equity" | "hybrid";
  proposedReturns?: number;
  amountRaised?: number;
  
  // Capital Investment (Form D)
  investmentAmount?: number;
  expectedReturn?: number;
  profitSplit?: number;
  termMonths?: number;
  
  // Shared
  message?: string;
  notes?: string;
  
  // Legacy fields (for backward compatibility)
  purchasePrice?: number;
  contractPrice?: number;
  timeline?: number;
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

  // Helper to get form type label
  const getFormTypeLabel = () => {
    switch (type) {
      case "wholesale_offer": return "Wholesale Assignment Offer";
      case "wholesale_jv": return "JV Partnership Request";
      case "capital_raise": return "Capital Raise Terms";
      case "capital_invest": return "Capital Investment";
      default: return "Negotiation";
    }
  };

  // Helper to check if this is a wholesale type
  const isWholesaleType = type === "wholesale_offer" || type === "wholesale_jv";
  const isCapitalType = type === "capital_raise" || type === "capital_invest";

  useEffect(() => {
    if (open) {
      // Initialize terms based on form type
      let enrichedTerms: NegotiationTerms = { ...originalTerms };
      
      if (type === "wholesale_offer") {
        enrichedTerms = {
          assignmentFee: originalTerms.assignmentFee || 0,
          earnestMoney: originalTerms.earnestMoney || 1000,
          closingDate: originalTerms.closingDate || "",
          inspectionPeriod: originalTerms.inspectionPeriod || 10,
          message: "",
        };
      } else if (type === "wholesale_jv") {
        enrichedTerms = {
          assignmentSplitPercent: originalTerms.assignmentSplitPercent || 50,
          partnerRole: originalTerms.partnerRole || "deal_bringer",
          message: "",
        };
      } else if (type === "capital_raise") {
        enrichedTerms = {
          capitalTarget: originalTerms.capitalTarget || 0,
          minimumInvestment: originalTerms.minimumInvestment || 25000,
          structureType: originalTerms.structureType || "equity",
          proposedReturns: originalTerms.proposedReturns || 15,
          profitSplit: originalTerms.profitSplit || 70,
          timeline: originalTerms.timeline || 24,
          amountRaised: originalTerms.amountRaised || 0,
        };
      } else if (type === "capital_invest") {
        enrichedTerms = {
          investmentAmount: originalTerms.investmentAmount || 0,
          expectedReturn: originalTerms.expectedReturn || originalTerms.proposedReturns || 15,
          profitSplit: originalTerms.profitSplit || 70,
          termMonths: originalTerms.termMonths || originalTerms.timeline || 24,
          message: "",
        };
      }
      
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
      
      const typeDescription = isWholesaleType ? "wholesale deal" : "capital raise";
      setAiMessages([{
        role: "assistant",
        content: `Hi! I'm Peggy, your AI negotiation assistant. I'm here to help you analyze this ${typeDescription} and guide you through the negotiation. What would you like to know about the deal terms?`
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
    switch (type) {
      case "wholesale_offer":
        return !!(proposedTerms.assignmentFee && proposedTerms.assignmentFee > 0);
      case "wholesale_jv":
        return !!(proposedTerms.assignmentSplitPercent && proposedTerms.partnerRole);
      case "capital_raise":
        return !!(proposedTerms.capitalTarget && proposedTerms.capitalTarget > 0 && proposedTerms.structureType);
      case "capital_invest":
        return !!(proposedTerms.investmentAmount && proposedTerms.investmentAmount > 0);
      default:
        return false;
    }
  };

  const calculateTermsDifference = () => {
    const diffs: { field: string; original: string; proposed: string; change: string }[] = [];
    
    if (type === "wholesale_offer") {
      if (originalTerms.assignmentFee !== proposedTerms.assignmentFee) {
        const diff = (proposedTerms.assignmentFee || 0) - (originalTerms.assignmentFee || 0);
        diffs.push({
          field: "Assignment Fee",
          original: formatCurrency(originalTerms.assignmentFee),
          proposed: formatCurrency(proposedTerms.assignmentFee),
          change: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
        });
      }
      if (originalTerms.earnestMoney !== proposedTerms.earnestMoney) {
        const diff = (proposedTerms.earnestMoney || 0) - (originalTerms.earnestMoney || 0);
        diffs.push({
          field: "Earnest Money",
          original: formatCurrency(originalTerms.earnestMoney),
          proposed: formatCurrency(proposedTerms.earnestMoney),
          change: diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)
        });
      }
    } else if (type === "wholesale_jv") {
      if (originalTerms.assignmentSplitPercent !== proposedTerms.assignmentSplitPercent) {
        const diff = (proposedTerms.assignmentSplitPercent || 0) - (originalTerms.assignmentSplitPercent || 0);
        diffs.push({
          field: "Assignment Split",
          original: `${originalTerms.assignmentSplitPercent || 50}%`,
          proposed: `${proposedTerms.assignmentSplitPercent || 50}%`,
          change: diff > 0 ? `+${diff}%` : `${diff}%`
        });
      }
    } else if (type === "capital_invest") {
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

  const getQuickAiQuestions = () => {
    switch (type) {
      case "wholesale_offer":
        return [
          "Is this assignment fee competitive?",
          "What's a fair earnest money amount?",
          "Recommended inspection period?",
          "Red flags to watch for?"
        ];
      case "wholesale_jv":
        return [
          "Is this split fair for my role?",
          "What should I contribute?",
          "How to structure the JV agreement?",
          "Protect myself in the partnership?"
        ];
      case "capital_raise":
        return [
          "Are my returns competitive?",
          "What structure attracts investors?",
          "How to present the opportunity?",
          "Common investor concerns?"
        ];
      case "capital_invest":
        return [
          "Is this profit split fair?",
          "What return should I expect?",
          "Evaluate the risk/reward",
          "Key risks to consider?"
        ];
      default:
        return [];
    }
  };

  const quickAiQuestions = getQuickAiQuestions();

  // FORM A: Wholesale Assignment Offer
  // Used when buyer/operator wants to take a contract
  // Fields: assignment fee, earnest money, close date, inspection, message
  // NO financing, NO investment terms
  const renderWholesaleOfferForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Assignment Offer Terms
          </CardTitle>
          <CardDescription className="text-xs">
            Submit your offer to take this wholesale contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Assignment Fee *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={proposedTerms.assignmentFee || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, assignmentFee: Number(e.target.value) }))}
                  className="pl-9"
                  placeholder="10000"
                  data-testid="input-assignment-fee"
                />
              </div>
              <p className="text-xs text-muted-foreground">Fee paid to wholesaler for assignment</p>
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
                  placeholder="1000"
                  data-testid="input-earnest-money"
                />
              </div>
              <p className="text-xs text-muted-foreground">Deposit to secure the contract</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Proposed Close Date</Label>
            <Input
              type="date"
              value={proposedTerms.closingDate || ""}
              onChange={(e) => setProposedTerms(prev => ({ ...prev, closingDate: e.target.value }))}
              data-testid="input-closing-date"
            />
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Message to Wholesaler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={proposedTerms.message || ""}
            onChange={(e) => setProposedTerms(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Introduce yourself and explain why you're a good fit for this deal..."
            className="min-h-[80px]"
            data-testid="textarea-message"
          />
        </CardContent>
      </Card>
    </div>
  );

  // FORM B: Wholesale JV Request
  // Used when a wholesaler wants to JV with another wholesaler
  // Fields: proposed assignment split, who brings buyer, message
  // NO funding source, NO investment strategy fields
  const renderWholesaleJVForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary" />
            JV Partnership Terms
          </CardTitle>
          <CardDescription className="text-xs">
            Partner with this wholesaler on the assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Your Role in Partnership</Label>
            <Select
              value={proposedTerms.partnerRole || "deal_bringer"}
              onValueChange={(value: "deal_bringer" | "buyer_bringer") => setProposedTerms(prev => ({ ...prev, partnerRole: value }))}
            >
              <SelectTrigger data-testid="select-partner-role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deal_bringer">I'm Bringing the Deal</SelectItem>
                <SelectItem value="buyer_bringer">I'm Bringing the Buyer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {proposedTerms.partnerRole === "buyer_bringer" 
                ? "You have a qualified cash buyer and need a deal" 
                : "You have a deal under contract and need a buyer"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Assignment Fee Split (Your Share)</Label>
            <div className="space-y-2">
              <Slider
                value={[proposedTerms.assignmentSplitPercent || 50]}
                onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, assignmentSplitPercent: value }))}
                max={90}
                min={10}
                step={5}
                data-testid="slider-assignment-split"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">10%</span>
                <span className="font-medium text-primary">{proposedTerms.assignmentSplitPercent || 50}% You / {100 - (proposedTerms.assignmentSplitPercent || 50)}% Partner</span>
                <span className="text-muted-foreground">90%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Message to Partner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={proposedTerms.message || ""}
            onChange={(e) => setProposedTerms(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Describe what you bring to this partnership and why it would be mutually beneficial..."
            className="min-h-[80px]"
            data-testid="textarea-jv-message"
          />
        </CardContent>
      </Card>
    </div>
  );

  // FORM C: Capital Raise Terms (Operator Listing)
  // Used by Dreamscaper/operator to raise capital
  // Fields: capital target, minimum investment, structure type, proposed returns, profit split, timeline
  // Shows capital progress bar
  const renderCapitalRaiseForm = () => {
    const fundingProgress = proposedTerms.capitalTarget && proposedTerms.amountRaised 
      ? Math.min((proposedTerms.amountRaised / proposedTerms.capitalTarget) * 100, 100)
      : 0;

    return (
      <div className="space-y-4">
        {proposedTerms.capitalTarget && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Funding Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={fundingProgress} className="h-3" />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {formatCurrency(proposedTerms.amountRaised || 0)} raised
                </span>
                <span className="font-medium text-primary">{Math.round(fundingProgress)}%</span>
                <span className="text-muted-foreground">
                  of {formatCurrency(proposedTerms.capitalTarget)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Capital Raise Structure
            </CardTitle>
            <CardDescription className="text-xs">
              Define your capital raise parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Capital Target *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={proposedTerms.capitalTarget || ""}
                    onChange={(e) => setProposedTerms(prev => ({ ...prev, capitalTarget: Number(e.target.value) }))}
                    className="pl-9"
                    placeholder="500000"
                    data-testid="input-capital-target"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium">Minimum Investment</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={proposedTerms.minimumInvestment || ""}
                    onChange={(e) => setProposedTerms(prev => ({ ...prev, minimumInvestment: Number(e.target.value) }))}
                    className="pl-9"
                    placeholder="25000"
                    data-testid="input-min-investment"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Structure Type *</Label>
              <Select
                value={proposedTerms.structureType || "equity"}
                onValueChange={(value: "debt" | "equity" | "hybrid") => setProposedTerms(prev => ({ ...prev, structureType: value }))}
              >
                <SelectTrigger data-testid="select-structure-type">
                  <SelectValue placeholder="Select structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equity">Equity Investment</SelectItem>
                  <SelectItem value="debt">Debt / Fixed Return</SelectItem>
                  <SelectItem value="hybrid">Hybrid (Debt + Equity)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Returns & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Proposed Returns (%)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[proposedTerms.proposedReturns || 15]}
                    onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, proposedReturns: value }))}
                    max={30}
                    min={5}
                    step={1}
                    data-testid="slider-proposed-returns"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5%</span>
                    <span className="font-medium text-foreground">{proposedTerms.proposedReturns || 15}%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Profit Split (Investor Share)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[proposedTerms.profitSplit || 70]}
                    onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, profitSplit: value }))}
                    max={90}
                    min={50}
                    step={5}
                    data-testid="slider-profit-split"
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">50%</span>
                    <span className="font-medium text-primary">{proposedTerms.profitSplit || 70}% Investor / {100 - (proposedTerms.profitSplit || 70)}% Operator</span>
                    <span className="text-muted-foreground">90%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Project Timeline (months)</Label>
              <div className="space-y-2">
                <Slider
                  value={[proposedTerms.timeline || 24]}
                  onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, timeline: value }))}
                  max={60}
                  min={6}
                  step={6}
                  data-testid="slider-timeline"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>6 mo</span>
                  <span className="font-medium text-foreground">{proposedTerms.timeline || 24} months</span>
                  <span>60 mo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // FORM D: Capital Investment / Counter Terms
  // Used by investors on capital raise deals
  // Actions: Accept terms or Counter terms
  // Fields: investment amount, return, profit split, term
  const renderCapitalInvestForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Your Investment Offer
          </CardTitle>
          <CardDescription className="text-xs">
            Submit your investment terms for this capital raise
          </CardDescription>
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
                placeholder="50000"
                data-testid="input-investment-amount"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum: {formatCurrency(originalTerms.minimumInvestment || 25000)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="w-4 h-4 text-primary" />
            Proposed Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Expected Return (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[proposedTerms.expectedReturn || 15]}
                onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, expectedReturn: value }))}
                max={30}
                min={5}
                step={1}
                data-testid="slider-expected-return"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span className="font-medium text-foreground">{proposedTerms.expectedReturn || 15}%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Profit Split (Your Share)</Label>
            <div className="space-y-2">
              <Slider
                value={[proposedTerms.profitSplit || 70]}
                onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, profitSplit: value }))}
                max={90}
                min={50}
                step={5}
                data-testid="slider-investor-profit-split"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">50%</span>
                <span className="font-medium text-primary">{proposedTerms.profitSplit || 70}%</span>
                <span className="text-muted-foreground">90%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Investment Term (months)</Label>
            <div className="space-y-2">
              <Slider
                value={[proposedTerms.termMonths || 24]}
                onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, termMonths: value }))}
                max={60}
                min={6}
                step={6}
                data-testid="slider-term-months"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 mo</span>
                <span className="font-medium text-foreground">{proposedTerms.termMonths || 24} months</span>
                <span>60 mo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Message to Operator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={proposedTerms.message || ""}
            onChange={(e) => setProposedTerms(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Introduce yourself and explain your investment experience..."
            className="min-h-[80px]"
            data-testid="textarea-invest-message"
          />
        </CardContent>
      </Card>
    </div>
  );

  // Master form renderer that selects the appropriate form based on type
  const renderTermsForm = () => {
    switch (type) {
      case "wholesale_offer":
        return renderWholesaleOfferForm();
      case "wholesale_jv":
        return renderWholesaleJVForm();
      case "capital_raise":
        return renderCapitalRaiseForm();
      case "capital_invest":
        return renderCapitalInvestForm();
      default:
        return renderWholesaleOfferForm();
    }
  };

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
                  {msg.terms.expectedReturn && (
                    <div>
                      <span className="text-muted-foreground">Return: </span>
                      <span className="font-medium">{msg.terms.expectedReturn}%</span>
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
                {isWholesaleType ? <Home className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {getFormTypeLabel()}
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
                  {renderTermsForm()}
                  
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
