import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Megaphone, Pin, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@shared/schema";

interface AnnouncementsBannerProps {
  className?: string;
}

export function AnnouncementsBanner({ className = "" }: AnnouncementsBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("dismissedAnnouncements");
    return saved ? JSON.parse(saved) : [];
  });
  const [expanded, setExpanded] = useState(false);

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  const pinnedAnnouncements = visibleAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = visibleAnnouncements.filter((a) => !a.isPinned);

  const handleDismiss = (id: number) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissedAnnouncements", JSON.stringify(newDismissed));
  };

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  const displayAnnouncements = expanded
    ? visibleAnnouncements
    : [...pinnedAnnouncements, ...regularAnnouncements.slice(0, 1)];
  const hasMore = visibleAnnouncements.length > displayAnnouncements.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {displayAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          className={`border-l-4 ${
            announcement.isPinned
              ? "border-l-primary bg-primary/5"
              : "border-l-tan bg-tan/5"
          }`}
          data-testid={`announcement-${announcement.id}`}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0 mt-0.5">
              {announcement.isPinned ? (
                <Pin className="h-4 w-4 text-primary" />
              ) : (
                <Megaphone className="h-4 w-4 text-tan" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{announcement.title}</h4>
                {announcement.isPinned && (
                  <Badge variant="secondary" className="text-xs">
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {announcement.content}
              </p>
              {announcement.ctaText && announcement.ctaLink && (
                <a
                  href={announcement.ctaLink}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 hover:underline"
                  data-testid={`announcement-cta-${announcement.id}`}
                >
                  {announcement.ctaText}
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-6 w-6"
              onClick={() => handleDismiss(announcement.id)}
              data-testid={`button-dismiss-announcement-${announcement.id}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}

      {(hasMore || expanded) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-muted-foreground"
          data-testid="button-toggle-announcements"
        >
          {expanded ? (
            <>
              <ChevronDown className="h-4 w-4 mr-1 rotate-180" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {visibleAnnouncements.length - displayAnnouncements.length} more announcements
            </>
          )}
        </Button>
      )}
    </div>
  );
}
