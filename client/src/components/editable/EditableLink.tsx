import { useState, type ReactNode } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link as LinkIcon, Pencil, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface EditableLinkProps {
  contentKey: string;
  fallbackLabel: string;
  fallbackHref: string;
  className?: string;
  children?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg";
  asButton?: boolean;
}

function isValidHref(href: string): boolean {
  if (href.startsWith("/") || href.startsWith("#")) return true;
  try {
    new URL(href);
    return true;
  } catch {
    return false;
  }
}

export function EditableLink({
  contentKey,
  fallbackLabel,
  fallbackHref,
  className,
  children,
  variant = "default",
  size = "default",
  asButton = false,
}: EditableLinkProps) {
  const { isEditMode } = useEditMode();
  const { getValue, getMetadata, updateContent, isSaving } = useSiteContent();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [localSaving, setLocalSaving] = useState(false);
  const [errors, setErrors] = useState<{ label?: string; href?: string }>({});

  const currentLabel = getValue(contentKey, fallbackLabel);
  const metadata = getMetadata(contentKey) as { href?: string } | null;
  const currentHref = metadata?.href || fallbackHref;

  const handleOpenEdit = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setEditLabel(currentLabel);
      setEditHref(currentHref);
      setErrors({});
      setIsDialogOpen(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: { label?: string; href?: string } = {};
    
    if (!editLabel.trim()) {
      newErrors.label = "Link text is required";
    }
    
    if (!editHref.trim()) {
      newErrors.href = "URL or path is required";
    } else if (!isValidHref(editHref.trim())) {
      newErrors.href = "Please enter a valid URL or path";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLocalSaving(true);
    
    try {
      await updateContent(contentKey, editLabel.trim(), "link", { href: editHref.trim() });
      toast({
        title: "Link saved",
        description: "Your link has been updated successfully.",
      });
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save link";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLocalSaving(false);
    }
  };

  const handleClose = () => {
    if (!localSaving) {
      setIsDialogOpen(false);
      setErrors({});
    }
  };

  const isProcessing = localSaving || isSaving;
  const linkContent = children || currentLabel;

  if (!isEditMode) {
    if (asButton) {
      return (
        <Link href={currentHref}>
          <Button variant={variant} size={size} className={className}>
            {linkContent}
          </Button>
        </Link>
      );
    }
    return (
      <Link href={currentHref} className={className}>
        {linkContent}
      </Link>
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative inline-block cursor-pointer group"
        )}
        onClick={handleOpenEdit}
        data-testid={`editable-link-${contentKey}`}
      >
        {asButton ? (
          <Button 
            variant={variant} 
            size={size} 
            className={cn(className, "outline-dashed outline-2 outline-transparent hover:outline-primary/50")}
          >
            {linkContent}
          </Button>
        ) : (
          <span className={cn(className, "outline-dashed outline-2 outline-transparent hover:outline-primary/50 rounded")}>
            {linkContent}
          </span>
        )}
        <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 z-10">
          <Pencil className="w-3 h-3" />
        </span>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Edit Link
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-label">Button/Link Text</Label>
              <Input
                id="link-label"
                value={editLabel}
                onChange={(e) => {
                  setEditLabel(e.target.value);
                  if (errors.label) setErrors({ ...errors, label: undefined });
                }}
                placeholder="Click here"
                disabled={isProcessing}
                className={errors.label ? "border-destructive" : ""}
                data-testid="input-link-label"
              />
              {errors.label && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.label}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link-href">URL / Path</Label>
              <Input
                id="link-href"
                value={editHref}
                onChange={(e) => {
                  setEditHref(e.target.value);
                  if (errors.href) setErrors({ ...errors, href: undefined });
                }}
                placeholder="/page or https://..."
                disabled={isProcessing}
                className={errors.href ? "border-destructive" : ""}
                data-testid="input-link-href"
              />
              {errors.href && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.href}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isProcessing} data-testid="button-save-link">
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
