import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DealData {
  id: string;
  address?: string;
  propertyAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType?: string;
  askingPrice?: number;
  contractPrice?: number;
  arv?: number;
  repairEstimate?: number;
  estimatedRepairs?: number;
  assignmentFee?: number;
  bedrooms?: number;
  bathrooms?: string;
  sqft?: number;
  yearBuilt?: number;
  status?: string;
  matchScore?: number;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  deals: DealData[];
  selectedCount?: number;
}

const EXPORT_FIELDS = [
  { key: "address", label: "Address", default: true },
  { key: "cityState", label: "City, State", default: true },
  { key: "propertyType", label: "Property Type", default: true },
  { key: "askingPrice", label: "Asking Price", default: true },
  { key: "arv", label: "ARV", default: true },
  { key: "repairs", label: "Repair Estimate", default: true },
  { key: "profit", label: "Potential Profit", default: true },
  { key: "roi", label: "ROI %", default: true },
  { key: "assignmentFee", label: "Assignment Fee", default: false },
  { key: "bedrooms", label: "Bedrooms", default: false },
  { key: "bathrooms", label: "Bathrooms", default: false },
  { key: "sqft", label: "Square Feet", default: false },
  { key: "yearBuilt", label: "Year Built", default: false },
  { key: "status", label: "Status", default: true },
  { key: "matchScore", label: "Match Score", default: true },
];

