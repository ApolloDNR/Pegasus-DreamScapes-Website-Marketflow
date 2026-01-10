import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

interface PrefetchableItem {
  id: string | number;
}

export function useDealPrefetch() {
  const queryClient = useQueryClient();

  const prefetchDeal = useCallback(
    async (dealId: string | number, dealType: "wholesale" | "capital" | "listing") => {
      const endpoint = dealType === "wholesale" 
        ? `/api/deals/wholesale/${dealId}/context`
        : dealType === "capital"
        ? `/api/deals/capital/${dealId}/context`
        : `/api/deals/listing/${dealId}/context`;

      await queryClient.prefetchQuery({
        queryKey: ["deal-context", dealType, dealId],
        queryFn: async () => {
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error("Failed to prefetch");
          return res.json();
        },
        staleTime: 1000 * 60 * 2,
      });
    },
    [queryClient]
  );

  const prefetchOnHover = useCallback(
    (dealId: string | number, dealType: "wholesale" | "capital" | "listing") => {
      const timeout = setTimeout(() => {
        prefetchDeal(dealId, dealType);
      }, 150);

      return () => clearTimeout(timeout);
    },
    [prefetchDeal]
  );

  return { prefetchDeal, prefetchOnHover };
}

export function PrefetchOnVisible({
  items,
  dealType,
  threshold = 0.1,
}: {
  items: PrefetchableItem[];
  dealType: "wholesale" | "capital" | "listing";
  threshold?: number;
}) {
  const { prefetchDeal } = useDealPrefetch();

  useEffect(() => {
    const prefetched = new Set<string | number>();
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dealId = entry.target.getAttribute("data-deal-id");
            if (dealId && !prefetched.has(dealId)) {
              prefetched.add(dealId);
              prefetchDeal(dealId, dealType);
            }
          }
        });
      },
      { threshold }
    );

    const elements = document.querySelectorAll("[data-deal-id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items, dealType, prefetchDeal, threshold]);

  return null;
}
