import { useQuery } from "@tanstack/react-query";
import type { User as DbUser } from "@shared/schema";

export interface AuthUser extends DbUser {
  roles?: string[];
  isStaff?: boolean;
  isInvestor?: boolean;
  isWholesaler?: boolean;
  isBuyer?: boolean;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
