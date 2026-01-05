import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  DollarSign,
  Handshake,
  UserPlus,
  Building2,
  TrendingUp,
  Percent,
  FileText,
  Send,
  Info,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export interface JVRequestData {
  partnerRole: "deal_bringer" | "buyer_bringer";
  assignmentFeeSplit: number;
  expectedFee: number;
  partnerContribution: string;
  myContribution: string;
  dealTerms: string;
  notes?: string;
}

interface JVRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealInfo: {
    id: string;
    propertyAddress: string;
    askingPrice: number;
    assignmentFee?: number;
  };
  onSubmit: (data: JVRequestData) => void;
}

const PARTNER_ROLES = [
  {
    value: "deal_bringer",
    label: "I'm Bringing the Deal",
    description: "You have the property under contract and need a partner with a cash buyer",
    icon: Building2,
  },
  {
    value: "buyer_bringer",
    label: "I'm Bringing the Buyer",
    description: "You have a qualified cash buyer and need a partner with a deal",
    icon: UserPlus,
  },
];

const CONTRIBUTION_OPTIONS = [
  "Cash buyer relationship",
  "Deal sourcing & contract",
  "Due diligence & analysis",
  "Marketing & disposition",
  "Transaction coordination",
  "EMD funding",
  "Title/escrow coordination",
];

export function JVRequestForm({
  open,
  onOpenChange,
  dealInfo,
  onSubmit,
}: JVRequestFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [partnerRole, setPartnerRole] = useState<"deal_bringer" | "buyer_bringer">("deal_bringer");
  const [assignmentFeeSplit, setAssignmentFeeSplit] = useState(50);
  const [expectedFee, setExpectedFee] = useState(dealInfo.assignmentFee || 10000);
  const [partnerContribution, setPartnerContribution] = useState("");
  const [myContribution, setMyContribution] = useState("");
  const [dealTerms, setDealTerms] = useState("standard");
  const [notes, setNotes] = useState("");

  const myShare = Math.round(expectedFee * (assignmentFeeSplit / 100));
  const partnerShare = expectedFee - myShare;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = () => {
    onSubmit({
      partnerRole,
      assignmentFeeSplit,
      expectedFee,
      partnerContribution,
      myContribution,
      dealTerms,
      notes: notes || undefined,
    });
  };

  const canProceedStep1 = partnerRole !== null;
  const canProceedStep2 = myContribution && partnerContribution;
  const canSubmit = canProceedStep1 && canProceedStep2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">JV Partnership Request</DialogTitle>
              <DialogDescription className="text-sm">
                Partner with another wholesaler on this deal
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-background/80 border">
            <p className="text-xs text-muted-foreground">Property</p>
            <p className="text-sm font-medium truncate">{dealInfo.propertyAddress}</p>
          </div>
        </DialogHeader>

        <div className="flex border-b">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s as 1 | 2 | 3)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                step === s
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : step > s
                  ? "text-green-600 bg-green-500/5"
                  : "text-muted-foreground"
              }`}
            >
              {step > s && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
              {s === 1 ? "Your Role" : s === 2 ? "Fee Split" : "Review"}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium mb-3 block">What's your role in this JV?</Label>
                  <RadioGroup
                    value={partnerRole}
                    onValueChange={(v) => setPartnerRole(v as "deal_bringer" | "buyer_bringer")}
                    className="space-y-3"
                  >
                    {PARTNER_ROLES.map((role) => {
                      const Icon = role.icon;
                      return (
                        <label
                          key={role.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            partnerRole === role.value
                              ? "border-primary bg-primary/5"
                              : "hover:border-muted-foreground/50"
                          }`}
                        >
                          <RadioGroupItem value={role.value} className="mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">{role.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-amber-700 mb-1">JV Partner Guidelines</p>
                      <p>Properties can be purchased by developers, flippers, builders, and dreamscapers. Other wholesalers cannot purchase deals directly - they can only JV partner with you.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <Label className="text-sm font-medium mb-2 block">Expected Assignment Fee</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={expectedFee}
                      onChange={(e) => setExpectedFee(Number(e.target.value))}
                      className="pl-8"
                      data-testid="input-expected-fee"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Fee Split</Label>
                    <Badge variant="outline" className="text-xs">
                      <Percent className="w-3 h-3 mr-1" />
                      {assignmentFeeSplit}% / {100 - assignmentFeeSplit}%
                    </Badge>
                  </div>
                  <Slider
                    value={[assignmentFeeSplit]}
                    onValueChange={(v) => setAssignmentFeeSplit(v[0])}
                    min={10}
                    max={90}
                    step={5}
                    className="mb-3"
                    data-testid="slider-fee-split"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-primary/5">
                      <p className="text-xs text-muted-foreground">Your Share</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(myShare)}</p>
                      <p className="text-xs text-muted-foreground">{assignmentFeeSplit}%</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <p className="text-xs text-muted-foreground">Partner Share</p>
                      <p className="text-lg font-bold">{formatCurrency(partnerShare)}</p>
                      <p className="text-xs text-muted-foreground">{100 - assignmentFeeSplit}%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Your Contribution</Label>
                    <Select value={myContribution} onValueChange={setMyContribution}>
                      <SelectTrigger data-testid="select-my-contribution">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRIBUTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Partner Contribution</Label>
                    <Select value={partnerContribution} onValueChange={setPartnerContribution}>
                      <SelectTrigger data-testid="select-partner-contribution">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRIBUTION_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    JV Agreement Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Role</span>
                      <span className="font-medium">
                        {partnerRole === "deal_bringer" ? "Deal Bringer" : "Buyer Bringer"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Fee</span>
                      <span className="font-medium">{formatCurrency(expectedFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Share</span>
                      <span className="font-medium text-primary">{formatCurrency(myShare)} ({assignmentFeeSplit}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Partner Share</span>
                      <span className="font-medium">{formatCurrency(partnerShare)} ({100 - assignmentFeeSplit}%)</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You Provide</span>
                      <span className="font-medium">{myContribution || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Partner Provides</span>
                      <span className="font-medium">{partnerContribution || "—"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Additional Notes (optional)</Label>
                  <Textarea
                    placeholder="Any special terms, timeline preferences, or requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[80px] resize-none"
                    data-testid="input-jv-notes"
                  />
                </div>

                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-green-700 mb-1">Ready to Partner!</p>
                      <p>Your JV request will be sent to potential partners. They'll review your terms and can accept, counter, or decline.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t flex gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep((step + 1) as 2 | 3)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex-1"
              data-testid="button-jv-next"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 gap-2"
              data-testid="button-submit-jv"
            >
              <Send className="w-4 h-4" />
              Submit JV Request
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
