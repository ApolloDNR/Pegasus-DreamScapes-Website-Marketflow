import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Video,
  Calendar,
  Plus,
  Clock,
  User,
  Building2,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface CommunicationEntry {
  id: string;
  type: "call" | "email" | "message" | "meeting" | "note";
  subject: string;
  content: string;
  contactName: string;
  contactRole: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  dealId: string;
}

const TYPE_ICONS = {
  call: Phone,
  email: Mail,
  message: MessageSquare,
  meeting: Video,
  note: MessageSquare,
};

const TYPE_COLORS = {
  call: "bg-blue-500",
  email: "bg-green-500",
  message: "bg-purple-500",
  meeting: "bg-orange-500",
  note: "bg-gray-500",
};

const STORAGE_KEY = "marketflow_communications";

export function useCommunicationLog(dealId: string) {
  const [entries, setEntries] = useState<CommunicationEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${dealId}`);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse communication log");
      }
    }
  }, [dealId]);

  const saveEntries = (updated: CommunicationEntry[]) => {
    localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(updated));
    setEntries(updated);
  };

  const addEntry = (entry: Omit<CommunicationEntry, "id" | "timestamp" | "dealId">) => {
    const newEntry: CommunicationEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      dealId
    };
    saveEntries([newEntry, ...entries]);
    return newEntry;
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const getByType = (type: CommunicationEntry["type"]) => {
    return entries.filter(e => e.type === type);
  };

  return {
    entries,
    addEntry,
    deleteEntry,
    getByType
  };
}

interface CommunicationLogCardProps {
  dealId: string;
  dealAddress: string;
  compact?: boolean;
}

export function CommunicationLogCard({ dealId, dealAddress, compact = false }: CommunicationLogCardProps) {
  const { entries, addEntry } = useCommunicationLog(dealId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Communications</span>
            </div>
            <Badge variant="outline">{entries.length}</Badge>
          </div>
          {entries.length > 0 ? (
            <p className="text-xs text-muted-foreground truncate">
              Last: {entries[0].subject}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No communications yet</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Communication Log
          </span>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add Entry
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{dealAddress}</p>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No communications logged yet</p>
            <p className="text-xs">Keep track of all seller/buyer interactions</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {entries.map((entry) => {
                const Icon = TYPE_ICONS[entry.type];
                const colorClass = TYPE_COLORS[entry.type];

                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className={`p-2 rounded-full ${colorClass} shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm">{entry.subject}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <User className="w-3 h-3" />
                            <span>{entry.contactName}</span>
                            <span>•</span>
                            <span>{entry.contactRole}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={entry.direction === "outbound" ? "default" : "outline"} className="text-[10px]">
                            {entry.direction === "outbound" ? <Send className="w-2.5 h-2.5 mr-1" /> : null}
                            {entry.direction}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <AddCommunicationDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={(entry) => {
            addEntry(entry);
            setShowAddDialog(false);
          }}
        />
      </CardContent>
    </Card>
  );
}

interface AddCommunicationDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<CommunicationEntry, "id" | "timestamp" | "dealId">) => void;
}

function AddCommunicationDialog({ open, onClose, onAdd }: AddCommunicationDialogProps) {
  const [type, setType] = useState<CommunicationEntry["type"]>("call");
  const [direction, setDirection] = useState<"inbound" | "outbound">("outbound");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("Seller");

  const handleAdd = () => {
    if (subject.trim() && content.trim() && contactName.trim()) {
      onAdd({
        type,
        direction,
        subject: subject.trim(),
        content: content.trim(),
        contactName: contactName.trim(),
        contactRole
      });
      setSubject("");
      setContent("");
      setContactName("");
      setType("call");
      setDirection("outbound");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-add-communication">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Log Communication
          </DialogTitle>
          <DialogDescription>
            Record a communication with a contact about this deal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Type</label>
              <Select value={type} onValueChange={(v) => setType(v as CommunicationEntry["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Call
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="message">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Text/Message
                    </div>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Meeting
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Note
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Direction</label>
              <Select value={direction} onValueChange={(v) => setDirection(v as "inbound" | "outbound")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound (You → Them)</SelectItem>
                  <SelectItem value="inbound">Inbound (Them → You)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Contact name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Select value={contactRole} onValueChange={setContactRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seller">Seller</SelectItem>
                <SelectItem value="Buyer">Buyer</SelectItem>
                <SelectItem value="Agent">Agent</SelectItem>
                <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                <SelectItem value="Attorney">Attorney</SelectItem>
                <SelectItem value="Title Company">Title Company</SelectItem>
                <SelectItem value="Contractor">Contractor</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Textarea
            placeholder="Details of the communication..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleAdd} 
            disabled={!subject.trim() || !content.trim() || !contactName.trim()}
            data-testid="button-add-communication"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CommunicationSummary({ dealId }: { dealId: string }) {
  const { entries } = useCommunicationLog(dealId);

  const counts = {
    call: entries.filter(e => e.type === "call").length,
    email: entries.filter(e => e.type === "email").length,
    message: entries.filter(e => e.type === "message").length,
  };

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Phone className="w-3 h-3" />
        {counts.call}
      </div>
      <div className="flex items-center gap-1">
        <Mail className="w-3 h-3" />
        {counts.email}
      </div>
      <div className="flex items-center gap-1">
        <MessageSquare className="w-3 h-3" />
        {counts.message}
      </div>
    </div>
  );
}
