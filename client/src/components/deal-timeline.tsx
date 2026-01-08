import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Clock, 
  Calendar,
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Search,
  FileText,
  DollarSign,
  Home,
  Key,
  Hammer,
  Plus,
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface TimelineEvent {
  id: string;
  type: "discovery" | "analysis" | "offer" | "negotiation" | "contract" | "inspection" | "financing" | "closing" | "custom";
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  icon?: string;
}

export interface DealTimelineData {
  dealId: string;
  events: TimelineEvent[];
  targetClosingDate?: string;
  createdAt: string;
}

const DEFAULT_MILESTONES: Omit<TimelineEvent, "id" | "date" | "completed">[] = [
  { type: "discovery", title: "Deal Discovered", icon: "search" },
  { type: "analysis", title: "Analysis Complete", icon: "file" },
  { type: "offer", title: "Offer Submitted", icon: "dollar" },
  { type: "negotiation", title: "Terms Negotiated", icon: "dollar" },
  { type: "contract", title: "Under Contract", icon: "file" },
  { type: "inspection", title: "Inspection Complete", icon: "home" },
  { type: "financing", title: "Financing Secured", icon: "dollar" },
  { type: "closing", title: "Deal Closed", icon: "key" },
];

const ICON_MAP: Record<string, typeof Home> = {
  search: Search,
  file: FileText,
  dollar: DollarSign,
  home: Home,
  key: Key,
  hammer: Hammer,
  clock: Clock,
  calendar: Calendar,
};

const STORAGE_KEY = "marketflow_deal_timeline";

