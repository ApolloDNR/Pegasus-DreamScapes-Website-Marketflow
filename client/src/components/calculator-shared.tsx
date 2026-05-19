import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePeggyContext } from "@/contexts/peggy-context";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { 
  Save, 
  FileText, 
  Share2, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Download,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";

interface CalculatorResult {
  calculatorType: string;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string | boolean>;
  timestamp?: string;
}

export interface ProjectionPoint {
  year: number;
  value: number;
}

export interface ProjectionSeries {
  name: string;
  points: ProjectionPoint[];
}

export interface ProjectionSpec {
  title: string;
  yLabel?: string;
  format?: "currency" | "percent" | "number";
  series: ProjectionSeries[];
}

export const PROJECTION_KEY = "__projection";

export function extractProjection(
  results: Record<string, unknown> | null | undefined,
): ProjectionSpec | null {
  if (!results) return null;
  const raw = (results as Record<string, unknown>)[PROJECTION_KEY];
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<ProjectionSpec>;
  if (!Array.isArray(p.series) || p.series.length === 0) return null;

  const cleanSeries: ProjectionSeries[] = [];
  for (const s of p.series) {
    if (!s || typeof s !== "object") continue;
    const name = typeof (s as ProjectionSeries).name === "string" ? (s as ProjectionSeries).name : "";
    const points = Array.isArray((s as ProjectionSeries).points) ? (s as ProjectionSeries).points : [];
    const cleanPoints: ProjectionPoint[] = [];
    for (const pt of points) {
      if (!pt || typeof pt !== "object") continue;
      const year = (pt as ProjectionPoint).year;
      const value = (pt as ProjectionPoint).value;
      if (typeof year !== "number" || typeof value !== "number" || !Number.isFinite(year) || !Number.isFinite(value)) continue;
      cleanPoints.push({ year, value });
    }
    if (cleanPoints.length === 0) continue;
    cleanSeries.push({ name, points: cleanPoints });
  }
  if (cleanSeries.length === 0) return null;

  return {
    title: typeof p.title === "string" ? p.title : "Projection",
    yLabel: typeof p.yLabel === "string" ? p.yLabel : undefined,
    format: p.format === "currency" || p.format === "percent" || p.format === "number" ? p.format : undefined,
    series: cleanSeries,
  };
}

interface CalculatorActionsProps {
  calculatorType: string;
  inputs: Record<string, number | string>;
  outputs: Record<string, number | string | boolean | ProjectionSpec | null | undefined>;
  onAskPeggy?: () => void;
  disabled?: boolean;
}

export function CalculatorActions({ 
  calculatorType, 
  inputs, 
  outputs, 
  onAskPeggy,
  disabled = false 
}: CalculatorActionsProps) {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [analysisSaved, setAnalysisSaved] = useState(false);
  const [analysisName, setAnalysisName] = useState("");
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const { setCalculatorData, openChat, setPendingPrompt } = usePeggyContext();
  const { isAuthenticated } = useSupabaseAuth();
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; notes: string; thenShare?: boolean }) => {
      // Pull primary metric label/value for quick-display columns.
      const primary = pickPrimary(calculatorType, outputs);
      const res = await apiRequest("POST", "/api/saved-analyses", {
        name: data.name,
        calculatorType,
        inputs,
        results: outputs,
        primaryMetric: primary.label,
        primaryValue: primary.value,
        notes: data.notes,
      });
      const saved = await res.json();
      if (data.thenShare && saved?.id) {
        const shareRes = await apiRequest("PATCH", `/api/saved-analyses/${saved.id}`, {
          isShared: true,
        });
        return shareRes.json();
      }
      return saved;
    },
    onSuccess: (saved: { shareToken?: string | null }, vars) => {
      setAnalysisSaved(true);
      setSaveDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/saved-analyses"] });
      if (vars.thenShare && saved?.shareToken) {
        const url = `${window.location.origin}/snapshot/calc/${saved.shareToken}`;
        setShareUrl(url);
        navigator.clipboard?.writeText(url).catch(() => undefined);
        setShareDialogOpen(true);
      } else {
        toast({
          title: "Analysis Saved",
          description: "Open My Analyses to revisit, share, or compare scenarios.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pdfMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/pdf/calculator", {
        calculatorType,
        inputs,
        outputs,
      });
      const blob = await res.blob();
      return blob;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${calculatorType}-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "PDF Generated",
        description: "Your analysis has been downloaded as a PDF.",
      });
    },
    onError: () => {
      toast({
        title: "PDF Generation Unavailable",
        description: "PDF export will be available soon.",
      });
    },
  });

  const handleShare = () => {
    if (!isAuthenticated) {
      setSignInPromptOpen(true);
      return;
    }
    // Open save dialog with thenShare=true so the URL is tokenized via the
    // server (no base64 payload in the URL — that's a privacy + size hazard).
    setSaveDialogOpen(true);
  };

  const copyShareUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Link Copied", description: "Public read-only link copied to clipboard." });
    });
  };

  const handleAskPeggy = () => {
    setCalculatorData(calculatorType, inputs, outputs);
    setPendingPrompt(buildAskPeggyPrompt(calculatorType, outputs));
    openChat();
    if (onAskPeggy) {
      onAskPeggy();
    }
  };

  const handleSave = (thenShare: boolean = false) => {
    if (!isAuthenticated) {
      setSignInPromptOpen(true);
      return;
    }
    if (!analysisName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for this analysis.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate({ name: analysisName, notes: analysisNotes, thenShare });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (isAuthenticated ? setSaveDialogOpen(true) : setSignInPromptOpen(true))}
          disabled={disabled || analysisSaved}
          data-testid="button-save-analysis"
        >
          {analysisSaved ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {analysisSaved ? "Saved" : "Save"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => pdfMutation.mutate()}
          disabled={disabled || pdfMutation.isPending}
          data-testid="button-pdf-export"
        >
          {pdfMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          PDF
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={disabled}
          data-testid="button-share-analysis"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          Share
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleAskPeggy}
          disabled={disabled}
          className="bg-primary/90 hover:bg-primary"
          data-testid="button-ask-peggy"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask Peggy
        </Button>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Analysis</DialogTitle>
            <DialogDescription>
              Save this {calculatorType.toUpperCase()} analysis to your account for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="analysis-name">Analysis Name</Label>
              <Input
                id="analysis-name"
                placeholder="e.g., 123 Main St Flip Analysis"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                data-testid="input-analysis-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="analysis-notes">Notes (optional)</Label>
              <Textarea
                id="analysis-notes"
                placeholder="Add any notes about this analysis..."
                value={analysisNotes}
                onChange={(e) => setAnalysisNotes(e.target.value)}
                rows={3}
                data-testid="input-analysis-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(false)}
              disabled={saveMutation.isPending}
              data-testid="button-confirm-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save
            </Button>
            <Button
              variant="default"
              onClick={() => handleSave(true)}
              disabled={saveMutation.isPending}
              data-testid="button-confirm-save-and-share"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Save & Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Public link ready</DialogTitle>
            <DialogDescription>
              Anyone with this read-only link can view the analysis. They cannot edit, save, or see other deals.
            </DialogDescription>
          </DialogHeader>
          {shareUrl && (
            <div className="flex items-center gap-2 p-2 rounded border border-border bg-muted/40">
              <Input
                value={shareUrl}
                readOnly
                className="text-xs font-mono"
                data-testid="input-share-url"
              />
              <Button size="sm" variant="outline" onClick={copyShareUrl} data-testid="button-copy-share-url">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signInPromptOpen} onOpenChange={setSignInPromptOpen}>
        <DialogContent data-testid="dialog-signin-prompt">
          <DialogHeader>
            <DialogTitle>Sign in to save and share</DialogTitle>
            <DialogDescription>
              Calculators are free to use without an account. Saving and sharing analyses needs sign-in
              so your work is yours, and so the public link is tied to your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignInPromptOpen(false)}>
              Not now
            </Button>
            <Button asChild data-testid="button-signin-redirect">
              <a href="/api/login">Sign in</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AdvancedOptionsProps {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
}

export function AdvancedOptions({ children, title = "Advanced Options", defaultOpen = false }: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-4 h-auto hover:bg-muted/50"
          data-testid="button-toggle-advanced"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Info className="w-4 h-4" />
            {title}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2 px-4 pb-4 bg-muted/30 rounded-lg">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export function MetricCard({ label, value, subtext, trend, status, size = "md" }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getStatusColor = () => {
    switch (status) {
      case "success": return "text-green-500";
      case "warning": return "text-amber-500";
      case "danger": return "text-red-500";
      case "info": return "text-blue-500";
      default: return "";
    }
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const valueClasses = {
    sm: "text-lg font-bold",
    md: "text-xl font-bold",
    lg: "text-3xl font-bold",
  };

  return (
    <div className={`bg-background rounded-lg ${sizeClasses[size]}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`${valueClasses[size]} ${getStatusColor()}`}>{value}</p>
        {getTrendIcon()}
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  status?: "success" | "warning" | "danger" | "info";
  showPercentage?: boolean;
}

export function ProgressBar({ label, value, max = 100, status, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getStatusColor = () => {
    switch (status) {
      case "success": return "bg-green-500";
      case "warning": return "bg-amber-500";
      case "danger": return "bg-red-500";
      case "info": return "bg-blue-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {showPercentage && (
          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  label: string;
  size?: "sm" | "md" | "lg";
  status?: "success" | "warning" | "danger";
}

export function ScoreRing({ score, maxScore = 100, label, size = "md", status }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100;
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;
  const radius = size === "sm" ? 30 : size === "md" ? 40 : 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (status === "success") return "stroke-green-500";
    if (status === "warning") return "stroke-amber-500";
    if (status === "danger") return "stroke-red-500";
    
    if (percentage >= 75) return "stroke-green-500";
    if (percentage >= 50) return "stroke-amber-500";
    return "stroke-red-500";
  };

  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`${getColor()} transition-all duration-700 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        <span className={`font-bold ${size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-3xl"}`}>
          {score}
        </span>
      </div>
      <span className="text-sm text-muted-foreground text-center">{label}</span>
    </div>
  );
}

interface DealGradeBadgeProps {
  grade: "A" | "B" | "C" | "D" | "F";
  size?: "sm" | "md" | "lg";
}

export function DealGradeBadge({ grade, size = "md" }: DealGradeBadgeProps) {
  const getGradeColor = () => {
    switch (grade) {
      case "A": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "B": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "C": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "D": return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      case "F": return "bg-red-500/20 text-red-500 border-red-500/30";
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-lg px-4 py-2 font-bold",
  };

  return (
    <Badge className={`${getGradeColor()} ${sizeClasses[size]}`}>
      Grade {grade}
    </Badge>
  );
}

interface StatusIndicatorProps {
  status: "pass" | "fail" | "warning";
  label: string;
  detail?: string;
}

export function StatusIndicator({ status, label, detail }: StatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pass": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "fail": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "pass": return "bg-green-500/10 border-green-500/20";
      case "fail": return "bg-red-500/10 border-red-500/20";
      case "warning": return "bg-amber-500/10 border-amber-500/20";
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusBg()}`}>
      {getStatusIcon()}
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}

interface BreakdownItemProps {
  label: string;
  value: string | number;
  percentage?: number;
  color?: string;
}

export function BreakdownChart({ items, title }: { items: BreakdownItemProps[]; title?: string }) {
  const colors = [
    "bg-primary",
    "bg-blue-500",
    "bg-green-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-orange-500",
  ];

  return (
    <div className="space-y-4">
      {title && <h4 className="font-medium text-sm">{title}</h4>}
      <div className="h-4 rounded-full bg-muted overflow-hidden flex">
        {items.map((item, index) => (
          <div
            key={index}
            className={`h-full ${item.color || colors[index % colors.length]} transition-all`}
            style={{ width: `${item.percentage || 0}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color || colors[index % colors.length]}`} />
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AssumptionsPanel + FormulaReveal
//
// Surfaced on every calculator's results card so users can see the hidden
// defaults driving the numbers (vacancy, closing, mgmt %, etc.) and the
// exact formula the engine used. No more silent defaults.
// ──────────────────────────────────────────────────────────────────────────

export interface AssumptionRow {
  label: string;
  value: string;
  /** Optional short note: where the default comes from. */
  note?: string;
}

export function AssumptionsPanel({
  assumptions,
  title = "Assumptions in play",
  triggerLabel = "Adjust assumptions",
}: {
  assumptions: AssumptionRow[];
  title?: string;
  /**
   * Explicit "Adjust assumptions" call-to-action shown next to the title so
   * users immediately see they can change the hidden defaults. Pass `null`
   * or empty string to hide it on a specific calculator.
   */
  triggerLabel?: string;
}) {
  if (assumptions.length === 0) return null;
  return (
    <Collapsible className="rounded-lg border border-border bg-muted/20" data-testid="assumptions-panel">
      <CollapsibleTrigger className="group w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover-elevate active-elevate-2 rounded-lg">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {triggerLabel && (
            <span className="text-[11px] font-supporting font-semibold text-primary underline-offset-2 group-hover:underline" data-testid="assumptions-trigger-label">
              {triggerLabel}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {assumptions.map((row, idx) => (
            <div key={idx} className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1.5">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate" data-testid={`assumption-label-${idx}`}>{row.label}</p>
                {row.note && <p className="text-[11px] text-muted-foreground leading-snug">{row.note}</p>}
              </div>
              <p className="font-medium tabular-nums text-foreground whitespace-nowrap" data-testid={`assumption-value-${idx}`}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface FormulaLine {
  label: string;
  expression: string;
  /** Optional plain-English clarifier. */
  note?: string;
}

export function FormulaReveal({
  formulas,
  title = "Show the math",
}: {
  formulas: FormulaLine[];
  title?: string;
}) {
  if (formulas.length === 0) return null;
  return (
    <Collapsible className="rounded-lg border border-border bg-muted/20" data-testid="formula-reveal">
      <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover-elevate active-elevate-2 rounded-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary">
            {title}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-1 space-y-2">
          {formulas.map((row, idx) => (
            <div key={idx} className="border-b border-border/40 py-1.5">
              <p className="text-[11px] uppercase tracking-[0.18em] font-supporting font-semibold text-muted-foreground mb-1">
                {row.label}
              </p>
              <p className="font-mono text-xs leading-relaxed text-foreground break-words" data-testid={`formula-expr-${idx}`}>
                {row.expression}
              </p>
              {row.note && <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{row.note}</p>}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * Inline validation banner used by calculators when user inputs require
 * surfacing rather than silently coercing to a default (e.g. 100% down,
 * 0 months held).
 */
export function ValidationNote({
  level = "warning",
  message,
  testId,
}: {
  level?: "warning" | "error" | "info";
  message: string;
  testId?: string;
}) {
  const tone =
    level === "error"
      ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
      : level === "info"
        ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
        : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300";
  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${tone}`}
      data-testid={testId ?? "validation-note"}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Map calculator outputs → primary metric label/value for saved-analysis
 * quick-display columns. Keeps the saved-analyses list scannable.
 */
const CALC_DISPLAY_NAMES: Record<string, string> = {
  arv: "ARV / Flip",
  roi: "Investment ROI",
  brrrr: "BRRRR",
  cashflow: "Cash Flow",
  mao: "Wholesale (MAO)",
  piti: "Mortgage / PITI",
  ownvsrent: "Own vs Rent",
  hardmoney: "Hard Money",
};

/**
 * Build the structural-read prompt that "Ask Peggy" auto-sends. Uses the
 * primary metric so Peggy has a number to anchor on, then asks for a
 * lane read, stress tests, and what's missing.
 */
export function buildAskPeggyPrompt(
  calculatorType: string,
  outputs: Record<string, unknown>,
): string {
  const displayName = CALC_DISPLAY_NAMES[calculatorType] ?? calculatorType.toUpperCase();
  const primary = pickPrimary(calculatorType, outputs);
  const headline = primary.label !== "Result"
    ? `${primary.label} came in at ${primary.value}.`
    : "";
  return [
    `I just ran the ${displayName} calculator on a property.`,
    headline,
    "Give me a structural read: which of the 8 outcome lanes most likely fits, what should I stress-test in these numbers, and what info is still missing for a real review?",
  ].filter(Boolean).join(" ");
}

export function pickPrimary(
  type: string,
  outputs: Record<string, unknown>,
): { label: string; value: string } {
  const fmt = (n: number) => formatCurrency(n);
  const pct = (n: number) => `${n.toFixed(1)}%`;
  switch (type) {
    case "arv":
      return { label: "ROI", value: pct(Number(outputs.roi) || 0) };
    case "roi":
      return { label: "Cash-on-Cash", value: pct(Number(outputs.cashOnCashReturn) || 0) };
    case "brrrr":
      return { label: "Cash Left", value: fmt(Number(outputs.cashLeftInDeal) || 0) };
    case "cashflow":
      return { label: "Monthly CF", value: fmt(Number(outputs.monthlyCashFlow) || 0) };
    case "mao":
      return { label: "MAO", value: fmt(Number(outputs.mao) || 0) };
    case "piti":
      return { label: "PITI / mo", value: fmt(Number(outputs.totalMonthly) || 0) };
    case "ownvsrent": {
      const yr =
        outputs.crossoverYearAt4 ??
        outputs.crossoverYear ??
        outputs.crossoverYearAt2 ??
        outputs.crossoverYearAt6;
      return { label: "Crossover (4%)", value: yr ? `Y${yr}` : "—" };
    }
    case "hardmoney":
      return { label: "Total Cost", value: fmt(Number(outputs.totalCostOfCapital) || 0) };
    default:
      return { label: "Result", value: "—" };
  }
}

export function calculateDealGrade(roi: number, cashFlow?: number, meetsRule?: boolean): "A" | "B" | "C" | "D" | "F" {
  let score = 0;
  
  if (roi >= 25) score += 40;
  else if (roi >= 20) score += 35;
  else if (roi >= 15) score += 30;
  else if (roi >= 10) score += 20;
  else if (roi >= 5) score += 10;
  else if (roi >= 0) score += 5;
  
  if (meetsRule !== undefined) {
    score += meetsRule ? 30 : 0;
  } else {
    score += 15;
  }
  
  if (cashFlow !== undefined) {
    if (cashFlow >= 500) score += 30;
    else if (cashFlow >= 300) score += 25;
    else if (cashFlow >= 200) score += 20;
    else if (cashFlow >= 100) score += 15;
    else if (cashFlow >= 0) score += 10;
  } else {
    score += 15;
  }
  
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}
