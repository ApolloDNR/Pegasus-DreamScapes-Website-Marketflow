import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ArrowRight, ShieldCheck, MessageSquare, Lock, Mail, Phone } from "lucide-react";

// Empire Doctrine v1.0.1 — /capital is footer-only (NOT in primary nav).
// Reg D 506(b)-safe language: capital relationships are private, by
// invitation, individually discussed, never marketed. No "Invest Now",
// no "Investor Returns", no "Passive Income", no "Guaranteed", no
// "Principal Protected" outside of negative disclosure clauses.

export default function CapitalPage() {
  useSEO({
    title: "Capital Partnerships",
    description:
      "Private capital relationships under written agreement. Conversations are individual, by introduction. Not a public solicitation.",
    image: "/og/capital.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-[hsl(var(--charcoal))] text-cream pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Capital Partnerships
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            Capital is a relationship, not a product.
          </h1>
          <p className="font-serif text-xl text-white/85 italic leading-snug max-w-2xl mb-6">
            We do not sell securities. We do not run a fund. We have private conversations with
            individuals we already know, under written agreement, deal by deal.
          </p>
          <p className="text-base text-white/70 max-w-2xl leading-relaxed">
            This page is informational only. Nothing here is an offer, recommendation, or
            solicitation. There is no public investment product.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-4">
          <Block
            icon={<MessageSquare className="w-5 h-5" />}
            title="Conversations, not pitches."
            body="A capital conversation begins after a personal introduction. We discuss the deal, the structure, the timing, the risk, and the roles in detail before any document is drafted."
          />
          <Block
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Written agreement on every deal."
            body="If both sides decide to move forward, the structure is documented in a written agreement reviewed by counsel before any capital moves. No handshake deals, no boilerplate forms."
          />
          <Block
            icon={<Lock className="w-5 h-5" />}
            title="Private, individual, and on the record."
            body="Pegasus does not advertise capital opportunities. Every relationship is private and individual. Nothing on this site is an offer of guaranteed returns or principal protected investment products."
          />
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="border border-border/40 rounded-lg p-8 bg-card flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-2">How it starts</p>
              <p className="font-serif text-2xl font-semibold tracking-tight mb-2">Personal introduction required.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Every capital conversation begins after a personal introduction to Apollo. There is no general application. If you have been referred, reach out directly.</p>
            </div>
            <div className="flex-shrink-0 space-y-2 text-sm">
              <a href="mailto:apollo@pegasusdreamscapes.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary/70" />
                apollo@pegasusdreamscapes.com
              </a>
              <a href="tel:+19257448525" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary/70" />
                925-744-8525
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[hsl(var(--stone))] border-y border-border">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-5">
            Already in conversation with Apollo?
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Reach Apollo directly. There is no general inquiry form for capital. That is by design.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-capital-contact"
            >
              Contact Apollo
              <ArrowRight className="ml-3 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Block({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-6 p-7 rounded-lg border border-border/40 bg-card hover:border-primary/25 transition-colors duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-md border border-primary/20 bg-primary/5 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-xl font-semibold mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
