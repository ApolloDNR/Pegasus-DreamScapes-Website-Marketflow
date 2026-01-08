import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Folder, 
  FolderPlus, 
  FolderOpen, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Star,
  Archive,
  Home,
  Check,
  Plus,
  Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface WatchlistFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  dealIds: string[];
  createdAt: string;
  isDefault?: boolean;
}

const FOLDER_ICONS = [
  { value: "folder", icon: Folder },
  { value: "star", icon: Star },
  { value: "archive", icon: Archive },
  { value: "home", icon: Home },
  { value: "building", icon: Building2 },
];

const FOLDER_COLORS = [
  { value: "default", label: "Default", class: "bg-muted" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
];

const STORAGE_KEY = "marketflow_watchlist_folders";

export function useWatchlistFolders() {
  const [folders, setFolders] = useState<WatchlistFolder[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFolders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse watchlist folders");
      }
    } else {
      const defaults: WatchlistFolder[] = [
        {
          id: "favorites",
          name: "Favorites",
          icon: "star",
          color: "orange",
          dealIds: [],
          createdAt: new Date().toISOString(),
          isDefault: true
        },
        {
          id: "under-review",
          name: "Under Review",
          icon: "folder",
          color: "blue",
          dealIds: [],
          createdAt: new Date().toISOString(),
          isDefault: true
        }
      ];
      setFolders(defaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, []);

  const saveToStorage = (updated: WatchlistFolder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setFolders(updated);
  };

  const createFolder = (name: string, icon = "folder", color = "default") => {
    const newFolder: WatchlistFolder = {
      id: Date.now().toString(),
      name,
      icon,
      color,
      dealIds: [],
      createdAt: new Date().toISOString()
    };
    saveToStorage([...folders, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<WatchlistFolder>) => {
    const updated = folders.map(f => f.id === id ? { ...f, ...updates } : f);
    saveToStorage(updated);
  };

  const deleteFolder = (id: string) => {
    const updated = folders.filter(f => f.id !== id);
    saveToStorage(updated);
  };

  const addDealToFolder = (folderId: string, dealId: string) => {
    const updated = folders.map(f => {
      if (f.id === folderId && !f.dealIds.includes(dealId)) {
        return { ...f, dealIds: [...f.dealIds, dealId] };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const removeDealFromFolder = (folderId: string, dealId: string) => {
    const updated = folders.map(f => {
      if (f.id === folderId) {
        return { ...f, dealIds: f.dealIds.filter(id => id !== dealId) };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const moveDealToFolder = (dealId: string, fromFolderId: string, toFolderId: string) => {
    const updated = folders.map(f => {
      if (f.id === fromFolderId) {
        return { ...f, dealIds: f.dealIds.filter(id => id !== dealId) };
      }
      if (f.id === toFolderId && !f.dealIds.includes(dealId)) {
        return { ...f, dealIds: [...f.dealIds, dealId] };
      }
      return f;
    });
    saveToStorage(updated);
  };

  const getFolderForDeal = (dealId: string) => {
    return folders.find(f => f.dealIds.includes(dealId));
  };

  const getDealsInFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    return folder?.dealIds || [];
  };

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    addDealToFolder,
    removeDealFromFolder,
    moveDealToFolder,
    getFolderForDeal,
    getDealsInFolder
  };
}

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string, color: string) => void;
}

export function CreateFolderDialog({ open, onClose, onCreate }: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [color, setColor] = useState("default");

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), icon, color);
      setName("");
      setIcon("folder");
      setColor("default");
      onClose();
    }
  };

  const IconComponent = FOLDER_ICONS.find(i => i.value === icon)?.icon || Folder;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" data-testid="dialog-create-folder">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            New Folder
          </DialogTitle>
          <DialogDescription>
            Create a folder to organize your saved deals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-folder-name"
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm text-muted-foreground">Icon</label>
              <div className="flex gap-1">
                {FOLDER_ICONS.map((item) => (
                  <Button
                    key={item.value}
                    size="icon"
                    variant={icon === item.value ? "default" : "outline"}
                    className="h-8 w-8"
                    onClick={() => setIcon(item.value)}
                  >
                    <item.icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Color</label>
              <div className="flex gap-1">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`w-6 h-6 rounded-full ${c.class} ${color === c.value ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    onClick={() => setColor(c.value)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className={`p-2 rounded ${FOLDER_COLORS.find(c => c.value === color)?.class || "bg-muted"}`}>
              <IconComponent className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">{name || "Folder Name"}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim()} data-testid="button-create-folder">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddToFolderDialogProps {
  open: boolean;
  onClose: () => void;
  folders: WatchlistFolder[];
  dealId: string;
  dealAddress: string;
  onAddToFolder: (folderId: string) => void;
  onCreateFolder: () => void;
  currentFolderId?: string;
}

export function AddToFolderDialog({ 
  open, 
  onClose, 
  folders, 
  dealId, 
  dealAddress,
  onAddToFolder,
  onCreateFolder,
  currentFolderId
}: AddToFolderDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState<string>("");

  const handleAdd = () => {
    if (selectedFolder) {
      onAddToFolder(selectedFolder);
      setSelectedFolder("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" data-testid="dialog-add-to-folder">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            Add to Folder
          </DialogTitle>
          <DialogDescription>
            Choose a folder to save this deal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium truncate">{dealAddress}</p>
          </div>

          <ScrollArea className="max-h-48">
            <div className="space-y-1">
              {folders.map((folder) => {
                const IconComponent = FOLDER_ICONS.find(i => i.value === folder.icon)?.icon || Folder;
                const isCurrentFolder = folder.id === currentFolderId;
                const colorClass = FOLDER_COLORS.find(c => c.value === folder.color)?.class || "bg-muted";

                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    disabled={isCurrentFolder}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      selectedFolder === folder.id 
                        ? "bg-primary/10 border border-primary" 
                        : isCurrentFolder
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted"
                    }`}
                  >
                    <div className={`p-1.5 rounded ${colorClass}`}>
                      <IconComponent className="w-3 h-3 text-white" />
                    </div>
                    <span className="flex-1 text-left text-sm">{folder.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {folder.dealIds.length}
                    </Badge>
                    {selectedFolder === folder.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    {isCurrentFolder && (
                      <Badge variant="secondary" className="text-[10px]">Current</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => { onClose(); onCreateFolder(); }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Create New Folder
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedFolder} data-testid="button-add-to-folder">
            Add to Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FolderSidebarProps {
  folders: WatchlistFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onEditFolder: (folder: WatchlistFolder) => void;
}

export function FolderSidebar({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  onDeleteFolder,
  onEditFolder
}: FolderSidebarProps) {
  const { toast } = useToast();
  const totalDeals = folders.reduce((acc, f) => acc + f.dealIds.length, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Folders
          </span>
          <Button size="sm" variant="ghost" onClick={onCreateFolder} className="h-7 w-7 p-0">
            <Plus className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === null ? "bg-primary/10 text-primary" : "hover:bg-muted"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="flex-1 text-left">All Saved</span>
          <Badge variant="outline" className="text-[10px]">{totalDeals}</Badge>
        </button>

        {folders.map((folder) => {
          const IconComponent = FOLDER_ICONS.find(i => i.value === folder.icon)?.icon || Folder;
          const colorClass = FOLDER_COLORS.find(c => c.value === folder.color)?.class || "bg-muted";

          return (
            <div key={folder.id} className="flex items-center gap-1">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`flex-1 flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                  selectedFolderId === folder.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <div className={`p-1 rounded ${colorClass}`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <Badge variant="outline" className="text-[10px]">{folder.dealIds.length}</Badge>
              </button>

              {!folder.isDefault && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        onDeleteFolder(folder.id);
                        toast({ title: "Folder deleted" });
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
