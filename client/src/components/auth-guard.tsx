import { useLocation, Redirect } from "wouter";
import { useSupabaseAuth, canAccessRoute, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export function AuthGuard({ children, requiredRoles, fallbackPath = "/login" }: AuthGuardProps) {
  const { isAuthenticated, isLoading, userRole } = useSupabaseAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={fallbackPath} />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      const dashboardPath = getRoleDashboardPath(userRole);
      return <Redirect to={dashboardPath} />;
    }
  }

  if (!canAccessRoute(userRole, location)) {
    const dashboardPath = getRoleDashboardPath(userRole);
    return <Redirect to={dashboardPath} />;
  }

  return <>{children}</>;
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, userRole } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const dashboardPath = getRoleDashboardPath(userRole);
    return <Redirect to={dashboardPath} />;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
  const { userRole, isLoading, isAuthenticated } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    const fallback = redirectTo ?? getRoleDashboardPath(userRole);
    return <Redirect to={fallback} />;
  }

  return <>{children}</>;
}
