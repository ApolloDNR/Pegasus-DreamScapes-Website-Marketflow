import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Megaphone, Pin, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Announcement } from "@shared/schema";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { apiRequest, AUTHENTICATED_QUERY_META } from "@/lib/queryClient";

interface AnnouncementsBannerProps {
  className?: string;
  audience?: "ALL" | "INVESTORS" | "WHOLESALERS" | "BUYERS" | "STAFF";
}

export function AnnouncementsBanner({ className = "", audience }: AnnouncementsBannerProps) {
  const { user } = useSupabaseAuth();
  const subjectId = user?.id ?? null;
  const storageKey = subjectId ? `dismissedAnnouncements:${subjectId}` : null;
  const readDismissed = (key: string | null): number[] => {
    if (!key) return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? "[]");
      return Array.isArray(parsed)
        ? parsed.filter((value): value is number => Number.isSafeInteger(value))
        : [];
    } catch {
      return [];
    }
  };
  const [dismissedIds, setDismissedIds] = useState<number[]>(() => readDismissed(storageKey));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDismissedIds(readDismissed(storageKey));
    setExpanded(false);
  }, [storageKey]);

  const { data: announcements = [], isError } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", subjectId],
    queryFn: async () => (await apiRequest("GET", "/api/announcements")).json(),
    enabled: Boolean(subjectId),
    meta: AUTHENTICATED_QUERY_META,
  });

  const visibleAnnouncements = announcements.filter((a) => {
    if (dismissedIds.includes(a.id)) return false;
    if (!audience) return true;
    return a.audience === "ALL" || a.audience === audience;
  });

  const pinnedAnnouncements = visibleAnnouncements.filter((a) => a.isPinned);
  const regularAnnouncements = visibleAnnouncements.filter((a) => !a.isPinned);

  const handleDismiss = (id: number) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(newDismissed));
  };

  if (!subjectId) return null;

  if (isError) {
    return (
      <Card className={className} role="status">
        <div className="p-4">
          <p className="text-sm font-medium">Announcements unavailable</p>
          <p className="mt-1 text-xs text-muted-foreground">Private announcements could not be loaded.</p>
        </div>
      </Card>
    );
  }

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
              : "border-l-primary/50 bg-primary/[0.03]"
          }`}
          data-testid={`announcement-${announcement.id}`}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0 mt-0.5">
              {announcement.isPinned ? (
                <Pin className="h-4 w-4 text-primary" />
              ) : (
                <Megaphone className="h-4 w-4 text-primary" />
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
