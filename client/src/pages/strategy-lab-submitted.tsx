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

const POSITIVE_INTEGER = /^[1-9]\d*$/;

function parseSubmissionId(value: string | null): number | null {
  if (!value || !POSITIVE_INTEGER.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export default function StrategyLabSubmittedPage() {
  const params = new URLSearchParams(useSearch());
  const submissionId = parseSubmissionId(params.get("id"));

  useSEO({
    title: "Submission Receipt · Pegasus Dreamscapes",
    description: "Private receipt page for a Strategy Lab submission reference.",
    noIndex: true,
    noCanonical: true,
  });

  const { data, isLoading, isError } = useQuery<SubmissionRow>({
    queryKey: ["/api/strategy-lab/submission", submissionId],
    queryFn: async () => {
      if (submissionId === null) throw new Error("Missing submission reference");
      const response = await authenticatedRequest(`/api/strategy-lab/submission/${submissionId}`);
      if (!response.ok) throw new Error("Could not load submission receipt");
      return response.json() as Promise<SubmissionRow>;
    },
    enabled: submissionId !== null,
  });

  const isVerified = submissionId !== null && data?.id === submissionId;
  const heading =
    submissionId === null
      ? "No verified submission receipt is available."
      : isLoading
        ? "Verifying submission receipt…"
        : isError || !isVerified
          ? "We could not verify this submission receipt."
          : "Submission receipt verified.";
  const description =
    submissionId === null
      ? "This link does not contain a valid submission reference. Return to Strategy Lab or use the private opportunity intake if you intended to submit property information."
      : isLoading
        ? "Checking the owner-scoped submission record before showing any receipt details."
        : isError || !isVerified
          ? "This link does not prove that Pegasus received a submission. Sign in with the account that created the record, check the link, or return to Strategy Lab."
          : "The owner-scoped record exists. Keep this reference for your records; Pegasus may contact you only if it elects to consider the information or needs clarification.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
          Submission receipt
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
          {heading}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>

        {isVerified ? (
          <div className="border border-[hsl(var(--copper))]/45 bg-[hsl(var(--copper)/0.05)] p-5 mb-6" data-testid="card-submission-receipt">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-2">
              <CircleCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified reference
            </div>
            <p className="font-mono text-lg">#{submissionId}</p>
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
          {submissionId !== null && !isLoading && !isVerified ? (
            <Link
              href={`/login?returnTo=${encodeURIComponent(`/strategy-lab/submitted?id=${submissionId}`)}`}
              className="bg-[hsl(var(--copper))] text-white px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
              data-testid="link-sign-in-to-verify"
            >
              Sign in to verify <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : null}
          <Link
            href="/strategy-lab"
            className="border border-[hsl(var(--rule))] px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-back-to-lab"
          >
            Return to Strategy Lab
          </Link>
          <Link
            href="/bring-an-opportunity"
            className="border border-[hsl(var(--rule))] px-5 py-3 text-sm font-supporting font-semibold inline-flex items-center gap-2"
            data-testid="link-open-intake"
          >
            Open private intake <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
