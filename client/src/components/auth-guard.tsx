import { useLocation, Redirect } from "wouter";
import { useSupabaseAuth, canAccessRoute, getRoleDashboardPath } from "@/contexts/supabase-auth-context";
import { Loader2 } from "lucide-react";
import type { MarketplacePermission } from "@shared/schema";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export function AuthGuard({ children, requiredRoles, fallbackPath = "/login" }: AuthGuardProps) {
  const { isAuthenticated, isLoading, userRole, isGuestMode, guestRole } = useSupabaseAuth();
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

  // Allow guest mode users to access the portal for preview
  const effectiveRole = isGuestMode ? guestRole : userRole;
  const hasAccess = isAuthenticated || isGuestMode;

  if (!hasAccess) {
    return <Redirect to={fallbackPath} />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    if (!effectiveRole || !requiredRoles.includes(effectiveRole)) {
      const dashboardPath = getRoleDashboardPath(effectiveRole);
      return <Redirect to={dashboardPath} />;
    }
  }

  if (!canAccessRoute(effectiveRole, location)) {
    const dashboardPath = getRoleDashboardPath(effectiveRole);
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
  const { userRole, isLoading, isAuthenticated, isGuestMode, guestRole } = useSupabaseAuth();

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

  const effectiveRole = isGuestMode ? guestRole : userRole;
  const hasAccess = isAuthenticated || isGuestMode;

  if (!hasAccess) {
    return <Redirect to="/login" />;
  }

  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    const fallback = redirectTo ?? getRoleDashboardPath(effectiveRole);
    return <Redirect to={fallback} />;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: MarketplacePermission;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function PermissionGuard({ children, requiredPermission, fallback, redirectTo }: PermissionGuardProps) {
  const { hasPermission, isLoading, isAuthenticated, userRole, isGuestMode, guestRole } = useSupabaseAuth();

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

  const effectiveRole = isGuestMode ? guestRole : userRole;
  const hasValidAccess = isAuthenticated || isGuestMode;

  if (!hasValidAccess) {
    return <Redirect to="/login" />;
  }

  if (!hasPermission(requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    const path = redirectTo ?? getRoleDashboardPath(effectiveRole);
    return <Redirect to={path} />;
  }

  return <>{children}</>;
}

interface RoleCategoryGuardProps {
  children: React.ReactNode;
  category: 'admin' | 'wholesaler' | 'dreamscaper' | 'investor' | 'buyer' | 'pegasus';
  redirectTo?: string;
}

export function RoleCategoryGuard({ children, category, redirectTo }: RoleCategoryGuardProps) {
  const { 
    isAdmin, 
    isWholesaler, 
    isDreamscaper, 
    isInvestor, 
    isBuyer, 
    isPegasus, 
    isLoading, 
    isAuthenticated, 
    userRole,
    isGuestMode,
    guestRole
  } = useSupabaseAuth();

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

  const effectiveRole = isGuestMode ? guestRole : userRole;
  const hasValidAccess = isAuthenticated || isGuestMode;

  if (!hasValidAccess) {
    return <Redirect to="/login" />;
  }

  const hasRoleAccess = (() => {
    switch (category) {
      case 'admin': return isAdmin;
      case 'wholesaler': return isWholesaler;
      case 'dreamscaper': return isDreamscaper;
      case 'investor': return isInvestor;
      case 'buyer': return isBuyer;
      case 'pegasus': return isPegasus;
      default: return false;
    }
  })();

  if (!hasRoleAccess) {
    const path = redirectTo ?? getRoleDashboardPath(effectiveRole);
    return <Redirect to={path} />;
  }

  return <>{children}</>;
}
