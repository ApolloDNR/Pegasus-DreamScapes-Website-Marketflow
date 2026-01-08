import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  StickyNote, 
  Edit2, 
  Save, 
  Trash2, 
  Clock,
  Plus,
  X
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface DealNote {
  id: string;
  dealId: string;
  dealType: "wholesale" | "capital" | "listing";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DealNotesProps {
  dealId: string;
  dealType: "wholesale" | "capital" | "listing";
  dealAddress?: string;
  compact?: boolean;
}

const NOTES_STORAGE_KEY = "marketflow_deal_notes";

function getStoredNotes(): Record<string, DealNote> {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveNoteToStorage(note: DealNote) {
  try {
    const notes = getStoredNotes();
    const key = `${note.dealType}-${note.dealId}`;
    notes[key] = note;
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
  }
}

function deleteNoteFromStorage(dealId: string, dealType: string) {
  try {
    const notes = getStoredNotes();
    const key = `${dealType}-${dealId}`;
    delete notes[key];
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch {
  }
}

function getNoteFromStorage(dealId: string, dealType: string): DealNote | null {
  const notes = getStoredNotes();
  const key = `${dealType}-${dealId}`;
  return notes[key] || null;
}

export function DealNotes({ dealId, dealType, dealAddress, compact = false }: DealNotesProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [existingNote, setExistingNote] = useState<DealNote | null>(null);

  useEffect(() => {
    const note = getNoteFromStorage(dealId, dealType);
    if (note) {
      setExistingNote(note);
      setNoteContent(note.content);
    }
  }, [dealId, dealType]);

  const handleSave = () => {
    if (!noteContent.trim()) {
      toast({ title: "Note is empty", variant: "destructive" });
      return;
    }

    const note: DealNote = {
      id: existingNote?.id || `note-${Date.now()}`,
      dealId,
      dealType,
      content: noteContent.trim(),
      createdAt: existingNote?.createdAt || new Date(),
      updatedAt: new Date()
    };

    saveNoteToStorage(note);
    setExistingNote(note);
    setIsEditing(false);
    toast({ title: "Note saved!", description: "Your private note has been saved." });
  };

  const handleDelete = () => {
    deleteNoteFromStorage(dealId, dealType);
    setExistingNote(null);
    setNoteContent("");
    setIsEditing(false);
    toast({ title: "Note deleted", description: "Your note has been removed." });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            size="icon" 
            variant={existingNote ? "default" : "ghost"} 
            className="h-8 w-8 rounded-full"
            data-testid={`button-notes-${dealId}`}
          >
            <StickyNote className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align="end">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <StickyNote className="w-3 h-3" />
                Private Note
              </span>
              {existingNote && !isEditing && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {isEditing || !existingNote ? (
              <>
                <Textarea
                  placeholder="Add a private note about this deal..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[80px] text-sm"
                  data-testid={`textarea-note-${dealId}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="flex-1" data-testid={`button-save-note-${dealId}`}>
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  {isEditing && (
                    <Button size="sm" variant="outline" onClick={() => {
                      setIsEditing(false);
                      setNoteContent(existingNote?.content || "");
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{existingNote.content}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  Updated {formatDate(existingNote.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card className="border-dashed" data-testid={`card-notes-${dealId}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-1">
            <StickyNote className="w-4 h-4 text-primary" />
            Private Notes
          </span>
          {existingNote && !isEditing && (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing || !existingNote ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Add private notes about this deal (e.g., follow-up items, seller info, inspection notes)..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[100px]"
              data-testid={`textarea-note-full-${dealId}`}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1" data-testid={`button-save-note-full-${dealId}`}>
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
              {isEditing && (
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  setNoteContent(existingNote?.content || "");
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
              {existingNote.content}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last updated {formatDate(existingNote.updatedAt)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NotesIndicator({ dealId, dealType }: { dealId: string; dealType: string }) {
  const [hasNote, setHasNote] = useState(false);

  useEffect(() => {
    const note = getNoteFromStorage(dealId, dealType);
    setHasNote(!!note);
  }, [dealId, dealType]);

  if (!hasNote) return null;

  return (
    <Badge variant="secondary" className="text-[10px] gap-0.5">
      <StickyNote className="w-2.5 h-2.5" />
      Note
    </Badge>
  );
}
