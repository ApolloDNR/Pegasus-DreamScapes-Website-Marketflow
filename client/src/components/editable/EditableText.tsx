import { useState, useRef, useEffect } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
  className?: string;
  multiline?: boolean;
}

export function EditableText({
  contentKey,
  fallback,
  as: Component = "span",
  className,
  multiline = false,
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const { getValue, updateContent, isSaving } = useSiteContent();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [localSaving, setLocalSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const currentValue = getValue(contentKey, fallback);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (isEditMode) {
      setEditValue(currentValue);
      setError(null);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      setError("Content cannot be empty");
      return;
    }
    
    if (trimmedValue === currentValue) {
      setIsEditing(false);
      return;
    }

    setLocalSaving(true);
    setError(null);
    
    try {
      await updateContent(contentKey, trimmedValue, multiline ? "richtext" : "text");
      toast({
        title: "Content saved",
        description: "Your changes have been saved successfully.",
      });
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save content";
      setError(message);
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLocalSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(currentValue);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditMode) {
    return <Component className={className}>{currentValue}</Component>;
  }

  if (isEditing) {
    const isProcessing = localSaving || isSaving;
    
    return (
      <div className="relative inline-flex flex-col gap-1">
        <div className="inline-flex items-center gap-1">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className={cn(
                "bg-background border rounded px-2 py-1 min-w-[200px] resize-y",
                error ? "border-destructive" : "border-primary",
                className
              )}
              rows={3}
              data-testid={`input-edit-${contentKey}`}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className={cn(
                "bg-background border rounded px-2 py-1 min-w-[200px]",
                error ? "border-destructive" : "border-primary",
                className
              )}
              data-testid={`input-edit-${contentKey}`}
            />
          )}
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleSave} 
              disabled={isProcessing}
              data-testid={`button-save-${contentKey}`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleCancel}
              disabled={isProcessing}
              data-testid={`button-cancel-${contentKey}`}
            >
              <X className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        {error && (
          <span className="text-xs text-destructive">{error}</span>
        )}
      </div>
    );
  }

  return (
    <Component
      className={cn(
        className,
        "relative cursor-pointer group outline-dashed outline-2 outline-transparent hover:outline-primary/50 rounded transition-all"
      )}
      onClick={handleStartEdit}
      data-testid={`editable-${contentKey}`}
    >
      {currentValue}
      <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1">
        <Pencil className="w-3 h-3" />
      </span>
    </Component>
  );
}
