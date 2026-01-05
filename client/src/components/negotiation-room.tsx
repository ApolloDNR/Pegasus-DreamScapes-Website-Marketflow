import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  History
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
  notes?: string;
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
  const [activeTab, setActiveTab] = useState<"negotiate" | "history">("negotiate");
  const [message, setMessage] = useState("");
  const [proposedTerms, setProposedTerms] = useState<NegotiationTerms>({});
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setProposedTerms({ ...originalTerms });
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
    }
  }, [open, dealId, originalTerms, counterpartyId, counterpartyName, dealTitle]);

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

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "TBD";
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const renderTermsCard = (terms: NegotiationTerms, label: string, isEditable: boolean = false) => (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {type === "wholesale" ? <Home className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {type === "capital" ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Investment Amount</Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={proposedTerms.investmentAmount || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, investmentAmount: Number(e.target.value) }))}
                  className="h-8"
                  data-testid="input-investment-amount"
                />
              ) : (
                <p className="font-semibold">{formatCurrency(terms.investmentAmount)}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Interest Rate</Label>
                {isEditable ? (
                  <div className="space-y-2">
                    <Slider
                      value={[proposedTerms.interestRate || 8]}
                      onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, interestRate: value }))}
                      max={20}
                      min={4}
                      step={0.5}
                      data-testid="slider-interest-rate"
                    />
                    <span className="text-sm font-medium">{proposedTerms.interestRate || 8}%</span>
                  </div>
                ) : (
                  <p className="font-semibold">{terms.interestRate}%</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Profit Split</Label>
                {isEditable ? (
                  <div className="space-y-2">
                    <Slider
                      value={[proposedTerms.profitSplit || 50]}
                      onValueChange={([value]) => setProposedTerms(prev => ({ ...prev, profitSplit: value }))}
                      max={90}
                      min={10}
                      step={5}
                      data-testid="slider-profit-split"
                    />
                    <span className="text-sm font-medium">{proposedTerms.profitSplit || 50}%</span>
                  </div>
                ) : (
                  <p className="font-semibold">{terms.profitSplit}%</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Duration (months)</Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={proposedTerms.duration || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  className="h-8"
                  data-testid="input-duration"
                />
              ) : (
                <p className="font-semibold">{terms.duration} months</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Purchase Price</Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={proposedTerms.purchasePrice || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                  className="h-8"
                  data-testid="input-purchase-price"
                />
              ) : (
                <p className="font-semibold">{formatCurrency(terms.purchasePrice)}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Assignment Fee</Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={proposedTerms.assignmentFee || ""}
                  onChange={(e) => setProposedTerms(prev => ({ ...prev, assignmentFee: Number(e.target.value) }))}
                  className="h-8"
                  data-testid="input-assignment-fee"
                />
              ) : (
                <p className="font-semibold">{formatCurrency(terms.assignmentFee)}</p>
              )}
            </div>
          </>
        )}
        
        {isEditable && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              value={proposedTerms.notes || ""}
              onChange={(e) => setProposedTerms(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes or conditions..."
              className="h-20 resize-none"
              data-testid="textarea-notes"
            />
          </div>
        )}
      </CardContent>
    </Card>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" />
                Negotiation Room
              </DialogTitle>
              <DialogDescription className="mt-1">
                Negotiate terms for: {dealTitle}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <User className="w-3 h-3" />
              with {counterpartyName}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Original Terms
              </h3>
              {renderTermsCard(originalTerms, "Poster's Ask", false)}
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                Your Counter Offer
              </h3>
              {renderTermsCard(proposedTerms, "Your Proposed Terms", true)}
              
              <Button 
                className="w-full mt-3" 
                onClick={handleSendCounterOffer}
                disabled={isSubmitting}
                data-testid="button-send-counter"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Counter Offer"}
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
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
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAcceptTerms}
                  disabled={isSubmitting}
                  data-testid="button-accept-and-close"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Processing..." : "Accept Current Terms"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
