import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import { Building2, Hammer, DollarSign, Banknote, Network, MessageSquare } from "lucide-react";

// Empire Doctrine v1.0.1 — Apollo's personal QR landing.
// Six routing buttons. Public Peggy chat is explicitly excluded (v1.1).
// Wave 3: 56px+ tap targets, visible :active/:focus-visible state, and
// every click is attributed via trackCtaClick(source, label).

const ROUTES = [
  {
    href: "/submit?intent=property",
    label: "I have a property situation",
    sub: "Bring us the address and the situation.",
    icon: Building2,
  },
  {
    href: "/development",
    label: "I want to build, renovate, or develop",
    sub: "Pegasus Development. Phased trajectory.",
    icon: Hammer,
  },
  {
    href: "/submit?intent=sell",
    label: "I want to sell a property",
    sub: "Strategy-first review across every lane.",
    icon: DollarSign,
  },
  {
    href: "/capital",
    label: "I am interested in capital partnerships",
    sub: "Private, individual conversations only.",
    icon: Banknote,
  },
  {
    href: "/vendor-network",
    label: "I am a vendor or operator",
    sub: "Join the Pegasus Vendor Network.",
    icon: Network,
  },
  {
    href: "/contact",
    label: "I just want to talk to Apollo",
    sub: "Direct line. apollo@pegasusdreamscapes.com.",
    icon: MessageSquare,
  },
];

export default function ConnectPage() {
  useSEO({
    title: "Connect with Apollo",
    description:
      "You found Apollo's card. Tell us why you reached out: submit a property, build, sell, capital, vendor, or just talk. Every path gets a serious response.",
  });

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          Pegasus DreamScapes · Apollo
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-foreground leading-tight mb-6">
          What brought you here?
        </h1>
        <p className="font-serif text-lg text-muted-foreground italic mb-12 max-w-xl mx-auto">
          Pick the route that fits. We will get you to the right place.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-12 space-y-3">
        {ROUTES.map((r) => {
          const Icon = r.icon;
          const slug = r.label.toLowerCase().split(" ").slice(0, 4).join("-");
          return (
            <Link key={r.href} href={r.href}>
              <a
                onClick={() => trackCtaClick("connect", r.label, r.href)}
                className="
                  group block min-h-[56px] rounded-md border border-border bg-card
                  px-5 sm:px-6 py-4 sm:py-5
                  transition-colors transition-transform duration-150
                  hover:border-primary hover:bg-primary/[0.04]
                  active:scale-[0.99] active:bg-primary/[0.08] active:border-primary
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                "
                data-testid={`link-connect-${slug}`}
              >
                <div className="flex items-start gap-5">
                  <span className="shrink-0 w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center group-active:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xl text-foreground group-hover:text-primary group-active:text-primary transition-colors">
                      {r.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{r.sub}</p>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
