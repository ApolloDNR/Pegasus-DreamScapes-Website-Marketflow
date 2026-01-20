import { useState, type ReactNode } from "react";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link as LinkIcon, Pencil } from "lucide-react";
import { Link } from "wouter";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");

  const currentLabel = getValue(contentKey, fallbackLabel);
  const metadata = getMetadata(contentKey) as { href?: string } | null;
  const currentHref = metadata?.href || fallbackHref;

  const handleOpenEdit = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setEditLabel(currentLabel);
      setEditHref(currentHref);
      setIsDialogOpen(true);
    }
  };

  const handleSave = async () => {
    await updateContent(contentKey, editLabel, "link", { href: editHref });
    setIsDialogOpen(false);
  };

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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Click here"
                data-testid="input-link-label"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link-href">URL / Path</Label>
              <Input
                id="link-href"
                value={editHref}
                onChange={(e) => setEditHref(e.target.value)}
                placeholder="/page or https://..."
                data-testid="input-link-href"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-link">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
