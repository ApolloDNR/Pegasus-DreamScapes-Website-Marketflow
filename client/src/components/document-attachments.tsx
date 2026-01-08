import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  MoreVertical,
  Image,
  FileSpreadsheet,
  File,
  Eye,
  Plus,
  Loader2,
  Check,
  Paperclip,
  FolderOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ObjectUploader } from "@/components/ObjectUploader";

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  objectPath: string;
  category: "inspection" | "title" | "contract" | "financial" | "photos" | "other";
  uploadedAt: string;
  uploadedBy?: string;
}

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  inspection: FileText,
  title: FileText,
  contract: FileText,
  financial: FileSpreadsheet,
  photos: Image,
  other: File,
};

const CATEGORY_LABELS: Record<string, string> = {
  inspection: "Inspection Reports",
  title: "Title Documents",
  contract: "Contracts",
  financial: "Financial Documents",
  photos: "Property Photos",
  other: "Other",
};

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "image/jpeg": Image,
  "image/png": Image,
  "image/gif": Image,
  "application/vnd.ms-excel": FileSpreadsheet,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "text/csv": FileSpreadsheet,
};

const STORAGE_KEY = "marketflow_documents";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function useDocumentAttachments(dealId: string) {
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${dealId}`);
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse documents");
      }
    }
    setIsLoading(false);
  }, [dealId]);

  const saveDocuments = (updated: DocumentAttachment[]) => {
    localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(updated));
    setDocuments(updated);
  };

  const addDocument = (doc: Omit<DocumentAttachment, "id" | "uploadedAt">) => {
    const newDoc: DocumentAttachment = {
      ...doc,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString()
    };
    saveDocuments([...documents, newDoc]);
    return newDoc;
  };

  const deleteDocument = (id: string) => {
    saveDocuments(documents.filter(d => d.id !== id));
  };

  const getByCategory = (category: DocumentAttachment["category"]) => {
    return documents.filter(d => d.category === category);
  };

  return {
    documents,
    isLoading,
    addDocument,
    deleteDocument,
    getByCategory
  };
}

interface DocumentAttachmentsCardProps {
  dealId: string;
  dealAddress: string;
  compact?: boolean;
}

export function DocumentAttachmentsCard({ dealId, dealAddress, compact = false }: DocumentAttachmentsCardProps) {
  const { documents, addDocument, deleteDocument, getByCategory } = useDocumentAttachments(dealId);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentAttachment["category"]>("other");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUploadParameters = useCallback(async (file: any) => {
    const response = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get upload URL");
    }

    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    };
  }, []);

  const handleUploadComplete = useCallback((result: any) => {
    if (result.successful?.length > 0) {
      result.successful.forEach((file: any) => {
        addDocument({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          url: file.response?.url || `/objects/uploads/${file.id}`,
          objectPath: `/objects/uploads/${file.id}`,
          category: selectedCategory,
        });
      });
      
      toast({ 
        title: "Upload complete", 
        description: `${result.successful.length} file(s) uploaded` 
      });
      setShowUploadDialog(false);
    }
  }, [addDocument, selectedCategory, toast]);

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Documents</span>
            </div>
            <Badge variant="outline">{documents.length}</Badge>
          </div>
          {documents.length > 0 ? (
            <p className="text-xs text-muted-foreground truncate">
              Latest: {documents[documents.length - 1]?.name}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No documents attached</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(CATEGORY_LABELS) as DocumentAttachment["category"][];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-primary" />
            Documents
          </span>
          <Button size="sm" onClick={() => setShowUploadDialog(true)} data-testid="button-upload-document">
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{dealAddress}</p>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents attached</p>
            <p className="text-xs">Upload inspection reports, contracts, and more</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryDocs = getByCategory(category);
                if (categoryDocs.length === 0) return null;

                const CategoryIcon = CATEGORY_ICONS[category];

                return (
                  <div key={category}>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                      {CATEGORY_LABELS[category]}
                      <Badge variant="outline" className="text-[10px]">{categoryDocs.length}</Badge>
                    </h4>
                    <div className="space-y-2">
                      {categoryDocs.map((doc) => {
                        const FileIcon = FILE_TYPE_ICONS[doc.type] || File;
                        
                        return (
                          <div 
                            key={doc.id} 
                            className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted transition-colors"
                          >
                            <div className="p-2 bg-primary/10 rounded">
                              <FileIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.size)} • {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.open(doc.url, "_blank")}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = doc.url;
                                  a.download = doc.name;
                                  a.click();
                                }}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    deleteDocument(doc.id);
                                    toast({ title: "Document deleted" });
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-md" data-testid="dialog-upload-document">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Documents
              </DialogTitle>
              <DialogDescription>
                Upload documents related to this deal
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Document Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => {
                    const CategoryIcon = CATEGORY_ICONS[category];
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                          selectedCategory === category 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <CategoryIcon className="w-4 h-4" />
                        {CATEGORY_LABELS[category].replace(" Documents", "").replace(" Reports", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <ObjectUploader
                maxNumberOfFiles={5}
                maxFileSize={25 * 1024 * 1024}
                onGetUploadParameters={handleUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select Files to Upload
              </ObjectUploader>

              <p className="text-xs text-muted-foreground text-center">
                Supported: PDF, Images, Excel, Word (Max 25MB each)
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function DocumentCount({ dealId }: { dealId: string }) {
  const { documents } = useDocumentAttachments(dealId);
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Paperclip className="w-3 h-3" />
      {documents.length} docs
    </div>
  );
}
