import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, X, Save, Loader2 } from "lucide-react";

export function AdminBar() {
  const { isEditMode, toggleEditMode, canEdit } = useEditMode();
  const { isSaving } = useSiteContent();

  if (!canEdit) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg"
      data-testid="admin-bar"
    >
      <Badge 
        variant={isEditMode ? "default" : "secondary"}
        className="text-xs"
        data-testid="badge-admin-status"
      >
        Admin
      </Badge>
      
      {isSaving && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </div>
      )}
      
      <Button
        size="sm"
        variant={isEditMode ? "default" : "outline"}
        onClick={toggleEditMode}
        className="gap-1"
        data-testid="button-toggle-edit-mode"
      >
        {isEditMode ? (
          <>
            <X className="w-3 h-3" />
            Exit Edit
          </>
        ) : (
          <>
            <Pencil className="w-3 h-3" />
            Edit Mode
          </>
        )}
      </Button>
    </div>
  );
}
