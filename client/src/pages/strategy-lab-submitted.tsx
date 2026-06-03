import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { CheckCircle2, ArrowRight, Clock } from "lucide-react";

interface SubmissionRow {
  id: number;
  status: string;
  slaDueAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export default function StrategyLabSubmittedPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const id = params.get("id");

  useSEO({
    title: "Submission received. Pegasus Dreamscapes.",
    description: "Your Strategy Lab snapshot is in the review queue.",
    noIndex: true,
  });

  const { data } = useQuery<SubmissionRow>({
    queryKey: ["/api/strategy-lab/submission", id],
    queryFn: async () => {
      const res = await fetch(`/api/strategy-lab/submission/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Could not load submission");
      return res.json();
    },
    enabled: !!id,
  });

  const slaText = data?.slaDueAt
    ? new Date(data.slaDueAt).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "within two business days";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          Submission received
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-normal leading-tight mb-6">
          Your snapshot is in the review queue.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Apollo and the Pegasus team will read every input you submitted, run our own pass, and reach out with a structural read. Every property gets a serious review. Not every property gets an offer.
        </p>

        <div className="border border-[hsl(var(--copper))] bg-[hsl(var(--copper)/0.05)] p-5 mb-6" data-testid="card-sla">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
            <Clock className="w-3.5 h-3.5" /> Review window
          </div>
          <p className="font-serif text-xl mb-1">First response by {slaText}.</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            That window is two business days from the moment we received your snapshot. If we miss it, your request is escalated for priority review. Your submission moves to the front of the queue and Apollo is notified directly.
          </p>
        </div>

        <ul className="space-y-3 mb-10">
          <li className="flex gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--copper))] shrink-0 mt-0.5" />
            <span>You'll receive an email confirmation at the address you provided.</span>
          </li>
          <li className="flex gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--copper))] shrink-0 mt-0.5" />
            <span>The team may reply with clarifying questions before issuing a structural read.</span>
          </li>
          <li className="flex gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--copper))] shrink-0 mt-0.5" />
            <span>If your property fits a lane we're actively working, we'll route it to MarketFlow or to an operator partner.</span>
          </li>
        </ul>

        <div className="border-l-2 border-[hsl(var(--copper))] pl-4 italic text-sm text-muted-foreground mb-10">
          This is a strategy review, not an offer. Pegasus does not guarantee returns, principal protection, or a specific exit.
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/strategy-lab"
            className="border border-[hsl(var(--rule))] px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-back-to-lab"
          >
            Run another property
          </Link>
          <Link
            href="/strategy-lab/library"
            className="bg-[hsl(var(--copper))] text-white px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-open-library"
          >
            Open my library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
