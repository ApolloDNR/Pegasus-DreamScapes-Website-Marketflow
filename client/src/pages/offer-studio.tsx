import { useRoute } from "wouter";
import { CapitalRelationshipOnlyNotice } from "@/components/capital-relationship-only-notice";
import { useSEO } from "@/hooks/use-seo";

export default function OfferStudioPage() {
  useSEO({
    title: "Capital relationship information",
    description: "Private relationship-information notice for retired capital offer routes.",
    noIndex: true,
  });
  const [, params] = useRoute("/offer-studio/:dealType/:dealId");
  const isCapitalRoute = params?.dealType?.toLowerCase() === "capital";

  return (
    <CapitalRelationshipOnlyNotice
      backPath={isCapitalRoute && params?.dealId ? `/marketflow/capital/${params.dealId}` : "/marketflow/capital"}
      backLabel={isCapitalRoute && params?.dealId ? "Back to project record" : "Back to projects"}
    />
  );
}
