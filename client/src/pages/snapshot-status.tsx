import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

export default function SnapshotStatus() {
  const params = useParams<{ token: string }>();
  const reference = params.token?.slice(0, 8);

  useSEO({
    title: "Submission Status · Pegasus Dreamscapes",
    description: "Private, non-indexed status-link boundary for a Pegasus submission reference.",
    noIndex: true,
    noCanonical: true,
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              Strategy Snapshot · Status boundary
            </p>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-3"
            data-testid="text-snapshot-title"
          >
            Submission status is not available here.
          </h1>
          {reference ? (
            <p className="text-sm text-muted-foreground" data-testid="text-snapshot-meta">
              Link reference <span className="font-mono text-foreground">{reference}</span>
            </p>
          ) : null}
        </motion.div>

        <div
          className="bg-card border border-border/60 p-7 sm:p-9 shadow-sm"
          data-testid="panel-status-neutral"
        >
          <AlertCircle className="h-6 w-6 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-2xl font-semibold">
            Live status tracking is not connected at this link.
          </h2>
          <p className="mt-3 text-base text-foreground leading-relaxed">
            This page does not confirm receipt, review, or a future response. It does not display a real queue position, review stage, delivery date, or selected transaction path.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            If Pegasus sent you a separate email or document, use the contact information in that message. Otherwise, you can contact Apollo and provide the link reference above.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a href="mailto:apollo@pegasusdreamscapes.com">
              <Button variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-status-email">
                <Mail className="w-4 h-4" aria-hidden="true" /> Email Apollo
              </Button>
            </a>
            <a href="tel:+19257448525">
              <Button variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-status-call">
                <Phone className="w-4 h-4" aria-hidden="true" /> Call 925-744-8525
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/strategy-lab">
            <Button variant="ghost">Return to Strategy Lab</Button>
          </Link>
          <Link href="/bring-an-opportunity">
            <Button className="gap-2">
              Open private intake <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
