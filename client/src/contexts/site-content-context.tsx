import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { portalServicesEnabled, portalServicesUnavailableError } from "@/lib/runtime-config";

interface SiteContent {
  id: number;
  key: string;
  value: string;
  type: string;
  metadata: Record<string, unknown> | null;
  updatedAt: string;
  updatedBy: string | null;
}

interface SiteContentContextType {
  content: Record<string, SiteContent>;
  isLoading: boolean;
  getValue: (key: string, fallback?: string) => string;
  getMetadata: (key: string) => Record<string, unknown> | null;
  updateContent: (key: string, value: string, type?: string, metadata?: Record<string, unknown>) => Promise<void>;
  pendingChanges: Set<string>;
  isSaving: boolean;
}

const SiteContentContext = createContext<SiteContentContextType | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const servicesEnabled = portalServicesEnabled();
  const [pendingChanges] = useState<Set<string>>(new Set());

  const { data: contentList = [], isLoading } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: servicesEnabled,
  });

  const content = contentList.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {} as Record<string, SiteContent>);

  const mutation = useMutation({
    mutationFn: async ({ key, value, type, metadata }: { 
      key: string; 
      value: string; 
      type?: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!servicesEnabled) {
        throw portalServicesUnavailableError();
      }

      return apiRequest("PUT", "/api/admin/site-content", { key, value, type, metadata });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
    },
  });

  const getValue = useCallback((key: string, fallback: string = ""): string => {
    return content[key]?.value ?? fallback;
  }, [content]);

  const getMetadata = useCallback((key: string): Record<string, unknown> | null => {
    return content[key]?.metadata ?? null;
  }, [content]);

  const updateContent = useCallback(async (
    key: string, 
    value: string, 
    type: string = "text",
    metadata?: Record<string, unknown>
  ) => {
    await mutation.mutateAsync({ key, value, type, metadata });
  }, [mutation]);

  return (
    <SiteContentContext.Provider value={{
      content,
      isLoading: servicesEnabled ? isLoading : false,
      getValue,
      getMetadata,
      updateContent,
      pendingChanges,
      isSaving: mutation.isPending,
    }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
