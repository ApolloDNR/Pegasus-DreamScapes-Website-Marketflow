import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Columns, 
  X, 
  Plus, 
  CheckCircle2, 
  XCircle,
  MapPin,
  DollarSign,
  TrendingUp,
  Home,
  ArrowRight,
  Sparkles,
  Building2
} from "lucide-react";

interface WholesaleDeal {
  id: string;
  propertyAddress?: string;
  address?: string;
  city?: string;
  state?: string;
  propertyType?: string;
  arv?: number;
  askingPrice?: number;
  contractPrice?: number;
  repairEstimate?: number;
  estimatedRepairs?: number;
  assignmentFee?: number;
  photos?: string[];
  images?: string[];
  status?: string;
  isPegasusDeal?: boolean;
  matchScore?: number;
  bedrooms?: number;
  bathrooms?: string;
  sqft?: number;
  yearBuilt?: number;
}

interface DealComparisonProps {
  availableDeals: WholesaleDeal[];
  onSelectDeal?: (deal: WholesaleDeal) => void;
}

export function DealComparisonButton({ 
  selectedDeals, 
  onToggle, 
  onClear,
  onCompare
}: { 
  selectedDeals: WholesaleDeal[];
  onToggle: () => void;
  onClear: () => void;
  onCompare: () => void;
}) {
  if (selectedDeals.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="shadow-md border-primary/30">
        <CardContent className="p-3 flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Columns className="w-3 h-3" />
            {selectedDeals.length} Selected
          </Badge>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClear} data-testid="button-clear-comparison">
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={onCompare}
              disabled={selectedDeals.length < 2}
              data-testid="button-compare-deals"
            >
              <Columns className="w-3 h-3 mr-1" />
              Compare {selectedDeals.length > 1 && `(${selectedDeals.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CompareCheckbox({ 
  deal, 
  isSelected, 
  onToggle,
  disabled 
}: { 
  deal: WholesaleDeal;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      size="sm"
      variant={isSelected ? "default" : "outline"}
      className="gap-1 text-xs"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      disabled={disabled && !isSelected}
      data-testid={`button-compare-toggle-${deal.id}`}
    >
      {isSelected ? (
        <>
          <CheckCircle2 className="w-3 h-3" />
          Selected
        </>
      ) : (
        <>
          <Plus className="w-3 h-3" />
          Compare
        </>
      )}
    </Button>
  );
}

interface ComparisonModalProps {
  deals: WholesaleDeal[];
  open: boolean;
  onClose: () => void;
  onAction?: (dealId: string, action: "accept" | "counter") => void;
}

export function ComparisonModal({ deals, open, onClose, onAction }: ComparisonModalProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "—";
    return num.toLocaleString();
  };

  const getProfit = (deal: WholesaleDeal) => {
    const arv = deal.arv || 0;
    const ask = deal.askingPrice || deal.contractPrice || 0;
    const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
    return arv - ask - repairs;
  };

  const getROI = (deal: WholesaleDeal) => {
    const profit = getProfit(deal);
    const ask = deal.askingPrice || deal.contractPrice || 0;
    return ask > 0 ? ((profit / ask) * 100).toFixed(1) : "0";
  };

  const getBestValue = (deals: WholesaleDeal[], getValue: (d: WholesaleDeal) => number, isHigherBetter = true) => {
    const values = deals.map(d => getValue(d));
    const best = isHigherBetter ? Math.max(...values) : Math.min(...values);
    return best;
  };

  const comparisonRows = [
    { label: "Ask Price", getValue: (d: WholesaleDeal) => d.askingPrice || d.contractPrice || 0, format: formatCurrency, isHigherBetter: false },
    { label: "ARV", getValue: (d: WholesaleDeal) => d.arv || 0, format: formatCurrency, isHigherBetter: true },
    { label: "Repairs", getValue: (d: WholesaleDeal) => d.repairEstimate || d.estimatedRepairs || 0, format: formatCurrency, isHigherBetter: false },
    { label: "Profit", getValue: (d: WholesaleDeal) => getProfit(d), format: formatCurrency, isHigherBetter: true },
    { label: "ROI", getValue: (d: WholesaleDeal) => parseFloat(getROI(d)), format: (v: number) => `${v.toFixed(1)}%`, isHigherBetter: true },
    { label: "Assignment Fee", getValue: (d: WholesaleDeal) => d.assignmentFee || 0, format: formatCurrency, isHigherBetter: false },
    { label: "Match Score", getValue: (d: WholesaleDeal) => d.matchScore || 0, format: (v: number) => `${v}%`, isHigherBetter: true },
    { label: "Sq Ft", getValue: (d: WholesaleDeal) => d.sqft || 0, format: formatNumber, isHigherBetter: true },
    { label: "Beds", getValue: (d: WholesaleDeal) => d.bedrooms || 0, format: formatNumber, isHigherBetter: true },
    { label: "Year Built", getValue: (d: WholesaleDeal) => d.yearBuilt || 0, format: formatNumber, isHigherBetter: true },
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="modal-deal-comparison">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-primary" />
            Deal Comparison
            <Badge variant="outline" className="ml-2">{deals.length} Deals</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background p-2 text-left text-sm font-medium text-muted-foreground w-32">
                    Property
                  </th>
                  {deals.map((deal) => (
                    <th key={deal.id} className="p-2 min-w-[200px]">
                      <div className="space-y-2">
                        <div className="relative h-24 rounded-lg overflow-hidden bg-muted">
                          {deal.photos?.[0] || deal.images?.[0] ? (
                            <img 
                              src={deal.photos?.[0] || deal.images?.[0]} 
                              alt={deal.propertyAddress || deal.address || "Property"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Building2 className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                          {deal.isPegasusDeal && (
                            <Badge className="absolute top-1 right-1 text-[10px] bg-primary gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Pegasus
                            </Badge>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm truncate">
                            {deal.propertyAddress || deal.address || "Property"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {[deal.city, deal.state].filter(Boolean).join(", ") || "Location TBD"}
                          </p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => {
                  const bestValue = getBestValue(deals, row.getValue, row.isHigherBetter);
                  
                  return (
                    <tr key={row.label} className="border-t">
                      <td className="sticky left-0 bg-background p-3 text-sm font-medium">
                        {row.label}
                      </td>
                      {deals.map((deal) => {
                        const value = row.getValue(deal);
                        const isBest = value === bestValue && value !== 0;
                        
                        return (
                          <td 
                            key={deal.id} 
                            className={`p-3 text-center ${isBest ? "bg-green-50 dark:bg-green-900/20" : ""}`}
                          >
                            <span className={`text-sm font-semibold ${isBest ? "text-green-600 dark:text-green-400" : ""}`}>
                              {row.format(value)}
                            </span>
                            {isBest && (
                              <Badge variant="outline" className="ml-1 text-[10px] border-green-500 text-green-600">
                                Best
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                
                {/* Actions row */}
                <tr className="border-t bg-muted/30">
                  <td className="sticky left-0 bg-muted/30 p-3 text-sm font-medium">
                    Actions
                  </td>
                  {deals.map((deal) => (
                    <td key={deal.id} className="p-3">
                      <div className="flex gap-2 justify-center">
                        <Button 
                          size="sm" 
                          onClick={() => onAction?.(deal.id, "accept")}
                          data-testid={`button-compare-accept-${deal.id}`}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onAction?.(deal.id, "counter")}
                          data-testid={`button-compare-counter-${deal.id}`}
                        >
                          Counter
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-close-comparison">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useCompareDeals(maxDeals = 3) {
  const [selectedDeals, setSelectedDeals] = useState<WholesaleDeal[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleDeal = (deal: WholesaleDeal) => {
    setSelectedDeals(prev => {
      const exists = prev.find(d => d.id === deal.id);
      if (exists) {
        return prev.filter(d => d.id !== deal.id);
      }
      if (prev.length >= maxDeals) {
        return prev;
      }
      return [...prev, deal];
    });
  };

  const isSelected = (dealId: string) => {
    return selectedDeals.some(d => d.id === dealId);
  };

  const clearSelection = () => {
    setSelectedDeals([]);
  };

  const canAddMore = selectedDeals.length < maxDeals;

  return {
    selectedDeals,
    toggleDeal,
    isSelected,
    clearSelection,
    canAddMore,
    showComparison,
    setShowComparison
  };
}
