import { useState, type ReactNode } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageIcon, Pencil } from "lucide-react";

interface EditableImageProps {
  contentKey: string;
  fallback: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editAlt, setEditAlt] = useState("");

  const currentUrl = getValue(contentKey, fallback);
  const metadata = getMetadata(contentKey) as { alt?: string } | null;
  const currentAlt = metadata?.alt || alt;

  const handleOpenEdit = () => {
    if (isEditMode) {
      setEditUrl(currentUrl);
      setEditAlt(currentAlt);
      setIsDialogOpen(true);
    }
  };

  const handleSave = async () => {
    await updateContent(contentKey, editUrl, "image", { alt: editAlt });
    setIsDialogOpen(false);
  };

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://..."
                data-testid="input-image-url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="Image description"
                data-testid="input-image-alt"
              />
            </div>
            
            {editUrl && (
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-image">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
