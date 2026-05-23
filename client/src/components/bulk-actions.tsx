import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CheckSquare, 
  Square, 
  Bookmark, 
  Download, 
  Columns, 
  X, 
  MoreHorizontal,
  FolderPlus,
  Trash2
} from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkSave: () => void;
  onBulkCompare: () => void;
  onBulkExport: (format: "csv" | "pdf") => void;
  onAddToFolder?: () => void;
  compareDisabled?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkSave,
  onBulkCompare,
  onBulkExport,
  onAddToFolder,
  compareDisabled
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Card className="shadow-md border-primary/30">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCount === totalCount}
              onCheckedChange={(checked) => checked ? onSelectAll() : onClearSelection()}
              data-testid="checkbox-select-all"
            />
            <Badge variant="secondary" className="gap-1">
              {selectedCount} of {totalCount} selected
            </Badge>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onBulkSave}
              data-testid="button-bulk-save"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Save All
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onBulkCompare}
              disabled={compareDisabled || selectedCount > 3}
              data-testid="button-bulk-compare"
            >
              <Columns className="w-3 h-3 mr-1" />
              Compare {selectedCount <= 3 ? `(${selectedCount})` : "(max 3)"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" data-testid="button-bulk-more">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBulkExport("csv")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkExport("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                {onAddToFolder && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onAddToFolder}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Add to Folder
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onClearSelection}
              data-testid="button-clear-selection"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map(item => item.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected
  };
}

export function BulkSelectCheckbox({ 
  checked, 
  onToggle, 
  id 
}: { 
  checked: boolean; 
  onToggle: () => void;
  id: string;
}) {
  return (
    <div 
      className="absolute top-2 left-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="bg-background/80 backdrop-blur-sm"
        data-testid={`checkbox-select-${id}`}
      />
    </div>
  );
}
