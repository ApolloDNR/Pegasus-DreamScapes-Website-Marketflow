import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Save, 
  Star, 
  Clock, 
  Trash2, 
  MoreVertical,
  Bell,
  BellOff,
  Play,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  lastUsed?: string;
  alertsEnabled?: boolean;
  isDefault?: boolean;
}

export interface SearchFilters {
  query?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArv?: number;
  maxArv?: number;
  minRoi?: number;
  cities?: string[];
  states?: string[];
  status?: string;
  sortBy?: string;
}

const STORAGE_KEY = "marketflow_saved_searches";

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved searches");
      }
    }
  }, []);

  const saveSearch = (name: string, filters: SearchFilters) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
      alertsEnabled: false
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSearch;
  };

  const deleteSearch = (id: string) => {
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateSearch = (id: string, updates: Partial<SavedSearch>) => {
    const updated = savedSearches.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setSavedSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleAlerts = (id: string) => {
    const search = savedSearches.find(s => s.id === id);
    if (search) {
      updateSearch(id, { alertsEnabled: !search.alertsEnabled });
    }
  };

  const markUsed = (id: string) => {
    updateSearch(id, { lastUsed: new Date().toISOString() });
  };

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
    updateSearch,
    toggleAlerts,
    markUsed
  };
}

interface SaveSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentFilters: SearchFilters;
}

export function SaveSearchDialog({ open, onClose, onSave, currentFilters }: SaveSearchDialogProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onClose();
    }
  };

  const getFilterSummary = (filters: SearchFilters) => {
    const parts: string[] = [];
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.propertyType && filters.propertyType !== "all") parts.push(filters.propertyType);
    if (filters.minPrice) parts.push(`$${(filters.minPrice / 1000).toFixed(0)}K+`);
    if (filters.maxPrice) parts.push(`≤$${(filters.maxPrice / 1000).toFixed(0)}K`);
    if (filters.minRoi) parts.push(`${filters.minRoi}%+ ROI`);
    return parts.length > 0 ? parts.join(", ") : "All deals";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-save-search">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            Save Search
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="e.g., High ROI Multifamily"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-search-name"
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current Filters:</p>
            <p className="text-sm font-medium">{getFilterSummary(currentFilters)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} data-testid="button-save-search">
            <Save className="w-4 h-4 mr-2" />
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SavedSearchesListProps {
  searches: SavedSearch[];
  onApply: (search: SavedSearch) => void;
  onDelete: (id: string) => void;
  onToggleAlerts: (id: string) => void;
}

export function SavedSearchesList({ searches, onApply, onDelete, onToggleAlerts }: SavedSearchesListProps) {
  const { toast } = useToast();

  if (searches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved searches yet</p>
        <p className="text-xs">Save a search to quickly access it later</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-2">
      {searches.map((search) => (
        <Card key={search.id} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{search.name}</h4>
                  {search.alertsEnabled && (
                    <Badge variant="outline" className="text-[10px] gap-0.5">
                      <Bell className="w-2.5 h-2.5" />
                      Alerts
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDate(search.createdAt)}
                  {search.lastUsed && ` · Last used ${formatDate(search.lastUsed)}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onApply(search)}
                  data-testid={`button-apply-search-${search.id}`}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Apply
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onToggleAlerts(search.id)}>
                      {search.alertsEnabled ? (
                        <>
                          <BellOff className="w-4 h-4 mr-2" />
                          Disable Alerts
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Enable Alerts
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        onDelete(search.id);
                        toast({ title: "Search deleted" });
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSaveSearch: () => void;
}

export function AdvancedSearchPanel({ filters, onFiltersChange, onSaveSearch }: AdvancedSearchPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </span>
          <Button size="sm" variant="outline" onClick={onSaveSearch} data-testid="button-open-save-search">
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Min Price</Label>
            <Input
              type="number"
              placeholder="$0"
              value={filters.minPrice || ""}
              onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              data-testid="input-min-price"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max Price</Label>
            <Input
              type="number"
              placeholder="No max"
              value={filters.maxPrice || ""}
              onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
              data-testid="input-max-price"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Min ARV</Label>
            <Input
              type="number"
              placeholder="$0"
              value={filters.minArv || ""}
              onChange={(e) => onFiltersChange({ ...filters, minArv: e.target.value ? parseInt(e.target.value) : undefined })}
              data-testid="input-min-arv"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Min ROI %</Label>
            <Input
              type="number"
              placeholder="0%"
              value={filters.minRoi || ""}
              onChange={(e) => onFiltersChange({ ...filters, minRoi: e.target.value ? parseInt(e.target.value) : undefined })}
              data-testid="input-min-roi"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value === "all" ? undefined : value })}
          >
            <SelectTrigger data-testid="select-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Under Contract">Under Contract</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="New">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