export function useDealTimeline(dealId: string) {
  const [timeline, setTimeline] = useState<DealTimelineData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${dealId}`);
    if (stored) {
      try {
        setTimeline(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse timeline");
      }
    } else {
      const now = new Date().toISOString();
      const newTimeline: DealTimelineData = {
        dealId,
        events: DEFAULT_MILESTONES.map((m, i) => ({
          ...m,
          id: `m_${i}`,
          date: "",
          completed: i === 0,
          completedAt: i === 0 ? now : undefined
        })),
        createdAt: now
      };
      setTimeline(newTimeline);
      localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(newTimeline));
    }
  }, [dealId]);

  const saveTimeline = (updated: DealTimelineData) => {
    localStorage.setItem(`${STORAGE_KEY}_${dealId}`, JSON.stringify(updated));
    setTimeline(updated);
  };

  const toggleEvent = (eventId: string) => {
    if (!timeline) return;

    const updated = {
      ...timeline,
      events: timeline.events.map(e => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          completed: !e.completed,
          completedAt: !e.completed ? new Date().toISOString() : undefined
        };
      })
    };
    saveTimeline(updated);
  };

  const updateEvent = (eventId: string, updates: Partial<TimelineEvent>) => {
    if (!timeline) return;

    const updated = {
      ...timeline,
      events: timeline.events.map(e => e.id === eventId ? { ...e, ...updates } : e)
    };
    saveTimeline(updated);
  };

  const addEvent = (event: Omit<TimelineEvent, "id">) => {
    if (!timeline) return;

    const updated = {
      ...timeline,
      events: [...timeline.events, { ...event, id: `custom_${Date.now()}` }]
    };
    saveTimeline(updated);
  };

  const removeEvent = (eventId: string) => {
    if (!timeline) return;

    const updated = {
      ...timeline,
      events: timeline.events.filter(e => e.id !== eventId)
    };
    saveTimeline(updated);
  };

  const setTargetClosingDate = (date: string) => {
    if (!timeline) return;
    saveTimeline({ ...timeline, targetClosingDate: date });
  };

  const getProgress = () => {
    if (!timeline) return { completed: 0, total: 0, percentage: 0, currentStage: "" };
    
    const completed = timeline.events.filter(e => e.completed).length;
    const total = timeline.events.length;
    const currentEvent = timeline.events.find(e => !e.completed);
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      currentStage: currentEvent?.title || "Complete"
    };
  };

  return {
    timeline,
    toggleEvent,
    updateEvent,
    addEvent,
    removeEvent,
    setTargetClosingDate,
    getProgress
  };
}

interface DealTimelineCardProps {
  dealId: string;
  dealAddress: string;
  compact?: boolean;
}

export function DealTimelineCard({ dealId, dealAddress, compact = false }: DealTimelineCardProps) {
  const { timeline, toggleEvent, addEvent, removeEvent, setTargetClosingDate, getProgress } = useDealTimeline(dealId);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const progress = getProgress();

  if (!timeline) return null;

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Timeline</span>
            </div>
            <Badge variant={progress.percentage === 100 ? "default" : "outline"}>
              {progress.currentStage}
            </Badge>
          </div>
          <div className="flex gap-1">
            {timeline.events.map((event) => (
              <div
                key={event.id}
                className={`flex-1 h-2 rounded-full ${event.completed ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {progress.completed}/{progress.total} milestones
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Deal Timeline
          </span>
          <Button size="sm" variant="outline" onClick={() => setShowAddEvent(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Add Event
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{dealAddress}</p>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-4">
          {/* Vertical line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

          {timeline.events.map((event, index) => {
            const IconComponent = ICON_MAP[event.icon || "clock"] || Clock;
            const isLast = index === timeline.events.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Circle indicator */}
                <div 
                  className={`absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    event.completed 
                      ? "bg-primary border-primary" 
                      : "bg-background border-muted-foreground"
                  }`}
                  onClick={() => toggleEvent(event.id)}
                >
                  {event.completed && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                </div>

                {/* Event content */}
                <div className={`flex-1 pb-4 ${!isLast ? "border-b border-dashed" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${event.completed ? "text-primary" : "text-muted-foreground"}`} />
                      <h4 className={`font-medium text-sm ${event.completed ? "" : "text-muted-foreground"}`}>
                        {event.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.completed && event.completedAt && (
                        <Badge variant="outline" className="text-xs">
                          {formatDistanceToNow(new Date(event.completedAt), { addSuffix: true })}
                        </Badge>
                      )}
                      {event.id.startsWith("custom_") && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => removeEvent(event.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {timeline.targetClosingDate && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Target Closing</span>
            </div>
            <span className="text-sm">{new Date(timeline.targetClosingDate).toLocaleDateString()}</span>
          </div>
        )}

        <AddEventDialog
          open={showAddEvent}
          onClose={() => setShowAddEvent(false)}
          onAdd={(event) => {
            addEvent(event);
            setShowAddEvent(false);
          }}
        />
      </CardContent>
    </Card>
  );
}

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (event: Omit<TimelineEvent, "id">) => void;
}

function AddEventDialog({ open, onClose, onAdd }: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("clock");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({
        type: "custom",
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date().toISOString(),
        completed: false,
        icon
      });
      setTitle("");
      setDescription("");
      setIcon("clock");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm" data-testid="dialog-add-event">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Timeline Event
          </DialogTitle>
          <DialogDescription>
            Add a custom milestone to track this deal's progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Event title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-event-title"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue placeholder="Icon" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ICON_MAP).map((key) => {
                const Icon = ICON_MAP[key];
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{key}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!title.trim()} data-testid="button-add-event">
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TimelineProgress({ dealId }: { dealId: string }) {
  const { getProgress, timeline } = useDealTimeline(dealId);
  const progress = getProgress();

  if (!timeline) return null;

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-4 h-4 ${progress.percentage === 100 ? "text-green-500" : "text-muted-foreground"}`} />
      <div className="flex gap-0.5">
        {timeline.events.map((event) => (
          <div
            key={event.id}
            className={`w-2 h-2 rounded-full ${event.completed ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{progress.currentStage}</span>
    </div>
  );
}
