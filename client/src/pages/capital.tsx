import { useSEO } from "@/hooks/use-seo";
import { CAPITAL_RELATIONSHIP_FORM, LeadForm } from "@/pegasus/forms";
import { ShieldCheck, MessageSquare, Lock, Mail, Phone } from "lucide-react";

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
            Pegasus handles potential relationships privately and individually, beginning with
            an existing relationship or a personal introduction.
          </p>
          <p className="text-base text-white/70 max-w-2xl leading-relaxed">
            This page provides relationship context only. Nothing here is an offer,
            recommendation, solicitation, or commitment, and no submission creates access or
            eligibility.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-4">
          <Block
            icon={<MessageSquare className="w-5 h-5" />}
            title="Conversations, not pitches."
            body="A conversation begins with an existing relationship or a personal introduction. Project details, roles, risks, and possible next steps are discussed only if that relationship progresses."
          />
          <Block
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Separate diligence and documents."
            body="Any later opportunity would require its own diligence, eligibility checks, and written terms. A conversation or form submission is not an agreement or a commitment by either side."
          />
          <Block
            icon={<Lock className="w-5 h-5" />}
            title="Private, individual, and on the record."
            body="Pegasus does not publish project terms through this page. Each introduction is handled individually, and any later discussion remains conditional on fit, capacity, and the required documentation."
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

      <section
        id="capital-introduction"
        className="scroll-mt-24 py-20 bg-[hsl(var(--stone))] border-y border-border"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-4">
              Existing relationship or personal introduction
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-5">
              Continue the relationship privately.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              This is not a general application. Use it only to identify who connected you and
              provide the relationship context Apollo needs to recognize the introduction.
            </p>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Do not include account details, tax identifiers, or other sensitive financial
              information.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="lead-card p-6 sm:p-8 lg:p-10">
              <LeadForm cfg={CAPITAL_RELATIONSHIP_FORM} />
            </div>
          </div>
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