export function ExportDialog({ open, onClose, deals, selectedCount }: ExportDialogProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<"csv" | "json" | "pdf">("csv");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(EXPORT_FIELDS.filter(f => f.default).map(f => f.key))
  );
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleField = (key: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedFields(new Set(EXPORT_FIELDS.map(f => f.key)));
  };

  const selectNone = () => {
    setSelectedFields(new Set());
  };

  const prepareDealData = (deal: DealData) => {
    const address = deal.propertyAddress || deal.address || "";
    const cityState = [deal.city, deal.state].filter(Boolean).join(", ");
    const askPrice = deal.askingPrice || deal.contractPrice || 0;
    const arv = deal.arv || 0;
    const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
    const profit = arv - askPrice - repairs;
    const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : "0";

    return {
      address,
      cityState,
      propertyType: deal.propertyType || "",
      askingPrice: askPrice,
      arv,
      repairs,
      profit,
      roi: `${roi}%`,
      assignmentFee: deal.assignmentFee || 0,
      bedrooms: deal.bedrooms || 0,
      bathrooms: deal.bathrooms || "",
      sqft: deal.sqft || 0,
      yearBuilt: deal.yearBuilt || 0,
      status: deal.status || "",
      matchScore: deal.matchScore || 0,
    };
  };

  const exportToCsv = () => {
    const headers = EXPORT_FIELDS
      .filter(f => selectedFields.has(f.key))
      .map(f => f.label);

    const rows = deals.map(deal => {
      const data = prepareDealData(deal);
      return EXPORT_FIELDS
        .filter(f => selectedFields.has(f.key))
        .map(f => {
          const value = data[f.key as keyof typeof data];
          if (typeof value === "number") {
            return f.key.includes("Price") || f.key.includes("arv") || f.key.includes("repairs") || f.key.includes("profit") || f.key === "assignmentFee"
              ? `$${value.toLocaleString()}`
              : value.toString();
          }
          return String(value).replace(/"/g, '""');
        });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketflow-deals-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJson = () => {
    const exportData = deals.map(deal => {
      const data = prepareDealData(deal);
      const result: Record<string, unknown> = {};
      selectedFields.forEach(field => {
        if (field === "address") result.address = data.address;
        else if (field === "cityState") result.location = data.cityState;
        else if (field === "propertyType") result.propertyType = data.propertyType;
        else if (field === "askingPrice") result.askingPrice = data.askingPrice;
        else if (field === "arv") result.arv = data.arv;
        else if (field === "repairs") result.repairEstimate = data.repairs;
        else if (field === "profit") result.potentialProfit = data.profit;
        else if (field === "roi") result.roi = data.roi;
        else if (field === "assignmentFee") result.assignmentFee = data.assignmentFee;
        else if (field === "bedrooms") result.bedrooms = data.bedrooms;
        else if (field === "bathrooms") result.bathrooms = data.bathrooms;
        else if (field === "sqft") result.squareFeet = data.sqft;
        else if (field === "yearBuilt") result.yearBuilt = data.yearBuilt;
        else if (field === "status") result.status = data.status;
        else if (field === "matchScore") result.matchScore = data.matchScore;
      });
      return result;
    });

    const jsonContent = JSON.stringify({
      exportedAt: new Date().toISOString(),
      totalDeals: deals.length,
      deals: exportData
    }, null, 2);

    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketflow-deals-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = async () => {
    const content = deals.map(deal => {
      const data = prepareDealData(deal);
      return `
${data.address}
${data.cityState}
Type: ${data.propertyType} | Status: ${data.status}
Ask: $${data.askingPrice.toLocaleString()} | ARV: $${data.arv.toLocaleString()}
Repairs: $${data.repairs.toLocaleString()} | Profit: $${data.profit.toLocaleString()}
ROI: ${data.roi} | Match Score: ${data.matchScore}%
-------------------
      `.trim();
    }).join("\n\n");

    const fullContent = `MarketFlow Deal Export
Generated: ${new Date().toLocaleString()}
Total Deals: ${deals.length}

${"=".repeat(40)}

${content}`;

    const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketflow-deals-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (deals.length === 0) {
      toast({ title: "No deals to export", description: "Try adjusting your filters or selection", variant: "destructive" });
      return;
    }
    
    if (selectedFields.size === 0) {
      toast({ title: "Select at least one field to export", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 20, 90));
    }, 100);

    try {
      if (format === "csv") {
        exportToCsv();
      } else if (format === "json") {
        exportToJson();
      } else {
        await exportToPdf();
      }

      setProgress(100);
      setTimeout(() => {
        toast({ 
          title: "Export complete!", 
          description: `${deals.length} deals exported as ${format.toUpperCase()}` 
        });
        onClose();
        setIsExporting(false);
        setProgress(0);
      }, 300);
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
      setIsExporting(false);
      setProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Deals
            <Badge variant="secondary">{selectedCount || deals.length} deals</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as "csv" | "json" | "pdf")}>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" data-testid="radio-csv" />
                  <Label htmlFor="csv" className="flex items-center gap-1 cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" data-testid="radio-json" />
                  <Label htmlFor="json" className="flex items-center gap-1 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" data-testid="radio-pdf" />
                  <Label htmlFor="pdf" className="flex items-center gap-1 cursor-pointer">
                    <FileText className="w-4 h-4" />
                    PDF
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Include Fields</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={selectAll} className="h-6 text-xs">
                  All
                </Button>
                <Button size="sm" variant="ghost" onClick={selectNone} className="h-6 text-xs">
                  None
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {EXPORT_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.has(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <Label htmlFor={field.key} className="text-xs cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {isExporting && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-center text-muted-foreground">
                Exporting {deals.length} deals...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.size === 0} data-testid="button-export">
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function QuickExportButton({ 
  deals, 
  format = "csv",
  label = "Export"
}: { 
  deals: DealData[]; 
  format?: "csv" | "pdf";
  label?: string;
}) {
  const { toast } = useToast();

  const handleQuickExport = () => {
    const headers = ["Address", "City", "State", "Type", "Price", "ARV", "Profit", "ROI", "Status"];
    
    const rows = deals.map(deal => {
      const address = deal.propertyAddress || deal.address || "";
      const askPrice = deal.askingPrice || deal.contractPrice || 0;
      const arv = deal.arv || 0;
      const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
      const profit = arv - askPrice - repairs;
      const roi = askPrice > 0 ? ((profit / askPrice) * 100).toFixed(1) : "0";

      return [
        address,
        deal.city || "",
        deal.state || "",
        deal.propertyType || "",
        `$${askPrice.toLocaleString()}`,
        `$${arv.toLocaleString()}`,
        `$${profit.toLocaleString()}`,
        `${roi}%`,
        deal.status || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketflow-deals-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Export complete!", description: `${deals.length} deals exported` });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleQuickExport} data-testid="button-quick-export">
      <Download className="w-3 h-3 mr-1" />
      {label}
    </Button>
  );
}
