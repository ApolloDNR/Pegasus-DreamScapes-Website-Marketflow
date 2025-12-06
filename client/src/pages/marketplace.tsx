import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { Loader2 } from "lucide-react";

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated, userRole } = useSupabaseAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/login");
      } else {
        const dashboardPath = getRoleDashboardPath(userRole);
        if (dashboardPath !== "/marketplace") {
          setLocation(dashboardPath);
        }
      }
    }
  }, [isLoading, isAuthenticated, userRole, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
