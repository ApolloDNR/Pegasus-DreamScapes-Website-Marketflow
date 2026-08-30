import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { authenticatedRequest } from "@/lib/queryClient";
import { ArrowRight, CircleCheck, Info } from "lucide-react";

interface SubmissionRow {
  id: number;
  status: string;
  createdAt: string;
}

export default function StrategyLabSubmittedPage() {
  const params = new URLSearchParams(useSearch());
  const id = params.get("id");

  useSEO({
    title: "Submission Receipt · Pegasus Dreamscapes",
    description: "Private receipt page for a Strategy Lab submission reference.",
    noIndex: true,
    noCanonical: true,
  });

  const { data } = useQuery<SubmissionRow>({
    queryKey: ["/api/strategy-lab/submission", id],
    queryFn: async () => {
      const response = await authenticatedRequest(`/api/strategy-lab/submission/${id}`);
      if (!response.ok) throw new Error("Could not load submission receipt");
      return response.json();
    },
    enabled: Boolean(id),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          Submission receipt
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
          {id ? "Your request was recorded." : "No submission reference was provided."}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {id
            ? "Keep this reference for your records. Pegasus may contact you if it elects to consider the information or needs clarification."
            : "Return to Strategy Lab to run another model, or use the private opportunity intake if you intended to submit property information."}
        </p>

        {id ? (
          <div className="border border-[hsl(var(--copper))]/45 bg-[hsl(var(--copper)/0.05)] p-5 mb-6" data-testid="card-submission-receipt">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
              <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" /> Reference
            </div>
            <p className="font-mono text-lg">#{id}</p>
            {data?.status ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Current system status: <span className="font-medium text-foreground">{data.status}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="border border-border bg-card p-5 mb-8" data-testid="card-submission-boundary">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
            <Info className="w-3.5 h-3.5" aria-hidden="true" /> What this means
          </div>
          <p className="text-sm leading-relaxed">
            Receipt does not promise a review, response, route, offer, or timeline. It does not create representation, confidentiality, MarketFlow access, or a transaction relationship.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/strategy-lab"
            className="border border-[hsl(var(--rule))] px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-back-to-lab"
          >
            Return to Strategy Lab
          </Link>
          <Link
            href="/bring-an-opportunity"
            className="bg-[hsl(var(--copper))] text-white px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-open-intake"
          >
            Open private intake <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
