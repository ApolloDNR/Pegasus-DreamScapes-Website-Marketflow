import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus,
  Link as LinkIcon,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  description?: string;
}

export function PhotoUploadSection({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Property Photos",
  description = "Add up to 10 high-quality photos of the property"
}: PhotoUploadSectionProps) {
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlError, setUrlError] = useState("");

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) {
      setUrlError("Please enter a URL");
      return;
    }
    
    try {
      new URL(url);
    } catch {
      setUrlError("Please enter a valid URL");
      return;
    }

    if (images.length >= maxImages) {
      setUrlError(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (images.includes(url)) {
      setUrlError("This image URL is already added");
      return;
    }

    onImagesChange([...images, url]);
    setImageUrlInput("");
    setUrlError("");
    setShowUrlInput(false);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImageUrl();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages}
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div 
              key={index} 
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
              data-testid={`photo-preview-${index}`}
            >
              <img
                src={url}
                alt={`Property photo ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='12' text-anchor='middle' dy='.3em' fill='%23999'%3EImage Error%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => removeImage(index)}
                  data-testid={`button-remove-photo-${index}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="space-y-3">
          {!showUrlInput ? (
            <Card 
              className={cn(
                "border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover-elevate transition-colors",
                "hover:border-primary/50"
              )}
              onClick={() => setShowUrlInput(true)}
              data-testid="button-add-photo"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium">Add Photos</p>
                <p className="text-sm text-muted-foreground">
                  Click to add image URLs
                </p>
              </div>
            </Card>
          ) : (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Image URL</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    setUrlError("");
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  data-testid="input-photo-url"
                />
                <Button 
                  type="button" 
                  onClick={addImageUrl}
                  size="sm"
                  data-testid="button-add-photo-url"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUrlInput(false);
                    setImageUrlInput("");
                    setUrlError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
              {urlError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {urlError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Tip: Use direct image URLs (ending in .jpg, .png, .webp) for best results
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
