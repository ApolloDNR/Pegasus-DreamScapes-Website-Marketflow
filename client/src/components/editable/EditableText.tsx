import { useState, useRef, useEffect, type ReactNode } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "div";
  className?: string;
  children?: ReactNode;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
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
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editValue !== currentValue) {
      await updateContent(contentKey, editValue, multiline ? "richtext" : "text");
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(currentValue);
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
    return (
      <div className="relative inline-flex items-center gap-1">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-background border border-primary rounded px-2 py-1 min-w-[200px] resize-y",
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
            className={cn(
              "bg-background border border-primary rounded px-2 py-1 min-w-[200px]",
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
            disabled={isSaving}
            data-testid={`button-save-${contentKey}`}
          >
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={handleCancel}
            data-testid={`button-cancel-${contentKey}`}
          >
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
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
