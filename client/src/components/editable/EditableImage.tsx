import { useState } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageIcon, Pencil, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}

function isValidUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function EditableImage({
  contentKey,
  fallback,
  alt = "",
  className,
  imgClassName,
}: EditableImageProps) {
  const { isEditMode } = useEditMode();
  const { getValue, getMetadata, updateContent, isSaving } = useSiteContent();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [localSaving, setLocalSaving] = useState(false);
  const [errors, setErrors] = useState<{ url?: string; alt?: string }>({});

  const currentUrl = getValue(contentKey, fallback);
  const metadata = getMetadata(contentKey) as { alt?: string } | null;
  const currentAlt = metadata?.alt || alt;

  const handleOpenEdit = () => {
    if (isEditMode) {
      setEditUrl(currentUrl);
      setEditAlt(currentAlt);
      setErrors({});
      setIsDialogOpen(true);
    }
  };

  const validate = (): boolean => {
    const newErrors: { url?: string; alt?: string } = {};
    
    if (!editUrl.trim()) {
      newErrors.url = "Image URL is required";
    } else if (!isValidUrl(editUrl.trim())) {
      newErrors.url = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLocalSaving(true);
    
    try {
      await updateContent(contentKey, editUrl.trim(), "image", { alt: editAlt.trim() });
      toast({
        title: "Image saved",
        description: "Your image has been updated successfully.",
      });
      setIsDialogOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save image";
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

  if (!isEditMode) {
    return (
      <div className={className}>
        <img src={currentUrl} alt={currentAlt} className={imgClassName} />
      </div>
    );
  }

  return (
    <>
      <div 
        className={cn(
          className,
          "relative cursor-pointer group outline-dashed outline-2 outline-transparent hover:outline-primary/50 rounded transition-all"
        )}
        onClick={handleOpenEdit}
        data-testid={`editable-image-${contentKey}`}
      >
        <img src={currentUrl} alt={currentAlt} className={imgClassName} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-2">
            <Pencil className="w-4 h-4" />
          </span>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Edit Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={editUrl}
                onChange={(e) => {
                  setEditUrl(e.target.value);
                  if (errors.url) setErrors({ ...errors, url: undefined });
                }}
                placeholder="https://... or /path/to/image"
                disabled={isProcessing}
                className={errors.url ? "border-destructive" : ""}
                data-testid="input-image-url"
              />
              {errors.url && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.url}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="Image description for accessibility"
                disabled={isProcessing}
                data-testid="input-image-alt"
              />
            </div>
            
            {editUrl && isValidUrl(editUrl) && (
              <div className="border rounded p-2">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <img 
                  src={editUrl} 
                  alt={editAlt} 
                  className="max-h-40 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isProcessing} data-testid="button-save-image">
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
