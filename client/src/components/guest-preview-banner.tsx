import { Link, useLocation } from "wouter";
import { Eye, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

/**
 * Shared "Guest Preview Mode" banner for MarketFlow role dashboards.
 * Renders nothing unless the user is currently in guest mode.
 * Lets the guest jump to /login (with role kept) or exit preview back to /marketflow.
 */
export function GuestPreviewBanner({ roleLabel }: { roleLabel: string }) {
  const { isGuestMode, exitGuestMode } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  if (!isGuestMode) return null;

  const handleExitPreview = () => {
    exitGuestMode();
    setLocation("/marketflow");
  };

  return (
    <div
      className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-6 py-3"
      data-testid="guest-preview-banner"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600" />
          <span
            className="text-sm font-medium"
            data-testid="text-guest-preview-banner"
          >
            Guest Preview Mode — Viewing as {roleLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            Sample data. Sign in to take real actions.
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/login">
            <Button size="sm" data-testid="button-guest-sign-in">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExitPreview}
            data-testid="button-exit-preview"
          >
            Exit Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
