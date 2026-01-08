import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  ClipboardCheck, 
  Search, 
  FileText, 
  DollarSign, 
  Hammer,
  Home,
  Scale,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
}

export interface ChecklistCategory {
  id: string;
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface DealChecklist {
  dealId: string;
  categories: ChecklistCategory[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CHECKLIST_TEMPLATE: ChecklistCategory[] = [
  {
    id: "property",
    name: "Property Inspection",
    icon: "home",
    items: [
      { id: "p1", label: "Drive-by inspection completed", completed: false },
      { id: "p2", label: "Interior walkthrough scheduled", completed: false },
      { id: "p3", label: "Professional inspection ordered", completed: false },
      { id: "p4", label: "Repair estimate obtained", completed: false },
      { id: "p5", label: "Contractor quotes received", completed: false },
    ]
  },
  {
    id: "title",
    name: "Title & Legal",
    icon: "scale",
    items: [
      { id: "t1", label: "Title search ordered", completed: false },
      { id: "t2", label: "Liens/judgments reviewed", completed: false },
      { id: "t3", label: "Survey ordered (if needed)", completed: false },
      { id: "t4", label: "HOA documents reviewed", completed: false },
      { id: "t5", label: "Zoning verified", completed: false },
    ]
  },
  {
    id: "financial",
    name: "Financial Analysis",
    icon: "dollar",
    items: [
      { id: "f1", label: "ARV comps pulled", completed: false },
      { id: "f2", label: "Repair budget finalized", completed: false },
      { id: "f3", label: "ROI/profit analysis completed", completed: false },
      { id: "f4", label: "Financing pre-approved", completed: false },
      { id: "f5", label: "Insurance quote obtained", completed: false },
    ]
  },
  {
    id: "closing",
    name: "Closing Prep",
    icon: "file",
    items: [
      { id: "c1", label: "Earnest money deposited", completed: false },
      { id: "c2", label: "Contract reviewed by attorney", completed: false },
      { id: "c3", label: "Closing date confirmed", completed: false },
      { id: "c4", label: "Wire instructions verified", completed: false },
      { id: "c5", label: "Final walkthrough completed", completed: false },
    ]
  }
];

const ICON_MAP: Record<string, typeof Home> = {
  home: Home,
  scale: Scale,
  dollar: DollarSign,
  file: FileText,
  hammer: Hammer,
  search: Search,
};

const STORAGE_KEY = "marketflow_due_diligence";

export function useDueDiligence(dealId: string) {
  const [checklist, setChecklist] = useState<DealChecklist | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${dealId}`);
    if (stored) {
      try {
        setChecklist(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse checklist");
      }
    } else {
      const newChecklist: DealChecklist = {
        dealId,
        categories: DEFAULT_CHECKLIST_TEMPLATE.map(cat => ({
          ...cat,
          items: cat.items.map(item => ({ ...item }))
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setChecklist(newChecklist);
      localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(newChecklist));
    }
  }, [dealId]);

  const saveChecklist = (updated: DealChecklist) => {
    updated.updatedAt = new Date().toISOString();
    localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(updated));
    setChecklist(updated);
  };

  const toggleItem = (categoryId: string, itemId: string) => {
    if (!checklist) return;

    const updated = {
      ...checklist,
      categories: checklist.categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id !== itemId) return item;
            return {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? new Date().toISOString() : undefined
            };
          })
        };
      })
    };
    saveChecklist(updated);
  };

  const updateItemNotes = (categoryId: string, itemId: string, notes: string) => {
    if (!checklist) return;

    const updated = {
      ...checklist,
      categories: checklist.categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, notes };
          })
        };
      })
    };
    saveChecklist(updated);
  };

  const addCustomItem = (categoryId: string, label: string) => {
    if (!checklist) return;

    const updated = {
      ...checklist,
      categories: checklist.categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: [...cat.items, {
            id: `custom_${Date.now()}`,
            label,
            completed: false
          }]
        };
      })
    };
    saveChecklist(updated);
  };

  const removeItem = (categoryId: string, itemId: string) => {
    if (!checklist) return;

    const updated = {
      ...checklist,
      categories: checklist.categories.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        };
      })
    };
    saveChecklist(updated);
  };

  const getProgress = () => {
    if (!checklist) return { completed: 0, total: 0, percentage: 0 };
    
    let completed = 0;
    let total = 0;
    
    checklist.categories.forEach(cat => {
      cat.items.forEach(item => {
        total++;
        if (item.completed) completed++;
      });
    });
    
    return { 
      completed, 
      total, 
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  };

  return {
    checklist,
    toggleItem,
    updateItemNotes,
    addCustomItem,
    removeItem,
    getProgress
  };
}

interface DueDiligenceCardProps {
  dealId: string;
  dealAddress: string;
  compact?: boolean;
}

export function DueDiligenceCard({ dealId, dealAddress, compact = false }: DueDiligenceCardProps) {
  const { checklist, toggleItem, addCustomItem, removeItem, getProgress } = useDueDiligence(dealId);
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const progress = getProgress();

  if (!checklist) return null;

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Due Diligence</span>
            </div>
            <Badge variant={progress.percentage === 100 ? "default" : "outline"}>
              {progress.completed}/{progress.total}
            </Badge>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {progress.percentage}% complete
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Due Diligence Checklist
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={progress.percentage === 100 ? "default" : "outline"} className="text-sm">
              {progress.completed}/{progress.total} Complete
            </Badge>
          </div>
        </CardTitle>
        <div className="space-y-1">
          <Progress value={progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress.percentage}% complete for {dealAddress}</p>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={checklist.categories.map(c => c.id)} className="space-y-2">
          {checklist.categories.map((category) => {
            const IconComponent = ICON_MAP[category.icon] || ClipboardCheck;
            const categoryProgress = category.items.filter(i => i.completed).length;

            return (
              <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-3">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-primary" />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {categoryProgress}/{category.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {category.items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                          item.completed ? "bg-green-50 dark:bg-green-900/20" : "hover:bg-muted"
                        }`}
                      >
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(category.id, item.id)}
                          className="mt-0.5"
                          data-testid={`checkbox-${item.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                            {item.label}
                          </p>
                          {item.completedAt && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Completed {new Date(item.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {item.id.startsWith("custom_") && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeItem(category.id, item.id)}
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 mt-3 pt-2 border-t">
                      <Input
                        placeholder="Add custom item..."
                        value={newItemText[category.id] || ""}
                        onChange={(e) => setNewItemText({ ...newItemText, [category.id]: e.target.value })}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newItemText[category.id]?.trim()) {
                            addCustomItem(category.id, newItemText[category.id].trim());
                            setNewItemText({ ...newItemText, [category.id]: "" });
                            toast({ title: "Item added" });
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={!newItemText[category.id]?.trim()}
                        onClick={() => {
                          if (newItemText[category.id]?.trim()) {
                            addCustomItem(category.id, newItemText[category.id].trim());
                            setNewItemText({ ...newItemText, [category.id]: "" });
                            toast({ title: "Item added" });
                          }
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function DueDiligenceProgress({ dealId }: { dealId: string }) {
  const { getProgress } = useDueDiligence(dealId);
  const progress = getProgress();

  return (
    <div className="flex items-center gap-2">
      <ClipboardCheck className={`w-4 h-4 ${progress.percentage === 100 ? "text-green-500" : "text-muted-foreground"}`} />
      <Progress value={progress.percentage} className="h-1.5 w-16" />
      <span className="text-xs text-muted-foreground">{progress.percentage}%</span>
    </div>
  );
}
