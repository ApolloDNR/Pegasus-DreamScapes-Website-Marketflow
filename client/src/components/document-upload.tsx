import { useState, useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Download, 
  Eye, 
  Trash2, 
  MoreVertical,
  Check,
  AlertCircle,
  Loader2,
  FolderOpen,
  Camera,
  FileImage
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: "contract" | "photo" | "inspection" | "appraisal" | "other";
  uploadedAt: string;
  uploadedBy: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

interface DocumentUploadProps {
  dealId: string;
  dealType: "wholesale" | "capital" | "listing";
  category?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (docs: UploadedDocument[]) => void;
}

export function DocumentUpload({
  dealId,
  dealType,
  category = "other",
  maxFiles = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx"],
  onUploadComplete,
}: DocumentUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: existingDocs } = useQuery<UploadedDocument[]>({
    queryKey: ["/api/documents", dealId, dealType],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dealId", dealId);
      formData.append("dealType", dealType);
      formData.append("category", category);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: (data, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file ? { ...u, status: "complete", progress: 100 } : u
        )
      );
      queryClient.invalidateQueries({ queryKey: ["/api/documents", dealId] });
      toast({
        title: "Upload complete",
        description: `${file.name} uploaded successfully`,
      });
    },
    onError: (error, file) => {
      setUploads((prev) =>
        prev.map((u) =>
          u.file === file
            ? { ...u, status: "error", error: "Upload failed" }
            : u
        )
      );
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
    },
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files).slice(0, maxFiles - (existingDocs?.length || 0));

      const newUploads: UploadProgress[] = fileArray.map((file) => ({
        file,
        progress: 0,
        status: "pending",
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      fileArray.forEach((file) => {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: "uploading", progress: 30 } : u
          )
        );
        uploadMutation.mutate(file);
      });
    },
    [existingDocs, maxFiles, uploadMutation]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeUpload = useCallback((file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  }, []);

  const remainingSlots = maxFiles - (existingDocs?.length || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Documents & Photos
        </CardTitle>
        <CardDescription>
          Upload property photos, contracts, and supporting documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFiles(e.target.files)}
            data-testid="input-file-upload"
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">
                Drag & drop files here, or{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                PDF, images, or documents up to 10MB each
              </p>
              {remainingSlots < maxFiles && (
                <p className="text-xs text-muted-foreground mt-1">
                  {remainingSlots} of {maxFiles} slots remaining
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "image/*";
                fileInputRef.current.click();
              }
            }}
            data-testid="button-upload-photos"
          >
            <Camera className="w-4 h-4 mr-1" />
            Photos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = "application/pdf";
                fileInputRef.current.click();
              }
            }}
            data-testid="button-upload-documents"
          >
            <FileText className="w-4 h-4 mr-1" />
            Documents
          </Button>
        </div>

        {uploads.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploading</h4>
            {uploads.map((upload, index) => (
              <UploadProgressItem
                key={index}
                upload={upload}
                onRemove={() => removeUpload(upload.file)}
              />
            ))}
          </div>
        )}

        {existingDocs && existingDocs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="grid gap-2">
              {existingDocs.map((doc) => (
                <DocumentItem key={doc.id} document={doc} dealId={dealId} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UploadProgressItem({
  upload,
  onRemove,
}: {
  upload: UploadProgress;
  onRemove: () => void;
}) {
  const getIcon = () => {
    if (upload.file.type.startsWith("image/")) {
      return <FileImage className="w-4 h-4" />;
    }
    if (upload.file.type === "application/pdf") {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
      <div className="p-2 rounded bg-muted">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{upload.file.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={upload.progress} className="flex-1 h-1.5" />
          <span className="text-xs text-muted-foreground">
            {upload.status === "complete" ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : upload.status === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

function DocumentItem({
  document,
  dealId,
}: {
  document: UploadedDocument;
  dealId: string;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/documents/${document.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", dealId] });
      toast({
        title: "Document deleted",
        description: `${document.name} has been removed`,
      });
    },
  });

  const getIcon = () => {
    if (document.type.startsWith("image/")) {
      return <Image className="w-4 h-4" />;
    }
    if (document.type === "application/pdf") {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const categoryColors: Record<string, string> = {
    contract: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    photo: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    inspection: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    appraisal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover-elevate">
      <div className="p-2 rounded bg-muted">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{document.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge className={`text-xs ${categoryColors[document.category]}`}>
            {document.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatSize(document.size)}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={document.url} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              View
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={document.url} download>
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => deleteMutation.mutate()}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function DocumentGallery({ dealId }: { dealId: string }) {
  const { data: documents } = useQuery<UploadedDocument[]>({
    queryKey: ["/api/documents", dealId],
  });

  const photos = documents?.filter((d) => d.type.startsWith("image/")) || [];
  const docs = documents?.filter((d) => !d.type.startsWith("image/")) || [];

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Photos ({photos.length})</h4>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <Dialog key={photo.id}>
                <DialogTrigger asChild>
                  <div className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Documents ({docs.length})</h4>
          <div className="space-y-2">
            {docs.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg border hover-elevate"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">{doc.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
