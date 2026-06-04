import { useQuery } from "@tanstack/react-query";
import type { User as DbUser } from "@shared/schema";
import { portalServicesEnabled } from "@/lib/runtime-config";

export interface AuthUser extends DbUser {
  roles?: string[];
  isStaff?: boolean;
  isInvestor?: boolean;
  isWholesaler?: boolean;
  isBuyer?: boolean;
  isDreamscaper?: boolean;
}

export function useAuth() {
  const servicesEnabled = portalServicesEnabled();
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    enabled: servicesEnabled,
    retry: false,
  });

  return {
    user,
    isLoading: servicesEnabled ? isLoading : false,
    isAuthenticated: !!user,
  };
}
